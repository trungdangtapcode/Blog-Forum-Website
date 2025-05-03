"use client"


import StoreProvider from "@/state/redux"
// import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Auth0Provider } from "@auth0/nextjs-auth0"

const Providers = (
	{children}: {
		children: React.ReactNode
	}) => {
	return (
		<StoreProvider>
			<Auth0Provider>
			{children}
			</Auth0Provider>
		</StoreProvider>
	)
}

export default Providers