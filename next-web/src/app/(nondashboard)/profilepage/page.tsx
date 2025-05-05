import { auth0 } from "@/lib/auth0";
import ProfilePageClient from "./clientpage";
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

async function getProfile() {
	const session = await auth0.getAccessToken()
	if (!session) {
		throw new Error('Session not found');
	}
	const token = session.token
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
	
}

export default async function ProfilePage() {
	const ProfileData = await getProfile()
	return (
		<ProfilePageClient initialProfile={ProfileData}/>
	)
}
