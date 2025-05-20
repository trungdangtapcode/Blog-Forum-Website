import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CommentVote extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'AccountProfile', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true })
  comment: mongoose.Types.ObjectId;

  @Prop({ required: true, enum: ['upvote', 'downvote'] })
  action: 'upvote' | 'downvote';
}

export const CommentVoteSchema = SchemaFactory.createForClass(CommentVote);
CommentVoteSchema.index({ user: 1, comment: 1 }, { unique: true }); // Ensure uniqueness
