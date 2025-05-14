"use client"


import StoreProvider from "@/state/redux"
// import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Auth0Provider } from "@auth0/nextjs-auth0"
import { ToastProvider } from "@/components/ui/toast";

const Providers = (
	{children}: {
		children: React.ReactNode
	}) => {
	return (
		<StoreProvider>
			<Auth0Provider>
			<ToastProvider>
			{children}
			</ToastProvider>
			</Auth0Provider>
		</StoreProvider>
	)
}

export default Providers