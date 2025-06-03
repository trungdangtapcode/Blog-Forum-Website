import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SavedPost extends Document {
  @Prop({ type: String, ref: 'AccountProfile', required: true })
  user: string;

  @Prop({ type: String, ref: 'Post', required: true })
  post: string;

  @Prop({ type: Date, default: Date.now })
  savedAt: Date;
}

export const SavedPostSchema = SchemaFactory.createForClass(SavedPost);
