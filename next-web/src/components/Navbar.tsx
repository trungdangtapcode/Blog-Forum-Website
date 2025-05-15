"use server"

import { auth0 } from '@/lib/auth0'
import NavbarClient from './NavbarClient';
import { getProfile } from '@/utils/fetchingProfile';


const Navbar = async ()=>{
	const session = await auth0.getSession();
	const isLoggedIn = !!session;
	// Only fetch profile if user is logged in
	const accountProfile = await getProfile();
	console.log('Navbar', session)
	return (
		<NavbarClient
			isLoggedIn={isLoggedIn}
			accountProfile={accountProfile}
		/>
	)
}

export default Navbar