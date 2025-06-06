import { IsMongoId, IsOptional, IsNumber } from 'class-validator';

export class ConversationDto {
  @IsMongoId()
  userId: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}
