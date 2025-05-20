import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './comment.schema';
import { CommentVote } from './comment-vote.schema';
import { Post } from '../post.chema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { VoteCommentDto } from './dto/vote-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(CommentVote.name) private readonly commentVoteModel: Model<CommentVote>,
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
  ) {}

  async create(userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    // Check if post exists
    const post = await this.postModel.findById(createCommentDto.post);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Create the comment
    const newComment = new this.commentModel({
      content: createCommentDto.content,
      author: userId,
      post: createCommentDto.post,
    });

    // Handle replies to existing comments
    if (createCommentDto.parentComment) {
      const parentComment = await this.commentModel.findById(createCommentDto.parentComment);
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
      
      newComment.parentComment = new Types.ObjectId(createCommentDto.parentComment);
      
      // Save the comment
      const savedComment = await newComment.save();
      
      // Update parent comment to include this reply
      await this.commentModel.findByIdAndUpdate(
        createCommentDto.parentComment,
        { $push: { replies: savedComment._id } }
      );
      
      return savedComment;
    } else {
      // Save the comment
      const savedComment = await newComment.save();
      
      // Update post to include comment reference
      await this.postModel.findByIdAndUpdate(
        createCommentDto.post,
        { $push: { comments: savedComment._id } }
      );
      
      return savedComment;
    }
  }

  async findAll(): Promise<Comment[]> {
    return this.commentModel.find()
      .populate('author', 'fullName avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentModel.findById(id)
      .populate('author', 'fullName avatar')
      .exec();
    
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    
    return comment;
  }

  async findByPost(postId: string): Promise<Comment[]> {
    return this.commentModel.find({ post: postId, parentComment: null })
      .populate('author', 'fullName avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'fullName avatar'
        }
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(userId: string, id: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    // First check if comment exists and if user is the author
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    
    if (comment.author.toString() !== userId) {
      throw new ConflictException('You can only edit your own comments');
    }
    
    // Update the comment
    const updatedComment = await this.commentModel.findByIdAndUpdate(
      id,
      { 
        ...updateCommentDto,
        updatedAt: new Date()
      },
      { new: true }
    )
    .populate('author', 'fullName avatar')
    .exec();
    
    return updatedComment;
  }

  async remove(userId: string, id: string): Promise<{ deleted: boolean }> {
    // First check if comment exists and if user is the author
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    
    if (comment.author.toString() !== userId) {
      throw new ConflictException('You can only delete your own comments');
    }
    
    // If this comment has a parent, remove it from parent's replies
    if (comment.parentComment) {
      await this.commentModel.findByIdAndUpdate(
        comment.parentComment,
        { $pull: { replies: comment._id } }
      );
    } else {
      // If this is a top-level comment, remove it from post's comments
      await this.postModel.findByIdAndUpdate(
        comment.post,
        { $pull: { comments: comment._id } }
      );
    }
    
    // Remove the comment and its votes
    await this.commentVoteModel.deleteMany({ comment: id });
    
    // If comment has replies, recursively delete them
    if (comment.replies && comment.replies.length > 0) {
      for (const replyId of comment.replies) {
        await this.remove(userId, replyId.toString());
      }
    }
    
    const result = await this.commentModel.findByIdAndDelete(id);
    return { deleted: !!result };
  }

  async voteComment(userId: string, voteDto: VoteCommentDto): Promise<Comment> {
    const { commentId, action } = voteDto;
    
    // Check if comment exists
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    
    // Check if user already voted on this comment
    const existingVote = await this.commentVoteModel.findOne({
      user: userId,
      comment: commentId
    });
    
    if (existingVote) {
      if (existingVote.action === action) {
        // User is trying to vote the same way again, remove the vote
        await this.commentVoteModel.deleteOne({ _id: existingVote._id });
        
        // Update comment vote count
        const updateField = action === 'upvote' ? 'upvotes' : 'downvotes';
        await this.commentModel.findByIdAndUpdate(
          commentId,
          { $inc: { [updateField]: -1 } }
        );
      } else {
        // User is changing their vote
        existingVote.action = action;
        await existingVote.save();
        
        // Update comment vote counts (both up and down)
        const inc = action === 'upvote' 
          ? { upvotes: 1, downvotes: -1 }
          : { upvotes: -1, downvotes: 1 };
        
        await this.commentModel.findByIdAndUpdate(commentId, { $inc: inc });
      }
    } else {
      // New vote
      const newVote = new this.commentVoteModel({
        user: userId,
        comment: commentId,
        action
      });
      await newVote.save();
      
      // Update comment vote count
      const updateField = action === 'upvote' ? 'upvotes' : 'downvotes';
      await this.commentModel.findByIdAndUpdate(
        commentId,
        { $inc: { [updateField]: 1 } }
      );
    }
    
    return this.findOne(commentId);
  }

  async getUserVote(userId: string, commentId: string): Promise<{ action: string } | null> {
    const vote = await this.commentVoteModel.findOne({
      user: userId,
      comment: commentId
    });
    
    if (!vote) {
      return null;
    }
    
    return { action: vote.action };
  }
}
