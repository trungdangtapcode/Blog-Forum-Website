import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsNumber()
  @IsOptional()
  likes?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  comments?: string[];

  @IsString()
  @IsOptional()
  category?: string;
}
