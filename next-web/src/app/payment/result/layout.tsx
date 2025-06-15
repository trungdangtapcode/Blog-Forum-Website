import React from 'react'

// Force dynamic rendering for layouts that use auth through Navbar
export const dynamic = "force-dynamic";


const Layout = ({children}: {
	children: React.ReactNode
}) => {

  	return (
	  <div className='h-full w-full'>
	  	<main className={`h-full flex w-full flex-col`}>
		<React.Suspense fallback={<div className="p-6 text-center">Loading payment...</div>}>
          {children}
        </React.Suspense>
			
		</main>

	</div>
  	)
}

export default Layout
