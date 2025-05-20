import { IsIn, IsMongoId, IsNotEmpty } from 'class-validator';

export class VoteCommentDto {
  @IsMongoId()
  @IsNotEmpty()
  commentId: string;

  @IsIn(['upvote', 'downvote'])
  @IsNotEmpty()
  action: 'upvote' | 'downvote';
}
