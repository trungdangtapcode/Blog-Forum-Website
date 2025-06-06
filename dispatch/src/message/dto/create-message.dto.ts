import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  receiver: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
