import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './comment.schema';
import { CommentVote } from './comment-vote.schema';
import { Post } from '../post.chema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { VoteCommentDto } from './dto/vote-comment.dto';
import { NotificationService } from '@/account/notification.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(CommentVote.name) private readonly commentVoteModel: Model<CommentVote>,
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    private readonly notificationService: NotificationService // Inject NotificationService
  ) {}
  async create(userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    console.log(`Creating comment for post: ${createCommentDto.post}, parent: ${createCommentDto.parentComment || 'none'}`);
    
    const post = await this.postModel.findById(createCommentDto.post);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const newComment = new this.commentModel({
      content: createCommentDto.content,
      author: userId,
      post: createCommentDto.post,
      replies: [] // Initialize replies as an empty array
    });

    if (createCommentDto.parentComment) {
      // This is a reply to an existing comment
      const parentComment = await this.commentModel.findById(createCommentDto.parentComment);
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      newComment.parentComment = new Types.ObjectId(createCommentDto.parentComment);
      const savedComment = await newComment.save();

      // Update parent comment's replies array
      await this.commentModel.findByIdAndUpdate(
        createCommentDto.parentComment,
        { $push: { replies: savedComment._id } }
      );      // Send notification to the parent comment's author
      await this.notificationService.createNotification({
        recipient: parentComment.author.toString(),
        type: 'reply',
        message: `You have a new reply to your comment: ${createCommentDto.content}`,
        commentId: savedComment._id.toString(),
        senderId: userId,
        sendEmail: true,
      });

      // Return the saved comment with author information
      const populatedComment = await this.commentModel.findById(savedComment._id)
        .populate('author', 'fullName avatar')
        .lean();
      
      console.log(`Created reply comment: ${populatedComment._id} for parent: ${createCommentDto.parentComment}`);
      return populatedComment;
    } else {
      // This is a top-level comment
      const savedComment = await newComment.save();

      // Update post's comments array
      await this.postModel.findByIdAndUpdate(
        createCommentDto.post,
        { $push: { comments: savedComment._id } }
      );

      // Update the post's updatedAt field when a comment is added
      await this.postModel.findByIdAndUpdate(
        createCommentDto.post,
        { $set: { updatedAt: new Date() } }
      );      // Send notification to the post's author
      await this.notificationService.createNotification({
        recipient: post.author.toString(),
        type: 'comment',
        message: `You have a new comment on your post: ${createCommentDto.content}`,
        postId: createCommentDto.post,
        commentId: savedComment._id.toString(),
        senderId: userId,
        sendEmail: true,
      });

      // Return the saved comment with author information
      const populatedComment = await this.commentModel.findById(savedComment._id)
        .populate('author', 'fullName avatar')
        .lean();
      
      console.log(`Created top-level comment: ${populatedComment._id} for post: ${createCommentDto.post}`);
      return populatedComment;
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
    }  async findByPost(postId: string): Promise<Comment[]> {
    console.log(`Finding comments for post: ${postId}`);
    
    // Define a recursive population function for nested replies
    // This ensures we populate all levels of nested replies
    const populateReplies = {
      path: 'replies',
      populate: [
        {
          path: 'author',
          select: 'fullName avatar'
        },
        // Recursive population of nested replies
        {
          path: 'replies',
          populate: [
            {
              path: 'author',
              select: 'fullName avatar'
            },
            // For deeper nesting, we define another level
            {
              path: 'replies',
              populate: [
                {
                  path: 'author',
                  select: 'fullName avatar'
                },
                // One more level for very deep conversations
                {
                  path: 'replies',
                  populate: [
                    {
                      path: 'author',
                      select: 'fullName avatar'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    // First get all top-level comments for this post
    const comments = await this.commentModel.find({ post: postId, parentComment: null })
      .populate('author', 'fullName avatar')
      .populate(populateReplies)
      .sort({ createdAt: -1 })
      .exec();
    
    console.log(`Found ${comments.length} top-level comments for post ${postId}`);
    
    // Log a sample of the structure to verify replies are populated correctly
    if (comments.length > 0) {
      const firstComment = comments[0];
      console.log(`First comment has ${firstComment.replies?.length || 0} direct replies`);
      
      if (firstComment.replies && firstComment.replies.length > 0) {
        console.log('First reply ID:', firstComment.replies[0]._id);
      }
    }
    
    return comments;
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
