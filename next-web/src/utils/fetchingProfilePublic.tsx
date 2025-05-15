
import { DISPATCH_URL } from "@/lib/config";
import axios from "axios";

const tmp = {
	avatar: '/default-avatar.png',
	email: 'user@example.com',
	fullName: 'John sDoe',
	bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	age: 30,
	location: 'New York, NY',
	occupation: 'Software Engineer',
}

export async function getPublicProfile(userId: string) {
	try {
		const response = await axios.post(
			`${DISPATCH_URL}/account/getPublicProfile/`,
			{userId: userId},
			{
				headers: {
				'Content-Type': 'application/json',
				},
			}
		);
		if (response.status >= 200 && response.status < 300) {
			console.log('Profile fetched successfully');
			return response.data;
		}
		console.warn('Profile fetch returned non-success status:', response.status);
		return tmp
	} catch (error) {
		console.error('Error getting session:', error);
		return tmp;
	}
}