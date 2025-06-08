"use client";

import { useEffect, useState } from "react";
import { Post, getPostById, likePost, unlikePost, isPostLiked, isPostAuthor, deletePost } from "@/utils/postFetching";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import toast, { Toaster } from 'react-hot-toast';
import { AudioPlayer } from "@/components/ui/audio-player";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import CommentSection from "@/components/post/FixedCommentSection2";
import SharingBox from "@/components/post/SharingBox";
import SavePostButton from "@/components/post/SavePostButton";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useRouter } from "next/navigation";

import type { FC } from "react";
import { getPublicProfile } from "@/utils/fetchingProfilePublic";

interface PostDetailClientProps {
  params: { id: string };
}

const PostDetailClient: FC<PostDetailClientProps> = ({ params }) => {  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState<AccountPublicProfile | null>(null);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [reactionInProgress, setReactionInProgress] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { id } = await params;
        const fetchedPost = await getPostById(id);
        setPost(fetchedPost);

        const publicProfile = await getPublicProfile(fetchedPost.author);
        setAuthor(publicProfile);

        try {
          const authorStatus = await isPostAuthor(id);
          setIsAuthor(authorStatus);
        } catch (error) {
          console.error("Error checking author status:", error);
        }

        try {
          const likeStatus = await isPostLiked(id);
          
          console.log('likeStatus:',likeStatus)
          if (likeStatus && likeStatus.action) {
            setUserReaction(likeStatus.action);
          }
        } catch (error) {
          console.error("Error checking like status:", error);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params]);const handleReaction = async (action: 'like' | 'dislike') => {
    if (!post) return;
    
    if (reactionInProgress) {
      toast.error("Please wait for the previous action to complete");
      return;
    }
    
    setReactionInProgress(true);
    
    try {
      if (userReaction === action) {
        setPost(prev => {
          if (!prev) return prev;
          
          const delta = action === 'like' ? -1 : 1;
          
          return {
            ...prev,
            likes: Math.max(0, prev.likes + delta)
          };
        });
        
        setUserReaction(null);
        
        await unlikePost(post._id);
        toast.success(`Your ${action} has been removed`);
      } else {
        setPost(prev => {
          if (!prev) return prev;
          
          let delta = 0;
          
          if (userReaction) {
            delta = action === 'like' ? 2 : -2;
          } else {
            delta = action === 'like' ? 1 : -1;
          }
          
          return {
            ...prev,
            likes: prev.likes + delta
          };
        });
        
        setUserReaction(action);
        
        await likePost(post._id, action);
        toast.success(`Post ${action === 'like' ? 'liked' : 'disliked'} successfully`);
      }
    } catch (error) {
      console.error("Error reacting to post:", error);
      toast.error("Failed to register your reaction. Please try again.");
      
      setUserReaction(prevReaction => {
        if (prevReaction === action) {
          return action;
        } 
        else {
          return userReaction;
        }
      });
        try {
        const { id } = params;
        const fetchedPost = await getPostById(id);
        setPost(fetchedPost);
      } catch (error) {
        console.error("Error restoring post state:", error);
      }
    } finally {
      setTimeout(() => {
        setReactionInProgress(false);
      }, 500);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    
    setAlertOpen(false);
    
    try {
      await deletePost(post._id);
      toast.success("Post deleted successfully");
      router.push("/posts");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post. Please try again.");
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl ">
        <Skeleton className="h-[125px] w-[250px] rounded-xl mb-4" />
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
            
            {post.isVerified && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-800 dark:bg-green-900 dark:text-green-300 dark:border-green-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                Verified
              </Badge>
            )}
            
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {post.createdAt ? format(new Date(post.createdAt), 'MMMM dd, yyyy') : "Unknown date"}
            </span>
          </div>
            <Link href={`/profile/${post.author && typeof post.author !== 'string' ? post.author._id : post.author}`} className="flex items-center group">
            <Avatar className="h-10 w-10">
              <AvatarImage src={author?.avatar || "/default-avatar.png"} alt="Author Avatar" />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="font-medium group-hover:text-primary-600 transition-colors">{author?.fullName || "Anonymous"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Author</p>
            </div>
          </Link>
        </div>
        
        <Separator className="my-8" />
        
        {/* Post Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({...props}) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
              h2: ({...props}) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
              h3: ({...props}) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
              h4: ({...props}) => <h4 className="text-lg font-bold mt-3 mb-2" {...props} />,
              h5: ({...props}) => <h5 className="text-base font-bold mt-3 mb-1" {...props} />,
              h6: ({...props}) => <h6 className="text-sm font-bold mt-3 mb-1" {...props} />,
              table: ({...props}) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700" {...props} />
                </div>
              ),
              thead: ({...props}) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
              tbody: ({...props}) => <tbody {...props} />,
              tr: ({...props}) => <tr className="border-b border-gray-300 dark:border-gray-700" {...props} />,
              th: ({...props}) => <th className="px-4 py-2 text-left font-semibold border-r border-gray-300 dark:border-gray-700 last:border-r-0" {...props} />,
              td: ({...props}) => <td className="px-4 py-2 border-r border-gray-300 dark:border-gray-700 last:border-r-0" {...props} />,              code: ({className, children, ...props}) => {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (                  
                <SyntaxHighlighter
                    // @ts-expect-error - Type issue with the style prop
                    style={tomorrow}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={`${className} bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm`} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
        
        {/* Post Actions */}
        <div className="border bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex gap-4 items-center">
            {/* Votes count first, on the left */}
            <div className={`px-3 py-1 rounded-md font-medium ${
              post.likes > 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/30' : 
              'text-gray-600 bg-gray-50 dark:bg-gray-700'
            }`}>
              {post.likes || 0} votes
            </div>
              <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('like')}
              className={userReaction === 'like' ? 'text-green-600 bg-green-50 dark:bg-green-900/30' : ''}
              disabled={reactionInProgress}
            >
              <ThumbsUp className={`h-5 w-5 mr-2 ${reactionInProgress ? 'animate-pulse' : ''}`} />
              {userReaction === 'like' ? 'Liked' : 'Like'}
            </Button>
              <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('dislike')}
              className={userReaction === 'dislike' ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : ''}
              disabled={reactionInProgress}
            >
              <ThumbsDown className={`h-5 w-5 mr-2 ${reactionInProgress ? 'animate-pulse' : ''}`} />
              Dislike
            </Button>
            
            {/* Audio Player */}
            <AudioPlayer postId={post._id} />
          </div>          
          <div className="flex gap-2">
            {isAuthor && (
              <>
                <Link href={`/posts/edit/${post._id}`}>
                  <Button variant="outline" size="icon" title="Edit Post">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>                <Button 
                  variant="outline" 
                  size="icon" 
                  title="Delete Post" 
                  className="border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={() => setAlertOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <SharingBox postId={post._id} postTitle={post.title} />
            
            <SavePostButton postId={post._id} variant="outline" size="icon" />
          </div>
        </div>
        
        <Separator className="my-8" />
        
        {/* Comments Section */}
        <CommentSection postId={post._id} initialComments={post.comments || []} />
      </div>
      
      <Toaster />
      
      {/* Alert Dialog for Deleting Post */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Confirm Deletion
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-sm text-gray-500">
            Are you sure you want to delete this post? This action cannot be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-red-600 text-white hover:bg-red-700">
              <Trash2 className="mr-2 h-5 w-5" />
              Delete Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default PostDetailClient;