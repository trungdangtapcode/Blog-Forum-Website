import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { AccountProfile } from './accountProfile.chema';

@Schema()
export class Follow extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AccountProfile', required: true })
  follower: AccountProfile | string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AccountProfile', required: true })
  following: AccountProfile | string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

// Create a compound index on follower and following to ensure uniqueness
// This prevents a user from following the same user multiple times
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
