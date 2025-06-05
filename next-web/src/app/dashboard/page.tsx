/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProfile } from "@/utils/fetchingProfile";
import { getDashboardStats } from "@/utils/dashboardFetching";
import { getPosts } from "@/utils/postFetching";
import { Metadata } from "next";
import { auth0 } from "@/lib/auth0";
import DashboardClient from "./dashboard-client";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard | Blog Forum",
  description: "View your account dashboard and analytics",
};

export default async function DashboardPage() {
  try {
    const session = await auth0.getSession();
    
    // If there's no session, redirect to login
    if (!session?.user) {
      return redirect("/api/auth/login?returnTo=/dashboard");
    }

    // Get user profile data
    const profileData = await getProfile();

    
    // Get dashboard statistics from the API
    const dashboardData = await getDashboardStats();
    
    // Get all posts to display on the dashboard
    const allPosts = await getPosts();
    
    // Filter posts created by the current user
    const userPosts = allPosts.filter((post: any) => 
      typeof post.author === 'object' && post.author.email === profileData.email
    );    return (
      <div className="container mx-auto px-4 py-8">
        <DashboardClient 
          profile={profileData} 
          userPosts={userPosts}
          stats={dashboardData.stats || {
            totalPosts: userPosts.length,
            totalLikes: userPosts.reduce((sum: number, post: any) => sum + (post.likes || 0), 0),
            averageLikes: userPosts.length > 0 
              ? userPosts.reduce((sum: number, post: any) => sum + (post.likes || 0), 0) / userPosts.length 
              : 0,
            totalComments: userPosts.reduce((sum: number, post: any) => sum + (post.comments?.length || 0), 0),
            savedPostsCount: profileData.savedPosts?.length || 0,
            followersCount: 0,
            followingCount: 0
          }}
          categories={dashboardData.categories || {}}
          timeline={dashboardData.timeline || {}}
          recentActivity={dashboardData.recentActivity || []}
        />
      </div>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard Error</h1>
        <p>There was an error loading your dashboard. Please try again later.</p>
        <Link href="/" className="text-blue-500 hover:underline">Return to Home</Link>
      </div>
    );
  }
}
