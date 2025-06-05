import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment, CommentSchema } from './comment.schema';
import { CommentVote, CommentVoteSchema } from './comment-vote.schema';
import { Post, PostSchema } from '../post.chema';
import { AccountModule } from '@/account/account.module';
import { NotificationService } from '@/account/notification.service';
import { MailerModule } from '../../../mailer/mailer.module'; // Import MailerModule to access MailerService

@Module({
  imports: [
    AccountModule, // Import AccountModule to access NotificationModel
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: CommentVote.name, schema: CommentVoteSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    forwardRef(() => MailerModule), // Import MailerModule to access MailerService
  ],
  controllers: [CommentController],
  providers: [CommentService, NotificationService],
  exports: [CommentService],
})
export class CommentModule {}
