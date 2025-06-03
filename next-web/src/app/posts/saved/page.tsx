'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSavedPosts } from '@/utils/savePostFetching';
import { auth0Client } from '@/lib/auth0-client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { formatDistanceToNowSimple } from '@/utils/distanceToNow';
import SavePostButton from '@/components/post/SavePostButton';
import { Badge } from '@/components/ui/badge';
import { 
  Tag, ThumbsUp, MessageCircle, ArrowLeft, Search,
  SortAsc, SortDesc, Star
} from 'lucide-react';
import { Post } from '@/utils/postFetching';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function SavedPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);  const [loading, setLoading] = useState(true);
  const [errorMsg, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<string>("newest");
  const router = useRouter();
  useEffect(() => {
    async function checkAuthAndFetchPosts() {
      try {
        const token = await auth0Client.getToken();        if (!token) {
          setIsAuthenticated(false);
          setError('You must be logged in to view your saved posts');
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);
        const fetchedPosts = await getSavedPosts();
        setPosts(fetchedPosts);
        
        // Notify if we have posts
        if (fetchedPosts.length > 0) {
          toast.success(`Found ${fetchedPosts.length} saved post${fetchedPosts.length !== 1 ? 's' : ''}`);
        }      } catch (err) {
        console.error('Error fetching saved posts:', err);
        setError('Failed to load saved posts');
        toast.error('Failed to load saved posts');
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndFetchPosts();
  }, []);
  const handleLogin = () => {
    router.push('/api/auth/login');
  };

  // Define category color based on category name (consistent with PostCard component)
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
  };  // Listen for unsave events from SavePostButton
  useEffect(() => {
    const handleSaveChange = (event: Event) => {
      if ('detail' in event && (event as CustomEvent).detail?.postId) {
        const { postId, action } = (event as CustomEvent).detail;
        if (action === 'unsave') {
          setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        }
      }
    };

    window.addEventListener('savePostChange', handleSaveChange);
    return () => {
      window.removeEventListener('savePostChange', handleSaveChange);
    };
  }, []);
  
  // Effect for filtering and sorting posts
  useEffect(() => {
    if (!posts.length) return;
    
    // Start with all posts
    let result = [...posts];
    
    // Apply search filter if there's a query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.content.toLowerCase().includes(query) ||
        (post.summary && post.summary.toLowerCase().includes(query)) ||
        (post.category && post.category.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case "newest":
        result.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        result.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "popular":
        result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Default is newest first
        result.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    
    setFilteredPosts(result);
  }, [posts, searchQuery, sortOption]);
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <Link href="/posts" className="inline-flex items-center text-primary-600 hover:text-primary-800 mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts
          </Link>
          <h1 className="text-3xl font-bold">Saved Posts</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
        <Toaster />
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="max-w-lg mx-auto py-10 px-8 bg-white dark:bg-primary-900 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold mb-4">Saved Posts</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">You must be logged in to view your saved posts</p>
          <Button 
            onClick={handleLogin} 
            className="bg-primary-600 hover:bg-primary-700"
          >
            Sign In
          </Button>
          <div className="mt-6">
            <Link href="/posts" className="text-primary-600 hover:text-primary-800">
              Browse posts instead
            </Link>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }
  if (errorMsg) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="max-w-lg mx-auto py-10 px-8 bg-white dark:bg-primary-900 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold mb-4">Saved Posts</h1>
          <p className="text-red-500 mb-6">{errorMsg}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/posts">Browse Posts</Link>
            </Button>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }if (posts.length === 0 && !searchQuery) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <Link href="/posts" className="inline-flex items-center text-primary-600 hover:text-primary-800 mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts
          </Link>
          <h1 className="text-3xl font-bold">Saved Posts</h1>
        </div>
        <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md p-10 text-center max-w-2xl mx-auto">
          <div className="mb-6 text-gray-500 dark:text-gray-400">
            <ThumbsUp className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-semibold mb-2">No Saved Posts Yet</h2>
            <p className="mb-6">You don&apos;t have any saved posts yet. Start exploring and save the posts you find interesting!</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="bg-primary-600 hover:bg-primary-700">
              <Link href="/posts">Browse Posts</Link>
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {                try {
                  setLoading(true);
                  const refreshedPosts = await getSavedPosts();
                  setPosts(refreshedPosts);
                  if (refreshedPosts.length > 0) {
                    toast.success("Found newly saved posts!");
                  }
                } catch (err) {
                  console.error("Error refreshing posts:", err);
                  toast.error("Failed to refresh posts");
                } finally {
                  setLoading(false);
                }
              }}
            >
              Refresh Posts
            </Button>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }
  return (
    <div className="container mx-auto py-8 px-4">      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/posts" className="inline-flex items-center text-primary-600 hover:text-primary-800 mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts
          </Link>
          <h1 className="text-3xl font-bold">Saved Posts</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={async () => {              try {
                setLoading(true);
                const refreshedPosts = await getSavedPosts();
                setPosts(refreshedPosts);
                toast.success("Posts refreshed");
              } catch (err) {
                console.error("Error refreshing posts:", err);
                toast.error("Failed to refresh posts");
              } finally {
                setLoading(false);
              }
            }}
            className="text-xs flex items-center gap-1"
          >
            <motion.div
              animate={{ rotate: loading ? 360 : 0 }}
              transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                <path d="M16 21h5v-5"/>
              </svg>
            </motion.div>
            Refresh
          </Button>          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} {searchQuery ? 'found' : 'saved'}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search saved posts..."
            className="pl-10 bg-white dark:bg-primary-800 border-gray-200 dark:border-primary-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              {sortOption === "newest" && <SortDesc className="h-4 w-4 mr-1" />}
              {sortOption === "oldest" && <SortAsc className="h-4 w-4 mr-1" />}
              {sortOption === "popular" && <ThumbsUp className="h-4 w-4 mr-1" />}
              {sortOption === "title" && <Star className="h-4 w-4 mr-1" />}
              
              {sortOption === "newest" && "Newest First"}
              {sortOption === "oldest" && "Oldest First"}
              {sortOption === "popular" && "Most Popular"}
              {sortOption === "title" && "By Title"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setSortOption("newest")}
              className={`${sortOption === "newest" ? "bg-primary-50 dark:bg-primary-900" : ""} cursor-pointer`}
            >
              <SortDesc className="h-4 w-4 mr-2" /> Newest First
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortOption("oldest")}
              className={`${sortOption === "oldest" ? "bg-primary-50 dark:bg-primary-900" : ""} cursor-pointer`}
            >
              <SortAsc className="h-4 w-4 mr-2" /> Oldest First
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortOption("popular")}
              className={`${sortOption === "popular" ? "bg-primary-50 dark:bg-primary-900" : ""} cursor-pointer`}
            >
              <ThumbsUp className="h-4 w-4 mr-2" /> Most Popular
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortOption("title")}
              className={`${sortOption === "title" ? "bg-primary-50 dark:bg-primary-900" : ""} cursor-pointer`}
            >
              <Star className="h-4 w-4 mr-2" /> By Title
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>      {filteredPosts.length === 0 && searchQuery && (
        <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md p-10 text-center max-w-2xl mx-auto">
          <div className="mb-6 text-gray-500 dark:text-gray-400">
            <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
            <p className="mb-6">No posts matching &ldquo;{searchQuery}&rdquo; were found in your saved items.</p>
          </div>
          <Button 
            onClick={() => setSearchQuery("")} 
            className="bg-primary-600 hover:bg-primary-700"
          >
            Clear Search
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post, index) => {
          // Truncate content for preview
          const truncatedContent = post.summary || (post.content.length > 150 
            ? post.content.substring(0, 150) + '...' 
            : post.content);
            
          return (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="line-clamp-2 hover:text-primary-600 text-lg">
                      <Link href={`/posts/${post._id}`}>{post.title}</Link>
                    </CardTitle>
                    {post.category && (
                      <Badge variant="outline" className={getCategoryColor(post.category)}>
                        <Tag className="h-3 w-3 mr-1" />
                        {post.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {post.createdAt && formatDistanceToNowSimple(new Date(post.createdAt))}
                  </p>
                </CardHeader>
                <CardContent className="flex-grow pt-2">
                  <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                    {truncatedContent}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-gray-500">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span className="text-xs">{post.likes || 0}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">{post.comments?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/posts/${post._id}`}>Read</Link>
                    </Button>
                    <SavePostButton 
                      postId={post._id} 
                      showLabel 
                      size="sm" 
                      variant="secondary"
                      className="bg-secondary-100 text-secondary-800 hover:bg-secondary-200 dark:bg-secondary-900 dark:text-secondary-200"
                    />
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
      <Toaster />
    </div>
  );
}
