import { Controller, Post, Get, Put, Delete, Body, Param, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Auth0Guard } from '@/account/guards/auth0.guard';
import { CreateLikeDto } from './dto/create-like.dto';
import { Request } from 'express';
import { use } from 'passport';
import { AccountService } from '@/account/account.service';
import { profile } from 'console';
import { AccountProfile } from '@/account/accountProfile.chema';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly accountService: AccountService
  ) {}

  @Post('create')
  @UseGuards(Auth0Guard)
  @UsePipes(new ValidationPipe())
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
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
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }

  @Put('like')
  @UsePipes(new ValidationPipe())
  @UseGuards(Auth0Guard)
  async like(@Req() req: Request & { user: any }, @Body() dto: CreateLikeDto) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    const postId = dto.post;
    return this.postService.likePost(userId, postId, dto.action);
  }

  @Delete('like')
  @UsePipes(new ValidationPipe())
  @UseGuards(Auth0Guard)
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
  }

  @Get('isliked')
  @UseGuards(Auth0Guard)
  async isLiked(@Req() req: Request & { user: any }, @Body() dto: Partial<CreateLikeDto>) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    const postId = dto.post;
    return this.postService.isLiked(userId, postId);
  }
}
