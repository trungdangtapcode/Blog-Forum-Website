import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post, PostSchema } from './post.chema';
import { AccountModule } from '@/account/account.module';
import { Like, LikeSchema } from './like.schema';
// import { Auth0Guard } from 'src/account/guards/auth0.guard';
// import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
	AccountModule,
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
  ],
  controllers: [PostController],
  providers: [
    PostService,
    // {
    //   provide: APP_GUARD,
    //   useClass: Auth0Guard,
    // },
  ],
})
export class PostModule {}
