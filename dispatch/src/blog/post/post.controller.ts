import { Controller, Post, Get, Put, Delete, Body, Param, UsePipes, ValidationPipe, UseGuards, Req, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CachedAuth0Guard } from '@/account/guards/cached-auth0.guard';
import { CreateLikeDto } from './dto/create-like.dto';
import { Request } from 'express';
import { use } from 'passport';
import { AccountService } from '@/account/account.service';
import { AccountProfile } from '@/account/accountProfile.chema';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly accountService: AccountService
  ) {}
  @Post('create')
  @UseGuards(CachedAuth0Guard)
  @UsePipes(new ValidationPipe())
  async create(@Req() req: Request & { user: any }, @Body() createPostDto: CreatePostDto) {
    console.log('hiiii', createPostDto)
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    return this.postService.create({...createPostDto, author: userId});
  }

  @Get('get')
  findAll() {
    return this.postService.findAll();
  }

  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }
  @Put('update/:id')
  @UseGuards(CachedAuth0Guard)
  @UsePipes(new ValidationPipe())
  async update(
    @Req() req: Request & { user: any }, 
    @Param('id') id: string, 
    @Body() updatePostDto: UpdatePostDto
  ) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    
    // Check if user is the author of the post
    const isAuthor = await this.postService.isAuthor(id, userId);
    
    if (!isAuthor) {
      throw new UnauthorizedException('You are not the author of this post');
    }
    
    return this.postService.update(id, updatePostDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
  @Put('like')
  @UsePipes(new ValidationPipe())
  @UseGuards(CachedAuth0Guard)
  async like(@Req() req: Request & { user: any }, @Body() dto: CreateLikeDto) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    const postId = dto.post;
    return this.postService.likePost(userId, postId, dto.action);
  }
  @Delete('like')
  @UsePipes(new ValidationPipe())
  @UseGuards(CachedAuth0Guard)
  async unlike(@Req() req: Request & { user: any }, @Body() dto: Partial<CreateLikeDto>) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    const postId = dto.post;
    return this.postService.unlikePost(userId, postId);
  }

  @Get('like')
  async countLikes(@Body() dto: CreateLikeDto) {
    const postId = dto.post;
    return { count: await this.postService.countLikes(postId) };
  }  @Get('isliked')
  @UseGuards(CachedAuth0Guard)
  async isLiked(@Req() req: Request & { user: any }, @Body() dto: Partial<CreateLikeDto>) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    const postId = dto.post;
    return this.postService.isLiked(userId, postId);
  }
  @Post('isliked')
  @UseGuards(CachedAuth0Guard)
  async isLikedPost(@Req() req: Request & { user: any }, @Body() dto: Partial<CreateLikeDto>) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    const postId = dto.post;
    return this.postService.isLiked(userId, postId);
  } 
  
  @Get('isauthor/:postId')
  @UseGuards(CachedAuth0Guard)
  async checkIsAuthor(@Req() req: Request & { user: any }, @Param('postId') postId: string) {
    // console.log(`isauthor endpoint called with postId: ${postId}`);
    
    try {
      const email = req.user.email;
      // console.log(`User email: ${email}`);
      
      const profile: AccountProfile = await this.accountService.getProfile(email);
      const userId = profile._id as string;
      // console.log(`User ID from profile: ${userId}`);
      
      // Check if postId is valid before querying
      if (!postId) {
        console.warn('Invalid post ID provided');
        return { isAuthor: false, error: 'Invalid post ID' };
      }
      
      const isAuthor = await this.postService.isAuthor(postId, userId);
      // console.log(`isAuthor result: ${isAuthor}`);
      return { isAuthor };
    } catch (error) {
      console.error('Error checking author status:', error);
      return { isAuthor: false, error: 'Failed to check author status' };
    }
  }
}
