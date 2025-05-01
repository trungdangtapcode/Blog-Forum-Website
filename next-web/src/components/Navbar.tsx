import { NAVBAR_HEIGHT } from '@/lib/constants'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { Button } from './ui/button'

const Navbar = () => {
  return (
	<div className='fixed top-0 left-0 w-full z-50 shadow-xl'
	style={{height: `${NAVBAR_HEIGHT}px`}}>
		<div className='flex justify-between items-center w-full py-3 px-8 bg-primary-700 text-white'>
			<div className="flex items-center gap-4 md:gap-6">
			<Link href="/"
				className='cursor-pointer hover:!text-primary-300'
				scroll={false} //turn of scroll to top automatically
			>
				<div className='flex items-center gap-3'>
					<Image
						src="/watablog_logo.png"
						width={400}
						height={160}
						alt="WataBlog logo"
						className="w-18 h-8 rounded-lg"
					/>
					<div className='text-xl font-bold'>
						Wata
						<span className='text-secondary-600 '>Blog
						</span>
					</div>
				</div>
			</Link>
			</div>
			
			<p className='text-primary-200 hidden md:block'>
				Great conversations begin with shared ideas. Write, discuss, and inspire
			</p>

			<div className='flex items-center gap-4'>
				<Link href='/signin'>
				<Button className="text-white bg-transparent border-white
					border-1 hover:text-primary-800 hover:bg-white
					rounded-lg cursor-pointer">
					Sign in
				</Button>
				</Link>

				<Link href='/signup'>
				<Button className="text-white bg-secondary-600
					hover:text-primary-800 hover:bg-white
					rounded-lg cursor-pointer"
					variant={'secondary'}>
					Sign up
				</Button>
				</Link>
			</div>

		</div>
	</div>
  )
}

export default Navbar
