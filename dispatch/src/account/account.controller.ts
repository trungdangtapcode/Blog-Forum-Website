import {Body, Controller, Delete, Get, Post, Req, UseFilters, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import { AccountService } from './account.service';
import { Auth0Guard } from './guards/auth0.guard';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/UpdateProfile.dto';

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

	@Post("/updateProfile")
	@UsePipes(new ValidationPipe())
	async updateProfile(@Req() req: Request, @Body() updateProfileDto: UpdateProfileDto) {
		// console.log('Inside Account Controller', updateProfileDto);
		const email = updateProfileDto.email;
		console.log(email)
		const message = await this.AccountService.updateProfile(email, updateProfileDto);
		console.log(message)
		return { message: "Test" };
	}

	@Get("/getProfile")
	@UseGuards(Auth0Guard)
	async getProfile(@Req() req: Request  & { user: any }) {
		console.log('Inside Account Controller');
		const email = req.user.email;
		console.log(email)
		const profile = await this.AccountService.getProfile(email);
		return profile;
	}

	@Get("/getPublicProfile/")
	async getPublicProfile(@Body() body: { userId: string }) {
		console.log('Inside Account Controller');
		const profile = await this.AccountService.getPublicProfile(body.userId);
		return profile;
	}
	
	// not need to auth
	@Post("/getPublicProfile/")
	async getPublicProfilePOST(@Body() body: { userId: string }) {
		console.log('Inside Account Controller');
		const profile = await this.AccountService.getPublicProfile(body.userId);
		return profile;
	}
	
	@Get("/savedPosts")
	@UseGuards(Auth0Guard)
	async getSavedPosts(@Req() req: Request & { user: any }) {
		const email = req.user.email;
		return await this.AccountService.getSavedPosts(email);
	}
	
	@Post("/savedPosts")
	@UseGuards(Auth0Guard)
	@UsePipes(new ValidationPipe())
	async addSavedPost(@Req() req: Request & { user: any }, @Body() body: { postId: string }) {
		const email = req.user.email;
		return await this.AccountService.addSavedPost(email, body.postId);
	}
	
	@Delete("/savedPosts")
	@UseGuards(Auth0Guard)
	@UsePipes(new ValidationPipe())
	async removeSavedPost(@Req() req: Request & { user: any }, @Body() body: { postId: string }) {
		const email = req.user.email;
		return await this.AccountService.removeSavedPost(email, body.postId);
	}
}