import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TextToSpeechController } from './text-to-speech.controller';
import { TextToSpeechService } from './text-to-speech.service';
import { HttpModule } from '@nestjs/axios';
import { Post, PostSchema } from '../post/post.chema';
import { PostModule } from '../post/post.module';
import { AccountModule } from '@/account/account.module';

@Module({
  imports: [
    HttpModule,
    PostModule,
    AccountModule,
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  controllers: [TextToSpeechController],
  providers: [TextToSpeechService],
  exports: [TextToSpeechService],
})
export class TextToSpeechModule {}
