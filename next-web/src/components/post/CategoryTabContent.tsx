import { FC, useState, useEffect } from "react";
import { Post } from "@/utils/postFetching";
import { getPublicProfile } from "@/utils/fetchingProfilePublic";
import PostCard from "./PostCard";

interface CategoryTabContentProps {
  loading: boolean;
  filteredPosts: Post[];
}

const CategoryTabContent: FC<CategoryTabContentProps> = ({ 
  loading, 
  filteredPosts 
}) => {
  const [authors, setAuthors] = useState<Record<string, AccountPublicProfile | null>>({});

  // Fetch author information for all posts
  useEffect(() => {
    const fetchAuthors = async () => {
      const authorIds = [...new Set(filteredPosts.map(post => post.author))];
      const authorsData: Record<string, AccountPublicProfile | null> = {};
      
      for (const authorId of authorIds) if (authorId) {
        try {
          const profile = await getPublicProfile(authorId);
          authorsData[authorId] = profile;
        } catch (error) {
          console.error(`Error fetching author ${authorId}:`, error);
          authorsData[authorId] = null;
        }
      }
      
      setAuthors(authorsData);
    };

    if (filteredPosts.length > 0) {
      fetchAuthors();
    }
  }, [filteredPosts]);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary-600"></div>
        </div>      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">          {filteredPosts.map((post) => (
            <PostCard key={post._id} post={{
              ...post,
              // If we have author information, update the post author property with the full name
              author: authors[post.author]?.fullName || post.author,
              // Also pass the author avatar
              authorAvatar: authors[post.author]?.avatar || "/default-avatar.png"
            }} />
          ))}
        </div>
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