import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';
import { AccountProfile, AccountProfileSchema } from '../account/accountProfile.chema';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    ConfigModule, // Ensure ConfigModule is imported to access environment variables
    AccountModule, // Import AccountModule for CachedAuth0Guard dependency
    CacheModule.register(), // Add CacheModule for CACHE_MANAGER token
    MongooseModule.forFeature([
      { name: AccountProfile.name, schema: AccountProfileSchema },
    ]),
  ],
  controllers: [MailerController],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
