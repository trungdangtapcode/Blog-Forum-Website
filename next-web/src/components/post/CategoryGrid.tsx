"use client";

import { FC } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Code, Leaf, Beaker, Heart, Briefcase } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

const CategoryCard: FC<CategoryCardProps> = ({ title, description, icon, color, href }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`${color} rounded-xl p-6 shadow-md hover:shadow-lg transition-all`}
    >
      <Link href={href} className="block h-full">
        <div className="flex flex-col h-full">
          <div className="bg-white/20 p-3 rounded-lg w-fit mb-4">
            {icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm opacity-90 flex-grow">{description}</p>
          <div className="mt-4 text-sm font-medium flex items-center">
            Explore posts <span className="ml-1">→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const CategoryGrid: FC = () => {
  const categories = [
    {
      id: "technology",
      title: "Technology",
      description: "Explore the latest in tech, programming, AI, and digital innovation.",
      icon: <Code className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-800",
      href: "/posts?category=technology",
    },
    {
      id: "lifestyle",
      title: "Lifestyle",
      description: "Discover content about travel, food, home, personal development and more.",
      icon: <Leaf className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-800",
      href: "/posts?category=lifestyle",
    },    {
      id: "science",
      title: "Science",
      description: "Learn about scientific discoveries, research breakthroughs, and innovations.",
      icon: <Beaker className="h-5 w-5" />,
      color: "bg-green-100 text-green-800",
      href: "/posts?category=science",
    },
    {
      id: "health",
      title: "Health",
      description: "Find articles on wellness, fitness, nutrition, mental health and medical advice.",
      icon: <Heart className="h-5 w-5" />,
      color: "bg-red-100 text-red-800",
      href: "/posts?category=health",
    },
    {
      id: "business",
      title: "Business",
      description: "Stay updated on business trends, finance, entrepreneurship, and career advice.",
      icon: <Briefcase className="h-5 w-5" />,
      color: "bg-yellow-100 text-yellow-800",
      href: "/posts?category=business",
    },
  ];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Browse by Category</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover content organized by topics that matter to you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              description={category.description}
              icon={category.icon}
              color={category.color}
              href={category.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
