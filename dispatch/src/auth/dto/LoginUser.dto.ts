import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginUserDto {
    @IsString()
    @IsEmail({}, {message: "Invalid email"})
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;
}