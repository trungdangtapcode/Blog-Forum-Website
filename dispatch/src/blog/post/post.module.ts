import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post, PostSchema } from './post.chema';
import { AccountModule } from '@/account/account.module';
import { Like, LikeSchema } from './like.schema';
import { CommentModule } from './comment/comment.module';
import { SavePostModule } from './savepost/savepost.module';
import { SearchModule } from '@/search/search.module';
// import { CachedAuth0Guard } from 'src/account/guards/cached-auth0.guard';
// import { APP_GUARD } from '@nestjs/core';

@Module({  imports: [
    AccountModule,
    CommentModule,
    SavePostModule,
    SearchModule,
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
  ],  
  controllers: [PostController],
  providers: [
    PostService,    // {
    //   provide: APP_GUARD,
    //   useClass: CachedAuth0Guard,
    // },
  ],
  exports: [PostService],
})
export class PostModule {}