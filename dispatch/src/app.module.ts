import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule} from '@nestjs/config';
import { AccountModule } from './account/account.module';
import { PostModule } from './blog/post/post.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true, //${}
    }),
    CacheModule.register({
      ttl: 900, // Default cache TTL in seconds (15 minutes)
      max: 100, // Maximum number of items in cache
      isGlobal: true,
    }),
    AccountModule,
    PostModule,
    MongooseModule.forRoot(process.env.MONGO_URI),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
