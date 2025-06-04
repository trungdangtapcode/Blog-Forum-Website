import { IsNotEmpty, IsMongoId } from 'class-validator';

export class FollowDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
