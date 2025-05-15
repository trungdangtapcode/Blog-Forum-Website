
import { getProfile } from "@/utils/fetchingProfile";
import ProfilePageClient from "./clientpage";


export default async function ProfilePage() {
	const ProfileData = await getProfile()
	return (
		<ProfilePageClient initialProfile={ProfileData}/>
	)
}

