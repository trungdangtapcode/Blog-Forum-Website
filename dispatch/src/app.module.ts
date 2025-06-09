import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule} from '@nestjs/config';
import { AccountModule } from './account/account.module';
import { PostModule } from './blog/post/post.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { TokenModule } from './utils/token.module';
import { MailerModule } from './mailer/mailer.module';
import { MessageModule } from './message/message.module';
import { SearchModule } from './search/search.module';
import { TextToSpeechModule } from './blog/text-to-speech/text-to-speech.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({  
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true, //${}
    }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      // Use memory store in development and Redis in production
      ...(process.env.NODE_ENV === 'production' 
        ? {
            store: redisStore,
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            ttl: 1800, // 30 minutes default TTL
            max: 500, // Maximum number of items in cache
          } 
        : {
            ttl: 1800, // 30 minutes in seconds
            max: 200, // Maximum number of items in cache
          }),
    }),    TokenModule,
    AccountModule,
    PostModule,
    MailerModule,
    MessageModule,
    SearchModule,
    MongooseModule.forRoot(process.env.MONGO_URI),
    TextToSpeechModule, // Assuming TextToSpeechModule is defined in the same directory
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
