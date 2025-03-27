"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import {motion} from 'framer-motion'
import { TypeAnimation } from 'react-type-animation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
	const [searchbarValue, setSearchbarValue] = useState("");
  	return (
	<div className="relative h-screen bg-primary-300">
		<Image 
			src="/landing.png"
			alt = "Landing Background"
			className="object-cover object-center" 
			//if no "object-cover" image stretches horizontally
			fill
			priority //load first
		/>
		<div className='absolute inset-0 bg-black/40'>
		{/* opactity in v3/2 is bg-opacity-50 */}
			<motion.div 
				initial={{opacity: 0, y: 20}}
				animate={{opacity: 1, y: 0}}
				transition={{duration: 0.5}}
				className='absolute top-1/2 left-1/2 
					transform -translate-x-1/2 -translate-y-1/2 
					text-white text-center 
					w-full'
			>
				<div className='max-w-4xl mx-auto px-16 sm:px-12'>
					<h1 className='text-5xl font-bold text-white mb-4'>
					Where ideas connect and voices are heard. Join the conversation today
					</h1>
					<p className='text-xl text-whtie mb-8'>
					<TypeAnimation
						sequence={[
							// Same substring at the start will only be typed out once, initially
							'Curiosity starts here—discover insights, stories, and ideas that inspire.',
							1500, // wait 1s before replacing "Mice" with "Hamsters"
							'Search, explore, and uncover the stories that matter to you.',
							1500,
							'Every search is a new adventure—dive into a world of ideas.',
							1500,
							'Find answers, spark inspiration, and fuel your curiosity',
							1500
						]}
						wrapper="span"
						speed={75}
						repeat={Infinity}
					/>
					</p>
					<div className='flex justify-center'>
						<Input
							className='w-full max-w-lg rounded-none rounded-l-xl h-12
								placeholder:text-gray-300 bg-black/40
								font-bold text-white
								focus:bg-white focus:placeholder:text-primary-600
								focus:text-primary-700
								transition duration-200'
							type='text'
							value = {searchbarValue}
							placeholder = "What are you curious about?"
							onChange={(e) => setSearchbarValue(e.target.value)}
						/>
						<Button 
							className='h-12 rounded-none rounded-r-xl
								bg-secondary-600 hover:bg-white
								hover:text-primary-700 font-bold cursor-pointer'>
							Search
						</Button>
					</div>
				</div>

			</motion.div>
		</div>
	</div>
  )
}

export default HeroSection
