"use client";

import { Post } from "@/utils/postFetching";
import { FC } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageCircle, Clock, Tag } from "lucide-react";
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import { Badge } from "@/components/ui/badge";

interface PostCardProps {
  post: Post;
}

const PostCard: FC<PostCardProps> = ({ post }) => {
  // Format the date to be more readable
  const formattedDate = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : "Unknown date";

  // Truncate content for preview
  const truncatedContent = post.summary || (post.content.length > 150 
    ? post.content.substring(0, 150) + '...' 
    : post.content);

  // Define category color based on category name
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technology':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'lifestyle':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'science':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'health':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'business':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.3 } }}
      className="bg-white dark:bg-primary-900 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <Link href={`/posts/${post._id}`}>
            <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-100 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors duration-200">
              {post.title}
            </h3>
          </Link>
          <Badge variant="outline" className={`ml-2 ${getCategoryColor(post.category)}`}>
            <Tag className="h-3 w-3 mr-1" />
            {post.category || "General"}
          </Badge>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
          {truncatedContent}
        </p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/default-avatar.png" alt="Author Avatar" />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {post.author || "Anonymous"}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <ThumbsUp className="h-4 w-4 text-secondary-600" />
              <span className="text-xs">{post.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4 text-primary-600" />
              <span className="text-xs">{post.comments?.length || 0}</span>
            </div>
          </div>
          
          <Link href={`/posts/${post._id}`} className="text-secondary-600 hover:text-secondary-800 text-sm font-medium">
            Read More
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
