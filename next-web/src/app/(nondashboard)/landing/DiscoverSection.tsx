"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const DiscoverSection = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}
      variants={containerVariants}
      className="py-12 bg-white mb-16"
    >
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <motion.div variants={itemVariants} className="my-12 text-center">
          <h2 className="text-3xl font-semibold leading-tight text-gray-800">
            Discover
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Find your favorite Story and Knowledge here!
          </p>
          <p className="mt-2 text-gray-500 max-w-3xl mx-auto">
            Exploring engaging stories and insightful knowledge has never been easier. With our interactive forum and curated blog posts, you can easily discover content that inspires, educates, and connects. Start browsing today and dive into a world of ideas!
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16 text-center">
          {[
            {
                imageSrc: "/landing-icon-search.png",
                title: "Explore Topics",
                description:
                    "Dive into a wide range of categories filled with compelling stories and informative discussions.",
            },
            {
                imageSrc: "/landing-icon-edit.png",
                title: "Join the Conversation",
                description:
                    "Engage with the community by commenting, sharing insights, or starting your own discussion thread.",
            },
            {
                imageSrc: "/landing-icon-book.png",
                title: "Grow with Knowledge",
                description:
                    "Learn something new every day as you read, share, and connect with curious minds like yours.",
            },
          ].map((card, index) => (
            <motion.div key={index} variants={itemVariants}>
              <DiscoverCard {...card} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

interface IDiscoverCard {
    imageSrc: string;
    title: string;
    description: string;
}

const DiscoverCard = ({
  imageSrc,
  title,
  description,
}: IDiscoverCard) => (
  <div className="px-4 py-12 shadow-lg rounded-lg bg-primary-50 md:h-72
    hover:scale-110 hover:shadow-xl
    transition-transform duration-300">
    <div className="bg-primary-700 p-[0.6rem] rounded-full mb-4 h-10 w-10 mx-auto">
      <Image
        src={imageSrc}
        width={30}
        height={30}
        className="w-full h-full"
        alt={title}
      />
    </div>
    <h3 className="mt-4 text-xl font-medium text-gray-800">{title}</h3>
    <p className="mt-2 text-base text-gray-500">{description}</p>
  </div>
);

export default DiscoverSection;