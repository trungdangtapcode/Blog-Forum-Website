import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavePostController } from './savepost.controller';
import { SavePostService } from './savepost.service';
import { SavedPost, SavedPostSchema } from './savepost.schema';
import { AccountModule } from '@/account/account.module';
import { AccountProfile, AccountProfileSchema } from '@/account/accountProfile.chema';
import { Post, PostSchema } from '../post.chema';

@Module({
  imports: [
    AccountModule,
    MongooseModule.forFeature([
      { name: SavedPost.name, schema: SavedPostSchema },
      { name: AccountProfile.name, schema: AccountProfileSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [SavePostController],
  providers: [SavePostService],
  exports: [SavePostService],
})
export class SavePostModule {}