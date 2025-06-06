import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}  async createMessage(userId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    if (!userId) {
      throw new Error('Sender ID is required but was not provided');
    }
    
    if (!createMessageDto.receiver) {
      throw new Error('Receiver ID is required');
    }
    
    if (!createMessageDto.content || createMessageDto.content.trim() === '') {
      throw new Error('Message content cannot be empty');
    }
    
    console.log('Creating message with sender ID:', userId);
    console.log('Message DTO:', createMessageDto);

    const newMessage = new this.messageModel({
      sender: userId,
      receiver: createMessageDto.receiver,
      content: createMessageDto.content,
    });
    
    try {
      return await newMessage.save();
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  async getConversation(userId: string, otherUserId: string, limit = 20, offset = 0): Promise<Message[]> {
    return this.messageModel.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async getUserConversations(userId: string): Promise<any[]> {
    // Find all distinct conversations the user has participated in
    const sentMessages = await this.messageModel.aggregate([
      { $match: { sender: userId } },
      { $group: { _id: "$receiver" } },
    ]);

    const receivedMessages = await this.messageModel.aggregate([
      { $match: { receiver: userId } },
      { $group: { _id: "$sender" } },
    ]);

    // Combine unique conversation partners
    const conversationPartners = new Set([
      ...sentMessages.map(msg => msg._id.toString()),
      ...receivedMessages.map(msg => msg._id.toString())
    ]);

    const conversations = [];

    // For each conversation partner, get the most recent message
    for (const partnerId of conversationPartners) {
      const lastMessage = await this.messageModel.findOne({
        $or: [
          { sender: userId, receiver: partnerId },
          { sender: partnerId, receiver: userId },
        ],
      }).sort({ createdAt: -1 }).exec();

      if (lastMessage) {
        conversations.push({
          partnerId,
          lastMessage,
          unreadCount: await this.countUnreadMessages(userId, partnerId),
        });
      }
    }

    // Sort conversations by the timestamp of the most recent message
    return conversations.sort((a, b) => 
      b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
    );
  }

  async markAsRead(userId: string, conversationPartnerId: string): Promise<void> {
    await this.messageModel.updateMany(
      { sender: conversationPartnerId, receiver: userId, read: false },
      { $set: { read: true } }
    ).exec();
  }

  async countUnreadMessages(userId: string, senderId: string): Promise<number> {
    return this.messageModel.countDocuments({
      sender: senderId,
      receiver: userId,
      read: false,
    }).exec();
  }
}
