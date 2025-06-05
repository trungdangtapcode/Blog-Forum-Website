"use client";

import { FC, useEffect, useState } from "react";
import { Post, getPosts } from "@/utils/postFetching";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle } from "lucide-react";
import Link from "next/link";
import CategoryTabContent from "./CategoryTabContent";
import { Checkbox } from "@/components/ui/checkbox";

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

const PostGrid: FC<PostGridProps> = ({ initialPosts = [] }) => {  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState<boolean>(!initialPosts.length);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>("lastUpdate"); // Added state for sort option
  const initialPostCount = 12;

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
    // Filter posts based on search query, category, and verification status
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = 
      searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.summary && post.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by category
    const matchesCategory = activeCategory === "all" || 
      post.category.toLowerCase() === activeCategory.toLowerCase();
      
    // Filter by verification status if the toggle is on
    const matchesVerification = !showVerifiedOnly || post.isVerified;

    return matchesSearch && matchesCategory && matchesVerification;
  });

  // Sort posts based on the selected sort option
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortOption) {
      case "lastUpdate":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case "createDate":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "likes":
        return b.likes - a.likes;
      case "comments":
        return b.comments.length - a.comments.length;
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-primary-800 dark:text-primary-100">
              Explore Posts
            </h2>
            <Link href="/posts/create" className="hidden sm:flex ml-4 items-center gap-1.5 text-sm bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-1.5 px-3 rounded-md transition-colors">
              <PlusCircle size={16} /> New Post
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="verified-filter" 
                checked={showVerifiedOnly}
                onCheckedChange={(checked: boolean | "indeterminate") => setShowVerifiedOnly(checked === true)}
              />
              <label 
                htmlFor="verified-filter"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                <span>Verified Only</span>
                <span className="inline-flex ml-1.5 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                  Verified
                </span>
              </label>
            </div>

            <div className="relative">
              <select
                className="bg-white dark:bg-primary-800 border-gray-200 dark:border-primary-700 text-sm rounded-md py-1.5 px-3"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="lastUpdate">Last Update</option>
                <option value="createDate">Create Date</option>
                <option value="likes">Likes</option>
                <option value="comments">Comments</option>
              </select>
            </div>
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
          {/* Use the CategoryTabContent for "all" tab */}
          <TabsContent value="all" className="mt-0">
            <CategoryTabContent loading={loading} filteredPosts={sortedPosts} initialPostCount={initialPostCount} />
          </TabsContent>
          
          {/* For other categories */}
          {categories.slice(1).map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <CategoryTabContent loading={loading} filteredPosts={sortedPosts} initialPostCount={initialPostCount} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default PostGrid;
