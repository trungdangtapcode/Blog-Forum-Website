import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AccountProfile extends Document {
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, maxlength: 4194304, required: false, default: '/default-avatar.png' })
  avatar?: string;

  @Prop({ type: String, maxlength: 50, required: false })
  fullName?: string;

  @Prop({ type: String, maxlength: 500, required: false })
  bio?: string;

  @Prop({ type: Number, min: 0, required: false })
  age?: number;

  @Prop({ type: String, maxlength: 100, required: false })
  location?: string;

  @Prop({ type: String, maxlength: 100, required: false })
  occupation?: string;

  @Prop({ type: [{ type: String, ref: 'Post' }], default: [] })
  savedPosts: string[];

  @Prop({ type: Boolean, default: false })
  isAdmin: boolean;
}

export const AccountProfileSchema = SchemaFactory.createForClass(AccountProfile);
