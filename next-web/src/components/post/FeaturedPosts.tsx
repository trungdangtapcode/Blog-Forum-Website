"use client";

import { FC, useEffect, useState } from "react";
import { Post, getPosts } from "@/utils/postFetching";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageCircle, Clock, Tag } from "lucide-react";
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import { motion } from "framer-motion";

const FeaturedPosts: FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const fetchedPosts = await getPosts();
        // Sort by likes or other criteria to get "featured" posts
        const featuredPosts = fetchedPosts
          .sort((a: Post, b: Post) => b.likes - a.likes)
          .slice(0, 3); // Take top 3 posts
        setPosts(featuredPosts);
      } catch (error) {
        console.error("Error fetching featured posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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

  if (loading) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Featured Posts</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              Popular and trending content from our community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!posts.length) {
    return null;
  }

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Featured Posts</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Popular and trending content from our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, index) => {
            // Format the date to be more readable
            // console.log(post.createdAt)
            let formattedDate = "Unknown date";
            if (post.createdAt) {
              formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
            }

            // Truncate content for preview
            const truncatedContent = post.summary || (post.content.length > 120 
              ? post.content.substring(0, 120) + '...' 
              : post.content);

            return (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/posts/${post._id}`} className="block flex-grow">
                    <CardContent className="p-6">
                      <div className="mb-4 flex justify-between items-start">
                        <Badge variant="outline" className={`${getCategoryColor(post.category)}`}>
                          <Tag className="h-3 w-3 mr-1" />
                          {post.category || "General"}
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-semibold line-clamp-2 mb-3 text-primary-800 dark:text-primary-100">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-3 text-sm mb-4">
                        {truncatedContent}
                      </p>
                      
                      <div className="flex items-center mt-auto pt-4">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src="/default-avatar.png" alt="Author Avatar" />
                          <AvatarFallback>{post.author?.substring(0, 2).toUpperCase() || "AU"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{post.author || "Anonymous"}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                  
                  <CardFooter className="px-6 py-3 border-t flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-4 text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span className="text-xs">{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span className="text-xs">{post.comments?.length || 0}</span>
                      </div>
                    </div>
                    
                    <Link href={`/posts/${post._id}`} className="text-xs font-medium text-primary-600 hover:text-primary-800">
                      Read More
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPosts;
