"use client";

import { useEffect, useState } from "react";
import { getPublicProfile } from "@/utils/fetchingProfilePublic";
import { getPostsByAuthor, Post } from "@/utils/postFetching";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Briefcase, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import toast, { Toaster } from 'react-hot-toast';

interface AccountPublicProfile {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string;
  fullName?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  joinedDate?: Date | string;
}

interface ProfilePageClientProps {
  params: { id: string };
}

const ProfilePageClient = ({ params }: ProfilePageClientProps) => {
  const [profile, setProfile] = useState<AccountPublicProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        const { id } = await params;
        if (!id) {
          toast.error("Invalid profile ID");
          setLoading(false);
          return;
        }

        // Fetch profile information
        const profileData = await getPublicProfile(id);
        console.log(profileData)
        setProfile(profileData);

        // Fetch posts by this author
        const authorPosts = await getPostsByAuthor(id);
        setPosts(Array.isArray(authorPosts) ? authorPosts : []);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPosts();
  }, [params]);

  // Function to truncate post content for preview
  const truncateContent = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Function to create category color based on category name
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
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
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center space-x-4 mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-60" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        
        <Skeleton className="h-32 w-full mb-8" />
        
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Profile not found</h1>
        <p>The profile you&#39;re looking for doesn&#39;t exist or has been removed.</p>
        <Link href="/posts">
          <Button variant="secondary" className="mt-6">
            Back to Posts
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/posts" className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts
      </Link>
      
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.avatar || "/default-avatar.png"} alt="Profile Avatar" />
          <AvatarFallback>{profile.fullName?.substring(0, 2) || "AU"}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold mb-2">{profile.fullName || "Anonymous User"}</h1>
          
          <div className="flex flex-wrap gap-3 text-gray-600 dark:text-gray-400 mb-3">
            {profile.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile.occupation && (
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                <span>{profile.occupation}</span>
              </div>
            )}
          </div>
          
          {profile.joinedDate && (
            <div className="text-sm text-gray-500 dark:text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Joined {format(new Date(profile.joinedDate), "MMMM yyyy")}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Bio */}
      {profile.bio && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3">About</h2>
          <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
        </div>
      )}
      
      <Separator className="my-8" />
      
      {/* User's Posts */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Posts by {profile.fullName || "this user"}</h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <Card key={post._id} className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary-900/5">
                <CardHeader>
                  <CardTitle>
                    <Link href={`/posts/${post._id}`} className="hover:text-primary-600 transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="flex items-center justify-between">
                    <span>
                      Posted on {post.createdAt ? format(new Date(post.createdAt), 'MMMM dd, yyyy') : "Unknown date"}
                    </span>
                    <Badge variant="outline" className={getCategoryColor(post.category)}>
                      {post.category || "General"}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    {post.summary ? post.summary : truncateContent(post.content)}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{post.likes || 0} likes</span>
                    <span>•</span>
                    <span>{post.comments?.length || 0} comments</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/posts/${post._id}`}>
                      Read More
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Toaster />
    </div>
  );
};

export default ProfilePageClient;
