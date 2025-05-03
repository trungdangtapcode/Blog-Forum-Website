import {Body, Controller, Get, Post, Req, UseFilters, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import { AccountService } from './account.service';
import { Auth0Guard } from './guards/auth0.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('account')
export class AccountController {
    constructor(private AccountService: AccountService) {}

	@Get("/test")
	@UseGuards(AuthGuard('auth0'))
	test(){
		console.log(process.env.AUTH0_DOMAIN)
		console.log('Inside Account Controller');
		return {message: "Test"};
	}
}