import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

@Schema({ timestamps: true })
export class PaymentTransaction extends Document {
  @Prop({ type: String, required: true, unique: true })
  orderId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userEmail: string;

  @Prop({ type: Number, required: true, min: 1 })
  amount: number;

  @Prop({ type: Number, required: true, min: 1 })
  creditAmount: number;

  @Prop({ type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ type: String, required: false })
  paymentUrl?: string;

  @Prop({ type: Object, required: false })
  momoResponse?: Record<string, any>;

  @Prop({ type: Date, required: false })
  paidAt?: Date;
  
  @Prop({ type: Boolean, default: false })
  creditError?: boolean;
  
  @Prop({ type: Number, default: 0 })
  retryCount?: number;
  
  @Prop({ type: String, required: false })
  transactionId?: string;
  
  @Prop({ type: String, required: false })
  failReason?: string;
}

export const PaymentTransactionSchema = SchemaFactory.createForClass(PaymentTransaction);
