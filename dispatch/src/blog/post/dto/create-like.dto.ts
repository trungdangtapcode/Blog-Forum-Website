import { IsIn, IsMongoId, IsNotEmpty, IsString } from "class-validator";

//create and update
export class CreateLikeDto {
	@IsMongoId()
	readonly post: string;

	@IsString()
	@IsNotEmpty()
	@IsIn(['like', 'dislike'])
	readonly action: 'like' | 'dislike';
  }