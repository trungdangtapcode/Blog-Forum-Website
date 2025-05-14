import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import CategoryGrid from "@/components/post/CategoryGrid";
import FeaturedPosts from "@/components/post/FeaturedPosts";
import Link from "next/link";
import { ChevronRight, MessageSquare } from "lucide-react";
import Image from "next/image";
import { auth0 } from "@/lib/auth0";

export const metadata: Metadata = {
  title: "Blog Forum | Home",
  description: "A community-driven blog forum for sharing ideas, stories, and discussions",
};

export default async function Home() {
  const session = await auth0.getSession();
  console.log("Session in Home:", session);
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-900 text-white">
        <div className="container mx-auto px-4 py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Share Your Voice, <br />
              Discover New Ideas
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-lg">
              Join our thriving community of writers and readers. Create, discuss, and explore content that matters to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/posts">
                <Button size="lg" className="bg-secondary-500 hover:bg-secondary-600 text-white border-0">
                  Explore Posts <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/posts/create">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  Create a Post <MessageSquare className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-secondary-500 rounded-full opacity-20"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondary-700 rounded-full opacity-20"></div>
            <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 p-4 rounded-2xl shadow-xl">
              <Image
                src="/landing.png"
                alt="Blog forum interface"
                width={600}
                height={400}
                className="rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <FeaturedPosts />

      {/* Categories Section */}
      <CategoryGrid />

      {/* Call to Action */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary-700 to-primary-800 rounded-2xl py-12 px-8 text-white text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">Ready to share your story?</h2>
              <p className="text-lg opacity-90 mb-8">
                Join our community of writers and readers. Start sharing your thoughts today.
              </p>
              <Link href="/posts/create">
                <Button size="lg" className="bg-white text-primary-800 hover:bg-gray-100">
                  Create Your First Post <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}