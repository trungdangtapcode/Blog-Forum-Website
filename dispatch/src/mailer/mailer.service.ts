import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { AccountProfile } from '../account/accountProfile.chema';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(AccountProfile.name) private readonly accountModel: Model<AccountProfile>,
  ) {
    // Create reusable transporter object using SMTP transport
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get('MAIL_PORT', 587),
      secure: this.configService.get('MAIL_SECURE', false) === 'true',
      auth: {
        user: this.configService.get('MAIL_USER', ''),
        pass: this.configService.get('MAIL_PASSWORD', ''),
      },
    });
  }

  async getAccountById(id: string): Promise<AccountProfile | null> {
    return this.accountModel.findById(id).exec();
  }

  async getAccountByEmail(email: string): Promise<AccountProfile | null> {
    return this.accountModel.findOne({ email }).exec();
  }

  async sendDirectEmail(email: string, subject: string, content: string): Promise<boolean> {
    try {
      // Validate email address format
      if (!email || !this.isValidEmail(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }

      // Send mail with defined transport object
      await this.transporter.sendMail({
        from: `"${this.configService.get('MAIL_FROM_NAME', 'Blog Forum')}" <${this.configService.get('MAIL_FROM_ADDRESS', 'noreply@blogforum.com')}>`,
        to: email,
        subject: subject,
        text: content, // plain text body
        html: `<div>${content}</div>`, // html body
      });

      return true;
    } catch (error) {
      console.error('Error sending direct email:', error);
      return false;
    }
  }
  
  // Helper method to validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async sendEmailToAccount(accountId: string, subject: string, content: string): Promise<boolean> {
    try {
      const account = await this.getAccountById(accountId);
      
      if (!account || !account.email) {
        throw new Error(`Account not found or email address is missing for ID: ${accountId}`);
      }

      // Send mail with defined transport object
      await this.transporter.sendMail({
        from: `"${this.configService.get('MAIL_FROM_NAME', 'Blog Forum')}" <${this.configService.get('MAIL_FROM_ADDRESS', 'noreply@blogforum.com')}>`,
        to: account.email,
        subject: subject,
        text: content, // plain text body
        html: `<div>${content}</div>`, // html body
      });

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
  
  async sendVerificationEmail(accountId: string): Promise<boolean> {
    const account = await this.getAccountById(accountId);
    
    if (!account) {
      return false;
    }
    
    const subject = 'Welcome to Blog Forum - Email Verification';
    const content = `
      <div>
        <h1>Welcome to Blog Forum!</h1>
        <p>Hello ${account.fullName || 'User'},</p>
        <p>Thank you for joining our community. Please verify your email address by clicking the button below:</p>
        <p>
          <a 
            href="http://localhost:3000/verify-email?token=${accountId}" 
            style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;"
          >
            Verify Email
          </a>
        </p>
        <p>If you did not create this account, please ignore this email.</p>
        <p>Best regards,<br>The Blog Forum Team</p>
      </div>
    `;
    
    return this.sendEmailToAccount(accountId, subject, content);
  }
  
  async sendPostNotification(accountId: string, postTitle: string, postId: string): Promise<boolean> {
    const account = await this.getAccountById(accountId);
    
    if (!account) {
      return false;
    }
    
    const subject = 'New Post Notification - Blog Forum';
    const content = `
      <div>
        <h1>New Post Notification</h1>
        <p>Hello ${account.fullName || 'User'},</p>
        <p>A new post has been published that might interest you:</p>
        <h2>${postTitle}</h2>
        <p>
          <a 
            href="http://localhost:3000/posts/${postId}" 
            style="padding: 10px 15px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px;"
          >
            Read Post
          </a>
        </p>
        <p>Best regards,<br>The Blog Forum Team</p>
      </div>
    `;
    
    return this.sendEmailToAccount(accountId, subject, content);
  }
}
