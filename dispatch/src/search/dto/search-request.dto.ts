import { IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class SearchRequestDto {
  @IsString()
  q: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  author?: string;
  
  @IsOptional()
  @IsArray()
  tags?: string[];
}
