import { FC, useState, useEffect, useRef } from "react";
import { Post } from "@/utils/postFetching";
import { getPublicProfile } from "@/utils/fetchingProfilePublic";
import PostCard from "./PostCard";
import { Button } from "@/components/ui/button";

interface CategoryTabContentProps {
  loading: boolean;
  filteredPosts: Post[];
  initialPostCount?: number;
}

const CategoryTabContent: FC<CategoryTabContentProps> = ({ 
  loading, 
  filteredPosts,
  initialPostCount = 6  // Default to show 6 posts initially
}) => {
  const [authors, setAuthors] = useState<Record<string, AccountPublicProfile | null>>({});
  const [visiblePosts, setVisiblePosts] = useState<number>(initialPostCount);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  // Use a ref to avoid infinite re-renders
  const authorsRef = useRef<Record<string, AccountPublicProfile | null>>({});

  // Display only the visible number of posts
  const postsToDisplay = filteredPosts.slice(0, visiblePosts);
  const hasMorePosts = filteredPosts.length > visiblePosts;
  
  // Reset visible posts when filtered posts change
  useEffect(() => {
    setVisiblePosts(initialPostCount);
  }, [filteredPosts, initialPostCount]);
  
  // Fetch author information for visible posts only
  useEffect(() => {
    // Skip fetching if there are no posts to display
    if (filteredPosts.length === 0) return;
    
    // Extract authorIds, handling both string and Author object types
    const authorIds = [...new Set(filteredPosts
      .slice(0, visiblePosts)
      .map(post => {
        // If author is an object, use its _id property, otherwise use the string as is
        if (typeof post.author === 'object' && post.author !== null) {
          return post.author._id;
        }
        return post.author;
      })
      .filter(id => id) // Filter out any null or undefined values
    )];
    
    // Skip if we don't have any new authors to fetch
    if (authorIds.every(id => typeof id === 'string' && authorsRef.current[id] !== undefined)) {
      // If all authors are already in our ref, just make sure our state is in sync
      const currentAuthors = authorIds.reduce((acc, id) => {
        if (typeof id === 'string') {
          acc[id] = authorsRef.current[id];
        }
        return acc;
      }, {} as Record<string, AccountPublicProfile | null>);
      
      setAuthors(prev => ({...prev, ...currentAuthors}));
      return;
    }
    
    // Fetch author profiles that we don't already have
    const fetchAuthors = async () => {
      const newAuthorsData: Record<string, AccountPublicProfile | null> = {};
      
      for (const authorId of authorIds) {
        if (typeof authorId !== 'string') continue;
        
        if (authorsRef.current[authorId] === undefined) {
          try {
            const profile = await getPublicProfile(authorId);
            newAuthorsData[authorId] = profile;
            authorsRef.current[authorId] = profile;
          } catch (err) {
            console.error(`Error fetching profile for ${authorId}:`, err);
            newAuthorsData[authorId] = null;
            authorsRef.current[authorId] = null;
          }
        } else {
          newAuthorsData[authorId] = authorsRef.current[authorId];
        }
      }
      
      setAuthors(prev => ({...prev, ...newAuthorsData}));
    };
    
    fetchAuthors();
  }, [filteredPosts, visiblePosts]);

  // Function to load more posts
  const loadMorePosts = async () => {
    setLoadingMore(true);
    
    try {
      // Add more posts to the visible count
      const newVisibleCount = visiblePosts + initialPostCount;
      setVisiblePosts(newVisibleCount);
      
      // Fetch new author profiles for the newly visible posts
      const newPosts = filteredPosts.slice(visiblePosts, newVisibleCount);
      const newAuthorIds = [...new Set(newPosts.map(post => {
        if (typeof post.author === 'object' && post.author !== null) {
          return post.author._id;
        }
        return post.author;
      }).filter(id => typeof id === 'string'))] as string[];
      
      const newAuthorsToFetch = newAuthorIds.filter(id => id && authorsRef.current[id] === undefined);
      
      if (newAuthorsToFetch.length > 0) {
        const newAuthorsData: Record<string, AccountPublicProfile | null> = {};
        
        for (const authorId of newAuthorsToFetch) {
          continue
          // skip because we already have the author, fetch from first
          // if the scale of posts is larger (in future), then I will use this code below
          try {
            const profile = await getPublicProfile(authorId);
            newAuthorsData[authorId] = profile;
            authorsRef.current[authorId] = profile;
          } catch (err) {
            console.error(`Error fetching profile for ${authorId}:`, err);
            newAuthorsData[authorId] = null;
            authorsRef.current[authorId] = null;
          }
        }
        
        setAuthors(prev => ({...prev, ...newAuthorsData}));
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };
  
  // Show loading state when no posts yet
  if (loading && filteredPosts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">        
        {postsToDisplay.map((post) => {
          // Create a modified post object for the PostCard component
          let authorAvatar: string = "/default-avatar.png";
          let authorName: string = "Anonymous";
          
          // If author is an object, use its properties directly
          if (typeof post.author === 'object' && post.author !== null) {
            authorAvatar = post.author.avatar || "/default-avatar.png";
            authorName = post.author.fullName || "Anonymous";
          } 
          // If author is a string (ID), use the fetched author data
          else if (typeof post.author === 'string' && authors[post.author]) {
            authorAvatar = authors[post.author]?.avatar || "/default-avatar.png";
            
            authorName = authors[post.author]?.fullName || "Anonymous";
          }
          
          
          return (
            <PostCard 
              key={post._id} 
              post={{
                ...post,
                authorAvatar,
                authorName
              }} 
            />
          );
        })}
      </div>
      
      {/* Load More Button */}
      {hasMorePosts && (
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={loadMorePosts} 
            disabled={loadingMore}
            className="min-w-[160px]"
          >
            {loadingMore ? 'Loading...' : 'Load More Posts'}
          </Button>
        </div>
      )}
    </>
  );
};

export default CategoryTabContent;