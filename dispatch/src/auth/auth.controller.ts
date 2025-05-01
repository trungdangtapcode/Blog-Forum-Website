import {Body, Controller, Post, Req, UseFilters, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { MongoExceptionFilter } from '@/validation-error.filter';
import { LocalGuard } from './guards/local.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {

    constructor(private AuthService: AuthService) {}

    @Post("/createUser")
    @UsePipes(new ValidationPipe())
    @UseFilters(new MongoExceptionFilter())
    createUser(@Body() CreateUserDto: CreateUserDto){
        console.log(CreateUserDto)
        return this.AuthService.createUser(CreateUserDto);
    }

    @Post("/login")
    @UseGuards(LocalGuard)
    @UseFilters(new MongoExceptionFilter())
    verifyUser(@Req() req: Request){
        console.log('In Verify User (Controller)');
        return req.user;
    }
}