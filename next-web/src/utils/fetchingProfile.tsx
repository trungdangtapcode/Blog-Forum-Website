import { auth0 } from "@/lib/auth0";
import axios from "axios";

// Force dynamic rendering for utilities that use auth
export const dynamic = "force-dynamic";
const tmp = {
    avatar: '/default-avatar.png',
    email: 'user@example.com',
    fullName: 'John sDoe',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    age: 30,
    location: 'New York, NY',
    occupation: 'Software Engineer',
}

export async function getProfile() {
	try {
		const session = await auth0.getAccessToken()
		if (!session) {
			// Return temporary data instead of throwing an error
			return tmp;
		}
		const token = session.token
		if (!token) {
			// Return temporary data instead of throwing an error
			return tmp;
		}
		// console.log('Token:', token);

		try {
			const response = await axios.get(
				process.env.NEXT_PUBLIC_DISPATCH_URL + '/account/getProfile/' || 'https://example.com',
				{
					headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				  },
				}
			);
			if (response.status >= 200 && response.status < 300) {
				return response.data;
			}
			return tmp
		} catch (error) {
			console.error('Error fetching profile:', error);
			return tmp
		}
	} catch (error) {
		console.error('Error getting session:', error);
		return tmp;
	}
}