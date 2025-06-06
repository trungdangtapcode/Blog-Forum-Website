import React from 'react'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import Navbar from '@/components/Navbar'

// Force dynamic rendering for layouts that use auth through Navbar
export const dynamic = "force-dynamic";

const Layout = ({children}: {
	children: React.ReactNode
}) => {
  return (
	<div className='h-full w-full'>
	    <Navbar />
	  	<main className={`h-full flex w-full flex-col`}
		style={{paddingTop: `${NAVBAR_HEIGHT}px`}}>
			{children}
		</main>
	</div>
  )
}

export default Layout
