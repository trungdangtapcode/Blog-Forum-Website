import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SavedPost } from './savepost.schema';
import { AccountProfile } from '@/account/accountProfile.chema';
import { Post } from '../post.chema';

@Injectable()
export class SavePostService {
  constructor(
    @InjectModel(SavedPost.name) private savedPostModel: Model<SavedPost>,
    @InjectModel(AccountProfile.name) private accountProfileModel: Model<AccountProfile>,
    @InjectModel(Post.name) private postModel: Model<Post>
  ) {}

  async savePost(userId: string, postId: string): Promise<SavedPost> {
    // Check if post exists
    const postExists = await this.postModel.exists({ _id: postId });
    if (!postExists) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check if already saved
    const existingSave = await this.savedPostModel.findOne({
      user: userId,
      post: postId,
    });

    if (existingSave) {
      return existingSave;
    }

    // Save post
    const savedPost = new this.savedPostModel({
      user: userId,
      post: postId,
    });

    // Add to user's saved posts array
    await this.accountProfileModel.findByIdAndUpdate(
      userId,
      { $addToSet: { savedPosts: postId } },
      { new: true }
    );

    return await savedPost.save();
  }

  async unsavePost(userId: string, postId: string): Promise<{ deleted: boolean }> {
    const result = await this.savedPostModel.deleteOne({
      user: userId,
      post: postId,
    });

    // Remove from user's saved posts array
    await this.accountProfileModel.findByIdAndUpdate(
      userId,
      { $pull: { savedPosts: postId } },
      { new: true }
    );

    return { deleted: result.deletedCount > 0 };
  }

  async isSaved(userId: string, postId: string): Promise<{ saved: boolean }> {
    const savedPost = await this.savedPostModel.findOne({
      user: userId,
      post: postId,
    });

    return { saved: !!savedPost };
  }

  async getSavedPosts(userId: string): Promise<Post[]> {
    const savedPosts = await this.savedPostModel.find({ user: userId }).sort({ savedAt: -1 });
    const postIds = savedPosts.map(savedPost => savedPost.post);
    
    return this.postModel.find({ _id: { $in: postIds } }).populate('author');
  }
}
