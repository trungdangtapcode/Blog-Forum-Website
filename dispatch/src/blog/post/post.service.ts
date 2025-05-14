import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './post.chema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Like } from './like.schema';
import e from 'express';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(Like.name) private likeModel: Model<Like>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const newPost = new this.postModel(createPostDto);
    return newPost.save();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.find().exec();
  }

  async findOne(id: string): Promise<Post | null> {
    return this.postModel.findById(id).exec();
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post | null> {
    return this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Post| null> {
    return this.postModel.findByIdAndDelete(id).exec();
  }

  async likePost(userId: string, postId: string, action: 'like'|'dislike'): Promise<Like> {
    // Check if user already liked the post
    const existing = await this.likeModel.findOne({ user: userId, post: postId });
    if (existing && action === existing.action) {
      throw new ConflictException('Post already liked by this user');
    }
    const coef = action=='like'?1:-1;
    if (existing) {
      existing.action = action;
      await existing.save();
      await this.postModel.findByIdAndUpdate(postId, { $inc: { likes: 2*coef } });
      return existing;
    } else {
      const createdLike = new this.likeModel({ user: userId, post: postId });
      await this.postModel.findByIdAndUpdate(postId, { $inc: { likes: coef } });
      return createdLike.save();
    }
  }

  async unlikePost(userId: string, postId: string): Promise<{ deleted: boolean }> {
    const coef = (await this.likeModel.findOne({ user: userId, post: postId })).action=='like'?1:-1;
    const result = await this.likeModel.deleteOne({ user: userId, post: postId });
    await this.postModel.findByIdAndUpdate(postId, { $inc: { likes: -coef } });
    return { deleted: result.deletedCount > 0 };
  }

  async countLikes(postId: string): Promise<number> {
    return this.likeModel.countDocuments({ post: postId });
  }

  async isLiked(userId: string, postId: string) {
    const like = await this.likeModel.findOne({ user: userId, post: postId });
    if (like){
      return {action: like.action};
    }
    return null;
  }
}
