import { IsMongoId } from "class-validator";

export class PostIdDto {
  
	@IsMongoId()
	readonly post: string;
  }