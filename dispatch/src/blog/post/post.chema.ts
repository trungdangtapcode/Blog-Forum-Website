import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


//like ~ up/down vote
@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ ref: 'AccountProfile' })
  author: string;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ type: [{ type: String }], default: [] })
  comments: string[];

  @Prop({ default: 'general' })
  category: string;

  @Prop({ type: Date, select: false })
  createdAt: Date;

  @Prop({ type: Date, select: false })
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
