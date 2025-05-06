
import { getProfile } from "@/utils/fetching";
import ProfilePageClient from "./clientpage";


export default async function ProfilePage() {
	const ProfileData = await getProfile()
	return (
		<ProfilePageClient initialProfile={ProfileData}/>
	)
}

