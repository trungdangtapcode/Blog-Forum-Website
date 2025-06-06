import { Controller, Get, Post, Body, Param, Put, Query, UseGuards, Request } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { ConversationDto } from './dto/conversation.dto';
import { CachedAuth0Guard } from '../account/guards/cached-auth0.guard';
import { AccountService } from '../account/account.service';
import { AccountProfile } from '../account/accountProfile.chema';

@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly accountService: AccountService
  ) {}
  
  @UseGuards(CachedAuth0Guard)
  @Post()
  async createMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    console.log('User from request:', req.user);
    
    if (!req.user || !req.user.email) {
      throw new Error('User email is missing in the request');
    }
    
    const email = req.user.email;
    console.log('Getting profile for email:', email);
    
    // Get the user profile using the email
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    
    console.log('Using user ID for message sender:', userId);
    return this.messageService.createMessage(userId, createMessageDto);}  @UseGuards(CachedAuth0Guard)
  @Get('conversations')
  async getUserConversations(@Request() req) {
    if (!req.user || !req.user.email) {
      throw new Error('User email is missing in the request');
    }
    
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    
    return this.messageService.getUserConversations(userId);}  @UseGuards(CachedAuth0Guard)
  @Post('conversation')
  async getConversation(
    @Request() req,
    @Body() conversationDto: ConversationDto,
  ) {
    if (!req.user || !req.user.email) {
      throw new Error('User email is missing in the request');
    }
    
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    
    return this.messageService.getConversation(
      userId,
      conversationDto.userId,
      conversationDto.limit || 20,
      conversationDto.offset || 0,
    );}  @UseGuards(CachedAuth0Guard)
  @Put('read')
  async markAsRead(@Request() req, @Body() conversationDto: ConversationDto) {
    if (!req.user || !req.user.email) {
      throw new Error('User email is missing in the request');
    }
    
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    
    await this.messageService.markAsRead(userId, conversationDto.userId);
    return { success: true };
  }
}
