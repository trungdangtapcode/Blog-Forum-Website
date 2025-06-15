import { Controller, Post, Body, Get, UseGuards, Req, Param, UsePipes, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CachedAuth0Guard } from '../account/guards/cached-auth0.guard';
import { CreateCreditPurchaseDto, PaymentCallbackDto } from './dto/payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('create-credit-purchase')
  @UseGuards(CachedAuth0Guard)
  @UsePipes(new ValidationPipe())
  async createCreditPurchase(
    @Req() req: Request & { user: any },
    @Body() body: CreateCreditPurchaseDto
  ) {
    const email = req.user.email;
    
    // Get the user ID from email using the account service
    const userId = await this.paymentService.getUserIdFromEmail(email);
    
    return this.paymentService.createCreditPurchase(
      userId,
      email,
      body.creditAmount
    );
  }
  
  @Post('callback')
  async handleCallback(@Body() callbackData: PaymentCallbackDto) {
    return this.paymentService.handlePaymentCallback(callbackData);
  }
  
  @Get('check-status/:orderId')
  @UseGuards(CachedAuth0Guard)
  async checkStatus(@Param('orderId') orderId: string) {
    return this.paymentService.checkTransactionStatus(orderId);
  }
  
  @Get('transactions')
  @UseGuards(CachedAuth0Guard)
  async getUserTransactions(@Req() req: Request & { user: any }) {
    const email = req.user.email;
    
    // Get the user ID from email using the account service
    const userId = await this.paymentService.getUserIdFromEmail(email);
    
    return this.paymentService.getUserTransactions(userId);
  }
  @Post('retry-credit-additions')
  @UseGuards(CachedAuth0Guard)
  async retryFailedCreditAdditions(@Req() req: Request & { user: any }) {
    const email = req.user.email;
    
    // Check if user is admin
    const profile = await this.paymentService.getProfileByEmail(email);
    if (!profile.isAdmin) {
      throw new UnauthorizedException('Unauthorized - Admin access required');
    }
    
    return this.paymentService.retryFailedCreditAdditions();
  }

  @Get('admin/all-transactions')
  @UseGuards(CachedAuth0Guard)
  async getAllTransactions(@Req() req: Request & { user: any }) {
    const email = req.user.email;
    
    // Check if user is admin
    const profile = await this.paymentService.getProfileByEmail(email);
    if (!profile.isAdmin) {
      throw new UnauthorizedException('Unauthorized - Admin access required');
    }
    
    return this.paymentService.getAllTransactions();
  }
}
