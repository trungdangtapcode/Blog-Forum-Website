import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentTransaction, PaymentTransactionSchema } from './payment-transaction.schema';
import { AccountModule } from '../account/account.module';
import { CachedAuth0Guard } from '../account/guards/cached-auth0.guard';

@Module({  imports: [
    MongooseModule.forFeature([
      { name: PaymentTransaction.name, schema: PaymentTransactionSchema }
    ]),
    AccountModule
  ],
  controllers: [PaymentController],  providers: [
    PaymentService,
    CachedAuth0Guard
  ],
  exports: [PaymentService]
})
export class PaymentModule {}
