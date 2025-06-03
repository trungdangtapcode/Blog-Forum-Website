import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SavePostService } from './savepost.service';
import { SavePostDto } from './dto/save-post.dto';
import { CachedAuth0Guard } from '@/account/guards/cached-auth0.guard';
import { Request } from 'express';
import { AccountService } from '@/account/account.service';
import { AccountProfile } from '@/account/accountProfile.chema';

@Controller('post/save')
export class SavePostController {
  constructor(
    private readonly savePostService: SavePostService,
    private readonly accountService: AccountService
  ) {}

  @Post()
  @UseGuards(CachedAuth0Guard)
  @UsePipes(new ValidationPipe())
  async savePost(@Req() req: Request & { user: any }, @Body() savePostDto: SavePostDto) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    
    return this.savePostService.savePost(userId, savePostDto.post);
  }

  @Delete()
  @UseGuards(CachedAuth0Guard)
  @UsePipes(new ValidationPipe())
  async unsavePost(@Req() req: Request & { user: any }, @Body() savePostDto: SavePostDto) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    
    return this.savePostService.unsavePost(userId, savePostDto.post);
  }

  @Post('check')
  @UseGuards(CachedAuth0Guard)
  @UsePipes(new ValidationPipe())
  async isSaved(@Req() req: Request & { user: any }, @Body() savePostDto: SavePostDto) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    
    return this.savePostService.isSaved(userId, savePostDto.post);
  }

  @Get()
  @UseGuards(CachedAuth0Guard)
  async getSavedPosts(@Req() req: Request & { user: any }) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    
    return this.savePostService.getSavedPosts(userId);
  }
}
