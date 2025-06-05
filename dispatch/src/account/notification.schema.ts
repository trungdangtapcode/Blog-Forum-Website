import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'AccountProfile' })
  recipient: string;

  @Prop({ required: true })
  type: string; // 'new-post', 'follow', 'like', 'comment'

  @Prop({ default: '' })
  message: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: false })
  postId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AccountProfile', required: false })
  senderId: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
