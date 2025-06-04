import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
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
    const newPost = new this.postModel({
      ...createPostDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return newPost.save();
  }
  async findAll(): Promise<Post[]> {
    return this.postModel.find().populate('author', 'name email avatar fullName').exec();
  }

  async findOne(id: string): Promise<Post | null> {
    return this.postModel.findById(id).populate('author', 'name email avatar').exec();
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
  
  
  async isAuthor(postId: string, userId: string): Promise<boolean> {
    // Handle invalid inputs
    if (!postId || !userId) {
      // console.log(`Invalid input: postId=${postId}, userId=${userId}`);
      return false;
    }

    try {
      // console.log(`Attempting to find post with ID: ${postId}`);
      
      // Validate MongoDB ObjectId format
      if (!this.isValidObjectId(postId)) {
        console.error(`Invalid MongoDB ObjectId format: ${postId}`);
        return false;
      }
      
      const post = await this.postModel.findById(postId).exec();
      
      if (!post) {
        // console.log(`Post not found with ID: ${postId}`);
        return false;
      }
      
      const authorId = post.author.toString();
      const result = authorId === userId.toString();
      // console.log(`Checking author: postId=${postId}, authorId=${authorId}, userId=${userId}, result=${result}`);
      return result;
    } catch (error) {
      console.error(`Error in isAuthor check: ${error}`);
      return false;
    }
  }
  
  async findByAuthor(authorId: string): Promise<Post[]> {
    try {
      // Validate MongoDB ObjectId format
      if (!this.isValidObjectId(authorId)) {
        console.error(`Invalid MongoDB ObjectId format for authorId: ${authorId}`);
        return [];
      }
      
      return this.postModel.find({ author: authorId })
        .populate('author', 'name email avatar fullName')
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
        .exec();
    } catch (error) {
      console.error(`Error finding posts by author: ${error}`);
      return [];
    }
  }
  // Helper method to validate MongoDB ObjectId format
  private isValidObjectId(id: string): boolean {
    try {
      // MongoDB ObjectId should be a 24-character hex string
      return /^[0-9a-fA-F]{24}$/.test(id);
    } catch (e) {
      return false;
    }
  }
  
  async verifyPost(postId: string, verify: boolean = true): Promise<Post | null> {
    console.log(postId)
    if (!this.isValidObjectId(postId)) {
      // Return error 400 if postId is not a valid ObjectId
      throw new BadRequestException('Invalid post ID format');
    }
    
    return this.postModel.findByIdAndUpdate(
      postId, 
      { isVerified: verify }, 
      { new: true }
    ).exec();
  }
}
