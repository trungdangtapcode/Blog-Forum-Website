import { Controller, Post, Body, UseGuards, HttpException, HttpStatus, Req } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { CachedAuth0Guard } from '../account/guards/cached-auth0.guard';
import { Request } from 'express';

export class SendEmailDto {
  accountId: string;
  subject?: string;
  content?: string;
  emailType?: 'custom' | 'verification' | 'notification';
  postTitle?: string;
  postId?: string;
}

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('test-email')
  async testEmail(@Body() testEmailDto: { email: string, subject?: string, content?: string }) {
    try {
      const { email, subject = 'Test Email', content = 'This is a test email from Blog Forum' } = testEmailDto;
      
      if (!email) {
        throw new HttpException('Email address is required', HttpStatus.BAD_REQUEST);
      }
      
      // Use direct nodemailer sending without checking for account
      const result = await this.mailerService.sendDirectEmail(
        email, 
        subject, 
        content
      );
      
      if (!result) {
        throw new HttpException('Failed to send test email', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      return { success: true, message: 'Test email sent successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to send test email: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('send-email')
  @UseGuards(CachedAuth0Guard)
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    try {
      const { accountId, subject, content, emailType, postTitle, postId } = sendEmailDto;
      
      if (!accountId) {
        throw new HttpException('Account ID is required', HttpStatus.BAD_REQUEST);
      }
      
      let result: boolean;
      
      switch (emailType) {
        case 'verification':
          result = await this.mailerService.sendVerificationEmail(accountId);
          break;
        case 'notification':
          if (!postTitle || !postId) {
            throw new HttpException('Post title and ID are required for notification emails', HttpStatus.BAD_REQUEST);
          }
          result = await this.mailerService.sendPostNotification(accountId, postTitle, postId);
          break;
        case 'custom':
        default:
          if (!subject || !content) {
            throw new HttpException('Subject and content are required for custom emails', HttpStatus.BAD_REQUEST);
          }
          result = await this.mailerService.sendEmailToAccount(accountId, subject, content);
          break;
      }
      
      if (!result) {
        throw new HttpException('Failed to send email', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to send email: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('verify-account')
  @UseGuards(CachedAuth0Guard)
  async sendVerificationEmail(@Body() body: { accountId: string }) {
    try {
      const { accountId } = body;
      
      if (!accountId) {
        throw new HttpException('Account ID is required', HttpStatus.BAD_REQUEST);
      }
      
      const result = await this.mailerService.sendVerificationEmail(accountId);
      
      if (!result) {
        throw new HttpException('Failed to send verification email', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to send verification email: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('notify-post')
  @UseGuards(CachedAuth0Guard)
  async sendPostNotification(@Body() body: { accountId: string; postTitle: string; postId: string }) {
    try {
      const { accountId, postTitle, postId } = body;
      
      if (!accountId || !postTitle || !postId) {
        throw new HttpException('Account ID, post title, and post ID are required', HttpStatus.BAD_REQUEST);
      }
      
      const result = await this.mailerService.sendPostNotification(accountId, postTitle, postId);
      
      if (!result) {
        throw new HttpException('Failed to send post notification', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      return { success: true, message: 'Post notification sent successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to send post notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
