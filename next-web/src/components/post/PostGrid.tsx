"use client";

import { FC, useEffect, useState } from "react";
import { Post, getPosts } from "@/utils/postFetching";
import PostCard from "./PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle } from "lucide-react";
import Link from "next/link";

interface PostGridProps {
  initialPosts?: Post[];
}

// Define post categories
const categories = [
  { id: "all", name: "All Posts" },
  { id: "technology", name: "Technology" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "science", name: "Science" },
  { id: "health", name: "Health" },
  { id: "business", name: "Business" },
];

const PostGrid: FC<PostGridProps> = ({ initialPosts = [] }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState<boolean>(!initialPosts.length);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    const fetchPosts = async () => {
      if (!initialPosts.length) {
        setLoading(true);
        try {
          const fetchedPosts = await getPosts();
          setPosts(fetchedPosts);
        } catch (error) {
          console.error("Error fetching posts:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPosts();
  }, [initialPosts]);
  // Filter posts based on search query and category
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = 
      searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.summary && post.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    // Now we can filter by category since it's implemented
    const matchesCategory = activeCategory === "all" || 
      post.category.toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-primary-800 dark:text-primary-100">
              Explore Posts
            </h2>
            <Link href="/posts/create" className="hidden sm:flex ml-4 items-center gap-1.5 text-sm bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-1.5 px-3 rounded-md transition-colors">
              <PlusCircle size={16} /> New Post
            </Link>
          </div>
          
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search posts..."
              className="pl-10 bg-white dark:bg-primary-800 border-gray-200 dark:border-primary-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 w-full overflow-x-auto flex whitespace-nowrap sm:justify-center">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                onClick={() => setActiveCategory(category.id)}
                className="px-4 py-2"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary-600"></div>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60">
                <p className="text-xl text-gray-500 dark:text-gray-400">No posts found</p>
                <p className="text-gray-400 dark:text-gray-500 mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* For other categories, we'll reuse the same content for now */}
          {categories.slice(1).map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              {loading ? (
                <div className="flex justify-center items-center h-60">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary-600"></div>
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-60">
                  <p className="text-xl text-gray-500 dark:text-gray-400">No posts found</p>
                  <p className="text-gray-400 dark:text-gray-500 mt-2">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default PostGrid;
