import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Like extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true })
  post: mongoose.Types.ObjectId;

  @Prop({ required: true, enum: ['like', 'dislike'], default: 'like' })
  action: 'like' | 'dislike';
}

export const LikeSchema = SchemaFactory.createForClass(Like);
LikeSchema.index({ user: 1, post: 1 }, { unique: true }); // Ensure uniqueness