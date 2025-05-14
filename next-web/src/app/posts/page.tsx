import { Metadata } from "next";
import PostGrid from "@/components/post/PostGrid";
import { getPosts } from "@/utils/postFetching";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog Forum | Explore Posts",
  description: "Browse through various blog posts across different categories",
};

export default async function PostsPage() {
  // Server-side fetch of initial posts
  const initialPosts = await getPosts();
  
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">      <div className="pt-16 pb-8 text-center bg-gradient-to-r from-primary-700 to-secondary-700 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog Forum</h1>
        <p className="text-xl max-w-2xl mx-auto px-4">
          Discover interesting articles, stories, and discussions across various topics
        </p>
        <div className="mt-6">
          <Link href="/posts/create" className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-gray-100 font-medium py-2 px-4 rounded-full transition-colors">
            <PlusCircle size={18} /> Create New Post
          </Link>
        </div>
      </div>

      <PostGrid initialPosts={initialPosts} />
    </main>
  );
}
