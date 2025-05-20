import { IsIn, IsMongoId, IsNotEmpty } from "class-validator";

export class CreateCommentVoteDto {
  @IsMongoId()
  @IsNotEmpty()
  comment: string;

  @IsIn(['upvote', 'downvote'])
  @IsNotEmpty()
  action: 'upvote' | 'downvote';
}
