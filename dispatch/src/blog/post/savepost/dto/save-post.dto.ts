import { IsString, IsNotEmpty } from 'class-validator';

export class SavePostDto {
  @IsString()
  @IsNotEmpty()
  post: string;
}
