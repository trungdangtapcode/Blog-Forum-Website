import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './notification.schema';
import { Follow } from './follow.schema';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class NotificationService {  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
    @InjectModel(Follow.name) private readonly followModel: Model<Follow>,
    @Inject(forwardRef(() => MailerService)) private readonly mailerService: MailerService,
  ) {}

  async createNotification(dto: {
    recipient: string;
    type: string;
    message: string;
    postId?: string;
    senderId?: string;
    sendEmail?: boolean;
  }): Promise<Notification> {
    const notification = new this.notificationModel({
      recipient: dto.recipient,
      type: dto.type,
      message: dto.message,
      postId: dto.postId,
      senderId: dto.senderId,
      read: false,
      createdAt: new Date(),
    });

    // Save notification to database
    await notification.save();

    // Send email notification if requested
    if (dto.sendEmail && dto.postId && dto.type === 'new-post') {
      try {
        await this.mailerService.sendPostNotification(dto.recipient, dto.message, dto.postId);
      } catch (error) {
        console.error('Failed to send email notification:', error);
      }
    }

    return notification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('senderId', 'fullName avatar')
      .exec();
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      recipient: userId,
      read: false,
    }).exec();
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true },
    ).exec();
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { recipient: userId, read: false },
      { read: true },
    ).exec();
  }
  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(notificationId).exec();
  }
  
  // This method is for testing - create a notification for a specific account
  async addTestNotification(dto: {
    recipientId: string;
    message: string;
    type?: string;
    postId?: string;
    senderId?: string;
  }): Promise<Notification> {
    return this.createNotification({
      recipient: dto.recipientId,
      type: dto.type || 'test',
      message: dto.message,
      postId: dto.postId,
      senderId: dto.senderId,
      sendEmail: false,
    });
  }

  // This method will be called when a user creates a new post
  async notifyFollowersOfNewPost(authorId: string, postId: string, postTitle: string): Promise<void> {
    // Get all followers of the author
    const followers = await this.followModel
      .find({ following: authorId })
      .exec();

    // Create a notification for each follower
    const notificationPromises = followers.map(follow => {
      const message = `New post: ${postTitle}`;
      return this.createNotification({
        recipient: typeof follow.follower === 'string' ? follow.follower : follow.follower._id.toString(),
        type: 'new-post',
        message: message,
        postId: postId,
        senderId: authorId,
        sendEmail: true,
      });
    });

    await Promise.all(notificationPromises);
  }
}
