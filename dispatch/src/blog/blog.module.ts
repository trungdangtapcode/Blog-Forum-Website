// blog.module.ts
import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [PostsModule, CommentsModule, CategoriesModule],
})
export class BlogModule {}
