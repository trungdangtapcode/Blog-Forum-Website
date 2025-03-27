import React from 'react'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import Navbar from '@/components/Navbar'

const Layout = ({children}: {
	children: React.ReactNode
}) => {
  return (
	<div>
	  	<Navbar />
	  	<main className={`h-full flex w-full flex-col pt-[${NAVBAR_HEIGHT}px]`}>
			{children}
		</main>

	</div>
  )
}

export default Layout
