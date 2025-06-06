
import { getProfile } from "@/utils/fetchingProfile";
import ProfilePageClient from "./clientpage";

// Force dynamic rendering for pages that use auth
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
	const ProfileData = await getProfile()
	return (
		<ProfilePageClient initialProfile={ProfileData}/>
	)
}

