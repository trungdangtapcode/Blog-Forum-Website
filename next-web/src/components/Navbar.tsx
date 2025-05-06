"use server"

import { auth0 } from '@/lib/auth0'
import NavbarClient from './NavbarClient';
import { getProfile } from '@/utils/fetching';


const Navbar = async ()=>{
	const session = await auth0.getSession();
	const isLoggedIn = !!session;
	const accountProfile = await getProfile()
	console.log('Navbar', session)
	return (
		<NavbarClient
			isLoggedIn={isLoggedIn}
			accountProfile={accountProfile}
		/>
	)
}

export default Navbar