import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CachedAuth0Guard } from './guards/cached-auth0.guard';
import { Request } from 'express';
import { AccountProfile } from './accountProfile.chema';
import { AccountService } from './account.service';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly accountService: AccountService,
  ) {}

  @Get()
  @UseGuards(CachedAuth0Guard)
  async getNotifications(@Req() req: Request & { user: any }) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    
    return this.notificationService.getNotificationsByUser(userId);
  }

  @Get('count')
  @UseGuards(CachedAuth0Guard)
  async getUnreadCount(@Req() req: Request & { user: any }) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    
    return {
      count: await this.notificationService.getUnreadNotificationsCount(userId),
    };
  }

  @Post(':id/read')
  @UseGuards(CachedAuth0Guard)
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markNotificationAsRead(id);
  }

  @Post('read-all')
  @UseGuards(CachedAuth0Guard)
  async markAllAsRead(@Req() req: Request & { user: any }) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    
    await this.notificationService.markAllNotificationsAsRead(userId);
    return { success: true };
  }
  @Delete(':id')
  @UseGuards(CachedAuth0Guard)
  async deleteNotification(@Param('id') id: string) {
    await this.notificationService.deleteNotification(id);
    return { success: true };
  }
  
  @Post('test-add')
  async addTestNotification(@Body() dto: { 
    recipientId: string; 
    message: string; 
    type?: string;
    postId?: string;
    senderId?: string;
  }) {
    try {
      const notification = await this.notificationService.addTestNotification(dto);
      return { 
        success: true, 
        message: 'Test notification added successfully', 
        notification 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to add test notification: ${error.message}` 
      };
    }
  }
}
