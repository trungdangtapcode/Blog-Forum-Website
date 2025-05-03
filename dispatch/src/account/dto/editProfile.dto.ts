import { IsString, IsInt, IsNotEmpty, MaxLength, Min, IsOptional } from 'class-validator';

export class UserProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  avatar: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  fullName: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  age: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  occupation: string;
}