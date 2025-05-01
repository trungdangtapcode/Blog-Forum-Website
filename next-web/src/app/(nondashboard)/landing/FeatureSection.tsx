"use client"

import React from 'react'
import {motion} from 'framer-motion'
import Image from "next/image"
import Link from "next/link"

const containerVariants = {
	hidden: {opacity: 0, y:50},
	visible: {
		opacity: 1,
		y:0,
		transition: {
			delay: 0, 
			duration: 0.5,
			staggerChildren: 0.2
		}
	}
}

const itemVariants = {
	hidden: {opacity: 0, y: 20},
	visible: {
		opacity: 1,
		y: 0
	}
}

const FeatureSection = () => {
  return (
	<motion.div
	 initial='hidden'
	 whileInView='visible'
	 viewport={{once: true}}
	 variants={containerVariants}
	 className='py-24 px-6 bg-primary-200
	 	sm:px-8 lg:px-12 xl:px-16'
	>
		<div className='max-w-4xl xl:max-w-6xl mx-auto'>
			<motion.h2
				variants={itemVariants}
				className='text-3xl font-bold text-center 
				mb-12 w-full sm:w-2/3 mx-auto'
			>
				Quickly find what you need with our powerful search and smart filters
			</motion.h2>
			
			<div className='grid grid-cols-1 md:grid-cols-3 
				gap-8 lg:gap-12 xl:gap-16'>
				{[0,1,2].map(index =>(
				<motion.div key={index} variants={itemVariants}>
					<FeatureCard
						imageSrc={`/landing-search${index+1}.png`}
						title={[
							"Powerful Search & Smart Filters",
							"Engaging Discussions & Expert Insights",
							"Personalized Content & Trending Topics",
						][index]}
						description={[
							"Find exactly what you need with advanced search and smart filters, ensuring relevant and precise results.",
							"Join vibrant discussions and discover expert insights on trending topics and niche interests.",
							"Stay updated with trending discussions and get personalized recommendations based on your activity.",
						][index]}
						linkText={["Search", "Discussion", "Trending"][index]}
                		linkHref={["/search", "/discussion", "/trending"][index]}
					/>
				</motion.div>
				))}
			</div>

		</div>
	</motion.div>
  )
}

interface IFeatureCard {
	imageSrc: string;
	title: string;
	description: string;
	linkText: string;
	linkHref: string;
}

const FeatureCard = ({
	imageSrc,
	title,
	description,
	linkText,
	linkHref,
  }: IFeatureCard) => (
	<div className="text-center">
	  <div className="p-4 rounded-lg mb-4 flex items-center justify-center h-48">
		<Image
		  src={imageSrc}
		  width={400}
		  height={400}
		  className="w-full h-full object-contain"
		  alt={title}
		/>
	  </div>
	  <h3 className="text-xl font-semibold mb-2">{title}</h3>
	  <p className="mb-4">{description}</p>
	  <Link
		href={linkHref}
		className="inline-block border border-gray-300 rounded px-4 py-2 hover:bg-gray-200 hover:font-bold"
		scroll={false}
	  >
		{linkText}
	  </Link>
	</div>
  );

export default FeatureSection
