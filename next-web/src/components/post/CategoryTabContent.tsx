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
  }, [filteredPosts, initialPostCount]);    // Fetch author information for visible posts only
  useEffect(() => {
    // Skip fetching if there are no posts to display
    if (filteredPosts.length === 0) return;
    
    // No need to recalculate posts to display here
    const authorIds = [...new Set(filteredPosts
      .slice(0, visiblePosts)
      .map(post => post.author)
      .filter(id => id) // Filter out any null or undefined values
    )];
    
    // Skip if we don't have any new authors to fetch
    if (authorIds.every(id => authorsRef.current[id] !== undefined)) {
      // If all authors are already in our ref, just make sure our state is in sync
      const currentAuthors = authorIds.reduce((acc, id) => {
        acc[id] = authorsRef.current[id];
        return acc;
      }, {} as Record<string, AccountPublicProfile | null>);
      
      setAuthors(prev => ({...prev, ...currentAuthors}));
      return;
    }
    
    // Otherwise, fetch the missing authors
    const fetchAuthors = async () => {
      const newAuthorsData: Record<string, AccountPublicProfile | null> = {};
      let hasNewData = false;
      
      for (const authorId of authorIds) {
        // Only fetch if we don't already have this author's data
        if (authorsRef.current[authorId] === undefined) {
          try {
            const profile = await getPublicProfile(authorId);
            newAuthorsData[authorId] = profile;
            // Update our ref
            authorsRef.current[authorId] = profile;
            hasNewData = true;
          } catch (error) {
            console.error(`Error fetching author ${authorId}:`, error);
            newAuthorsData[authorId] = null;
            authorsRef.current[authorId] = null;
            hasNewData = true;
          }
        } else {
          // Use existing author data from the ref
          newAuthorsData[authorId] = authorsRef.current[authorId];
        }
      }
      
      // Only update state if we have new data
      if (hasNewData) {
        setAuthors(prev => ({ ...prev, ...newAuthorsData }));
      }
    };

    fetchAuthors();
  }, [filteredPosts, visiblePosts]);// Depend on the source values rather than the derived value
  // Load more posts and their authors
  const handleLoadMore = async () => {
    // Prevent multiple simultaneous "load more" operations
    if (loadingMore) return;
    
    setLoadingMore(true);
    
    try {
      // Increase the number of visible posts
      const newVisibleCount = Math.min(visiblePosts + initialPostCount, filteredPosts.length);
      
      // Get the newly visible posts
      const newPosts = filteredPosts.slice(visiblePosts, newVisibleCount);
      
      // Fetch authors for the new posts
      const newAuthorIds = [...new Set(newPosts.map(post => post.author))];
      const newAuthorsToFetch = newAuthorIds.filter(id => id && authorsRef.current[id] === undefined);
      
      // Only fetch authors if we have new ones to fetch
      if (newAuthorsToFetch.length > 0) {
        const newAuthorsData: Record<string, AccountPublicProfile | null> = {};
        
        for (const authorId of newAuthorsToFetch) {
          try {
            const profile = await getPublicProfile(authorId);
            newAuthorsData[authorId] = profile;
            // Also update the ref
            authorsRef.current[authorId] = profile;
          } catch (error) {
            console.error(`Error fetching author ${authorId}:`, error);
            newAuthorsData[authorId] = null;
            authorsRef.current[authorId] = null;
          }
        }
        
        // Update the authors state with new data
        if (Object.keys(newAuthorsData).length > 0) {
          setAuthors(prev => ({ ...prev, ...newAuthorsData }));
        }
      }
      
      // Update the visible posts count
      setVisiblePosts(newVisibleCount);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary-600"></div>
        </div>
      ) : filteredPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postsToDisplay.map((post) => (
              <PostCard key={post._id} post={{
                ...post,
                // If we have author information, update the post author property with the full name
                author: authors[post.author]?.fullName || post.author,
                // Also pass the author avatar
                authorAvatar: authors[post.author]?.avatar || "/default-avatar.png"
              }} />
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMorePosts && (
            <div className="mt-8 text-center">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="min-w-[150px]"
              >
                {loadingMore ? (
                  <>
                    <span className="mr-2">Loading</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </>
                ) : (
                  `View More (${filteredPosts.length - visiblePosts} remaining)`
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-60">
          <p className="text-xl text-gray-500 dark:text-gray-400">No posts found</p>
          <p className="text-gray-400 dark:text-gray-500 mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </>
  );
};

export default CategoryTabContent;