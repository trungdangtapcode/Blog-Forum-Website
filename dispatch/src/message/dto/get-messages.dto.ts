import { IsMongoId, IsOptional } from 'class-validator';

export class GetMessagesDto {
  @IsMongoId()
  @IsOptional()
  userId: string;

  @IsOptional()
  limit: number;

  @IsOptional()
  offset: number;
}
