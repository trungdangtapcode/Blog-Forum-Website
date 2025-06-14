import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentTransaction, PaymentStatus } from './payment-transaction.schema';
import * as crypto from 'crypto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { AccountService } from '../account/account.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  // MoMo API configuration - these would normally be in environment variables
  private readonly momoEndpoint = 'https://test-payment.momo.vn/v2/gateway/api';
  private readonly partnerCode: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly redirectUrl: string;
  private readonly ipnUrl: string;

  constructor(
    @InjectModel(PaymentTransaction.name)
    private paymentTransactionModel: Model<PaymentTransaction>,
    private configService: ConfigService,
    private accountService: AccountService,
  ) {
    // Initialize MoMo configuration from environment variables
    this.partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE') || 'MOMO';
    this.accessKey = this.configService.get<string>('MOMO_ACCESS_KEY') || 'F8BBA842ECF85';
    this.secretKey = this.configService.get<string>('MOMO_SECRET_KEY') || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    this.redirectUrl = this.configService.get<string>('MOMO_REDIRECT_URL') || 'http://localhost:3000/payment/result';
    this.ipnUrl = this.configService.get<string>('MOMO_IPN_URL') || 'http://localhost:3333/payment/callback';
  }

  async createCreditPurchase(userId: string, userEmail: string, creditAmount: number) {
    if (creditAmount < 1 || creditAmount > 10) {
      throw new BadRequestException('Credit amount must be between 1 and 10');
    }

    // Amount in VND (1 credit = 1000 VND)
    const amount = creditAmount * 1000;
    
    // Create a unique orderId using partnerCode and timestamp
    const orderId = this.partnerCode + new Date().getTime();
    const requestId = orderId;
    
    // Create payment transaction record
    const transaction = await this.paymentTransactionModel.create({
      orderId,
      userId,
      userEmail,
      amount,
      creditAmount,
      status: PaymentStatus.PENDING,
    });

    // Generate the MoMo payment request
    const paymentUrl = await this.createMomoPaymentRequest(orderId, requestId, amount);
    
    // Update transaction with payment URL
    transaction.paymentUrl = paymentUrl;
    await transaction.save();
    
    return transaction;
  }

  private async createMomoPaymentRequest(orderId: string, requestId: string, amount: number): Promise<string> {
    // Preparing request parameters
    const orderInfo = `Purchase ${amount/1000} credits`;
    const extraData = '';
    const requestType = 'captureWallet';
    
    // Creating signature
    const rawSignature = 
      'accessKey=' + this.accessKey +
      '&amount=' + amount +
      '&extraData=' + extraData +
      '&ipnUrl=' + this.ipnUrl +
      '&orderId=' + orderId +
      '&orderInfo=' + orderInfo +
      '&partnerCode=' + this.partnerCode +
      '&redirectUrl=' + this.redirectUrl +
      '&requestId=' + requestId +
      '&requestType=' + requestType;
    
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');
    
    // Create request body
    const requestBody = {
      partnerCode: this.partnerCode,
      partnerName: 'Blog Forum',
      storeId: 'BlogForumStore',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: this.redirectUrl,
      ipnUrl: this.ipnUrl,
      lang: 'en',
      requestType: requestType,
      autoCapture: true,
      extraData: extraData,
      signature: signature,
    };
    
    try {
      const response = await axios.post(
        `${this.momoEndpoint}/create`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data && response.data.payUrl) {
        return response.data.payUrl;
      } else {
        this.logger.error('Failed to create MoMo payment request', response.data);
        throw new BadRequestException('Failed to create payment request');
      }
    } catch (error) {
      this.logger.error('Error creating MoMo payment request', error);
      throw new BadRequestException('Error creating payment request');
    }
  }
  async handlePaymentCallback(callbackData: any) {
    this.logger.log('Payment callback received', callbackData);
    
    const { orderId, resultCode, amount, transId, signature } = callbackData;
    
    // Find the transaction
    const transaction = await this.paymentTransactionModel.findOne({ orderId });
    if (!transaction) {
      this.logger.error(`Transaction not found for orderId: ${orderId}`);
      throw new NotFoundException(`Transaction not found for orderId: ${orderId}`);
    }
    
    // Verify the callback signature
    if (!this.verifyCallbackSignature(callbackData)) {
      this.logger.error(`Invalid signature for orderId: ${orderId}`);
      throw new BadRequestException('Invalid signature');
    }
    
    // Verify amount matches
    if (parseInt(amount) !== transaction.amount) {
      this.logger.error(`Amount mismatch for orderId: ${orderId}. Expected: ${transaction.amount}, Received: ${amount}`);
      throw new BadRequestException('Amount mismatch');
    }
    
    // Check for duplicate processing
    if (transaction.status !== PaymentStatus.PENDING) {
      this.logger.warn(`Transaction ${orderId} has already been processed with status: ${transaction.status}`);
      return transaction;
    }
    
    // Update transaction based on response
    if (resultCode === 0) {
      // Payment successful
      transaction.status = PaymentStatus.SUCCESS;
      transaction.paidAt = new Date();
      transaction.momoResponse = callbackData;
      await transaction.save();
      
      try {
        // Add credits to user's account
        await this.accountService.addCredits(transaction.userId, transaction.creditAmount);
        this.logger.log(`Payment successful for orderId: ${orderId}, added ${transaction.creditAmount} credits to user ${transaction.userId}`);
      } catch (error) {
        this.logger.error(`Failed to add credits for orderId: ${orderId}`, error);
        // Mark that there was an error adding credits, but payment was successful
        transaction.creditError = true;
        await transaction.save();
      }
    } else {
      // Payment failed
      transaction.status = PaymentStatus.FAILED;
      transaction.momoResponse = callbackData;
      await transaction.save();
      
      this.logger.warn(`Payment failed for orderId: ${orderId}, resultCode: ${resultCode}`);
    }
    
    return transaction;
  }

  async checkTransactionStatus(orderId: string) {
    // Find the transaction in our database first
    const transaction = await this.paymentTransactionModel.findOne({ orderId });
    if (!transaction) {
      throw new NotFoundException(`Transaction not found for orderId: ${orderId}`);
    }
    
    // If transaction is already marked as success or failed, return it
    if (transaction.status !== PaymentStatus.PENDING) {
      return transaction;
    }
    
    // Otherwise, check with MoMo
    const requestId = orderId;
    
    // Create signature
    const rawSignature = `accessKey=${this.accessKey}&orderId=${orderId}&partnerCode=${this.partnerCode}&requestId=${requestId}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');
    
    // Create request body
    const requestBody = {
      partnerCode: this.partnerCode,
      requestId: requestId,
      orderId: orderId,
      signature: signature,
      lang: 'en',
    };
    
    try {
      const response = await axios.post(
        `${this.momoEndpoint}/query`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const momoResponse = response.data;
      
      // Update transaction based on response
      if (momoResponse.resultCode === 0) {
        // Payment successful
        transaction.status = PaymentStatus.SUCCESS;
        transaction.paidAt = new Date();
        transaction.momoResponse = momoResponse;
        await transaction.save();
        
        // Add credits to user's account if not already done
        await this.accountService.addCredits(transaction.userId, transaction.creditAmount);
        
        this.logger.log(`Payment confirmed successful for orderId: ${orderId}`);
      } else if (momoResponse.resultCode !== 9000) { // 9000 means still pending
        // Payment failed
        transaction.status = PaymentStatus.FAILED;
        transaction.momoResponse = momoResponse;
        await transaction.save();
        
        this.logger.warn(`Payment confirmed failed for orderId: ${orderId}, resultCode: ${momoResponse.resultCode}`);
      }
      
      return transaction;
    } catch (error) {
      this.logger.error('Error checking transaction status with MoMo', error);
      throw new BadRequestException('Error checking transaction status');
    }
  }
  
  async getUserTransactions(userId: string) {
    return this.paymentTransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllTransactions() {
    return this.paymentTransactionModel.find().sort({ createdAt: -1 }).exec();
  }

  private verifyCallbackSignature(callbackData: any): boolean {
    try {
      const { signature, ...otherData } = callbackData;
      
      // Sort keys alphabetically
      const keys = Object.keys(otherData).sort();
      
      // Build raw signature string
      let rawSignature = '';
      for (const key of keys) {
        // Skip certain fields as per MoMo's documentation
        if (key !== 'signature' && otherData[key] !== undefined && otherData[key] !== null && otherData[key] !== '') {
          rawSignature += `&${key}=${otherData[key]}`;
        }
      }
      
      // Remove leading '&' if present
      if (rawSignature.startsWith('&')) {
        rawSignature = rawSignature.substring(1);
      }
      
      // Create signature
      const calculatedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(rawSignature)
        .digest('hex');
      
      return signature === calculatedSignature;
    } catch (error) {
      this.logger.error('Error verifying callback signature', error);
      return false;
    }
  }

  async retryFailedCreditAdditions() {
    this.logger.log('Checking for transactions with failed credit additions');
    
    // Find successful payments where credits weren't added
    const failedTransactions = await this.paymentTransactionModel.find({
      status: PaymentStatus.SUCCESS,
      creditError: true,
      retryCount: { $lt: 5 } // Limit to 5 retry attempts
    }).exec();
    
    if (failedTransactions.length === 0) {
      return { message: 'No transactions needing retry', count: 0 };
    }
    
    let successCount = 0;
    
    for (const transaction of failedTransactions) {
      try {
        // Increment retry count
        transaction.retryCount += 1;
        await transaction.save();
        
        // Try to add credits again
        await this.accountService.addCredits(transaction.userId, transaction.creditAmount);
        
        // Mark as resolved if successful
        transaction.creditError = false;
        await transaction.save();
        
        successCount++;
        this.logger.log(`Successfully retried credit addition for orderId: ${transaction.orderId}`);
      } catch (error) {
        this.logger.error(`Failed to retry credit addition for orderId: ${transaction.orderId}`, error);
      }
    }
    
    return { 
      message: `Completed retry process. Success: ${successCount}/${failedTransactions.length}`,
      count: successCount
    };
  }

  // Helper method to get user ID from email
  async getUserIdFromEmail(email: string): Promise<string> {
    try {
      const profile = await this.accountService.getProfile(email);
      if (!profile) {
        throw new NotFoundException(`Profile not found for email: ${email}`);
      }
      return profile._id.toString();
    } catch (error) {
      this.logger.error(`Error getting user ID from email: ${error.message}`);
      throw error;
    }
  }

  // Helper method to get the full user profile by email
  async getProfileByEmail(email: string) {
    try {
      const profile = await this.accountService.getProfile(email);
      if (!profile) {
        throw new NotFoundException(`Profile not found for email: ${email}`);
      }
      return profile;
    } catch (error) {
      this.logger.error(`Error getting profile by email: ${error.message}`);
      throw error;
    }
  }
}
