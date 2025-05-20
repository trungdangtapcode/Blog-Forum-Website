import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Req, 
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { VoteCommentDto } from './dto/vote-comment.dto';
import { Auth0Guard } from '@/account/guards/auth0.guard';
import { AccountService } from '@/account/account.service';
import { Request } from 'express';
import { AccountProfile } from '@/account/accountProfile.chema';

@Controller('post/comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly accountService: AccountService
  ) {}

  @Post('create')
  @UseGuards(Auth0Guard)
  @UsePipes(new ValidationPipe())
  async create(@Req() req: Request & { user: any }, @Body() createCommentDto: CreateCommentDto) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    return this.commentService.create(userId, createCommentDto);
  }

  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }

  @Get('post/:postId')
  findByPost(@Param('postId') postId: string) {
    return this.commentService.findByPost(postId);
  }

  @Put(':id')
  @UseGuards(Auth0Guard)
  @UsePipes(new ValidationPipe())
  async update(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    return this.commentService.update(userId, id, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(Auth0Guard)
  async remove(@Req() req: Request & { user: any }, @Param('id') id: string) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    return this.commentService.remove(userId, id);
  }

  @Post('vote')
  @UseGuards(Auth0Guard)
  @UsePipes(new ValidationPipe())
  async voteComment(@Req() req: Request & { user: any }, @Body() voteDto: VoteCommentDto) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    return this.commentService.voteComment(userId, voteDto);
  }

  @Get('vote/:commentId')
  @UseGuards(Auth0Guard)
  async getUserVote(@Req() req: Request & { user: any }, @Param('commentId') commentId: string) {
    const email = req.user.email;
    const profile: AccountProfile = await this.accountService.getProfile(email);
    const userId = profile._id as string;
    return this.commentService.getUserVote(userId, commentId);
  }
}
