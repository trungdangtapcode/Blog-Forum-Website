"use client";

import { useEffect, useState } from "react";
import { Post, getPostById, likePost, unlikePost, isPostLiked } from "@/utils/postFetching";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Share2, Bookmark, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import toast, { Toaster } from 'react-hot-toast';
import CommentSection from "@/components/post/CommentSection";
import Link from "next/link";

import type { FC } from "react";

interface PostDetailClientProps {
  params: { id: string };
}

const PostDetailClient: FC<PostDetailClientProps> = ({ params }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { id } = await params;
        const fetchedPost = await getPostById(id);
        setPost(fetchedPost);

        // Check if user has already liked/disliked the post
        const likeStatus = await isPostLiked(params.id);
        if (likeStatus && likeStatus.action) {
          setUserReaction(likeStatus.action);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params]);

  const handleReaction = async (action: 'like' | 'dislike') => {
    if (!post) return;
    
    try {
      // Toggle reaction if user already reacted the same way
      if (userReaction === action) {
        // Remove the reaction
        await unlikePost(post._id);
        setUserReaction(null);
        
        // Update UI first for responsiveness
        setPost(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            likes: action === 'like' ? prev.likes - 1 : prev.likes,
            dislikes: action === 'dislike' ? prev.dislikes - 1 : prev.dislikes
          };
        });
      } else {
        // Update UI first for responsiveness
        setPost(prev => {
          if (!prev) return prev;
          
          let newLikes = prev.likes;
          let newDislikes = prev.dislikes;
          
          // If changing from one reaction to another, update both counts
          if (userReaction === 'like' && action === 'dislike') {
            newLikes = prev.likes - 1;
            newDislikes = prev.dislikes + 1;
          } else if (userReaction === 'dislike' && action === 'like') {
            newLikes = prev.likes + 1;
            newDislikes = prev.dislikes - 1;
          } else if (action === 'like') {
            newLikes = prev.likes + 1;
          } else if (action === 'dislike') {
            newDislikes = prev.dislikes + 1;
          }
          
          return {
            ...prev,
            likes: newLikes,
            dislikes: newDislikes
          };
        });
        
        setUserReaction(action);
        await likePost(post._id, action);
      }
    } catch (error) {
      console.error("Error reacting to post:", error);
      toast.error("Failed to register your reaction. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/4 mb-8" />
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Post not found</h1>
        <p>The post you&#39;re looking for doesn&#39;t exist or has been removed.</p>
        <Link href="/posts">
          <Button variant="secondary" className="mt-6">
            Back to Posts
          </Button>
        </Link>
      </div>
    );
  }

  // Create category color based on category name
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
    <div>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Link href="/posts" className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts
        </Link>
        
        {/* Post Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-primary-800 dark:text-primary-100">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Badge variant="outline" className={getCategoryColor(post.category)}>
              {post.category || "General"}
            </Badge>
            
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {post.createdAt ? format(new Date(post.createdAt), 'MMMM dd, yyyy') : "Unknown date"}
            </span>
          </div>
          
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/default-avatar.png" alt="Author Avatar" />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="font-medium">{post.author || "Anonymous"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Author</p>
            </div>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        {/* Post Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        
        {/* Post Actions */}
        <div className="border bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('like')}
              className={userReaction === 'like' ? 'text-green-600 bg-green-50 dark:bg-green-900/30' : ''}
            >
              <ThumbsUp className="h-5 w-5 mr-2" />
              {post.likes} Upvotes
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('dislike')}
              className={userReaction === 'dislike' ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : ''}
            >
              <ThumbsDown className="h-5 w-5 mr-2" />
              {post.dislikes} Downvotes
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        {/* Comments Section */}
        <CommentSection postId={post._id} initialComments={post.comments || []} />
      </div>
      
      <Toaster />
    </div>
  );
}

export default PostDetailClient;