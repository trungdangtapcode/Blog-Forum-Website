"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNowSimple } from "@/utils/distanceToNow";
import { auth0 } from "@/lib/auth0";
import { Loader2 } from "lucide-react";

interface Author {
  name: string;
  avatar?: string;
}

interface SimpleComment {
  _id: string;
  content: string;
  author: Author;
  createdAt: Date;
}

interface CommentSectionProps {
  postId: string;
  initialComments?: string[]; // Comment IDs from the post
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CommentSection: React.FC<CommentSectionProps> = ({ postId, initialComments = [] }) => {
  const [comments, setComments] = useState<SimpleComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await auth0.getAccessToken();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        // For demonstration purposes - replace with actual API call
        const dummyComments = initialComments.map((id, index) => ({
          _id: id,
          content: `This is a comment ${index + 1} for this post. This would be replaced with real comment data from the API.`,
          author: {
            name: `User ${index + 1}`,
            avatar: "/default-avatar.png"
          },
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
        }));
        
        setComments(dummyComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (initialComments.length > 0) {
      fetchComments();
    } else {
      setLoading(false);
    }
  }, [initialComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the new comment to our list (in a real app, we'd use the returned data from API)
      const newCommentObj: SimpleComment = {
        _id: `temp-${Date.now()}`,
        content: newComment,
        author: {
          name: "Current User",
          avatar: "/default-avatar.png"
        },
        createdAt: new Date()
      };
      
      setComments(prev => [newCommentObj, ...prev]);
      setNewComment("");
      
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Comments</h2>
      
      {isAuthenticated ? (
        <div className="mb-6">
          <Textarea
            placeholder="Add a comment..."
            className="min-h-[100px] mb-3"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <Button 
            onClick={handleSubmitComment} 
            disabled={!newComment.trim() || submitting}
            className="flex items-center"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Comment
          </Button>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
          <p className="text-gray-600 dark:text-gray-400">Please sign in to comment</p>
          <Button variant="outline" className="mt-2">
            Sign In
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          // Skeleton loading state
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatar || "/default-avatar.png"} />
                  <AvatarFallback>{comment.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium text-sm">{comment.author.name}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {formatDistanceToNowSimple(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
