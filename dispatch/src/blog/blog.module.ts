// blog.module.ts
import { Module } from '@nestjs/common';
import { PostModule } from './post/post.module';
// import { CommentModule } from './comment/comment.module';
// import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [PostModule],
})
export class BlogModule {}
