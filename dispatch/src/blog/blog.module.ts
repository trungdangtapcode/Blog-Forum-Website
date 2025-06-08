// blog.module.ts
import { Module } from '@nestjs/common';
import { PostModule } from './post/post.module';
import { TextToSpeechModule } from './text-to-speech/text-to-speech.module';
// import { CommentModule } from './comment/comment.module';
// import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [PostModule, TextToSpeechModule],
})
export class BlogModule {}
