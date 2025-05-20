"use client";

import { useState, useEffect } from "react";
import { auth0Client } from "@/lib/auth0-client";
import toast from "react-hot-toast";
import { 
  getCommentsByPostId, 
  createComment, 
  voteComment,
  getUserCommentVote,
  deleteComment,
  updateComment
} from "@/utils/commentFetching";

// Import our split components
import { CommentForm } from "./comments/CommentForm";
import { CommentList } from "./comments/CommentList";
import { UserInfo, CommentType } from "./comments/types";
import { organizeComments } from "./comments/CommentUtils";

interface CommentSectionProps {
  postId: string;  
  initialComments?: string[]; // Comment IDs from the post
}

const FixedCommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [submittingVote, setSubmittingVote] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await auth0Client.getToken();
        setIsAuthenticated(!!token);
        
        if (token) {
          const session = await auth0Client.getSession();
          if (session && session.user) {
            setCurrentUser({
              id: session.user.sub || '',
              name: session.user.name || session.user.nickname || 'User',
              avatar: session.user.picture || '/default-avatar.png'
            });
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const fetchedComments = await getCommentsByPostId(postId);
        console.log("Raw fetched comments:", fetchedComments); // Debug log
        
        const organizedComments = organizeComments(fetchedComments);
        
        setComments(organizedComments);
        
        // If user is authenticated, fetch their votes for each comment
        if (isAuthenticated) {
          const votes: Record<string, string> = {};
          
          // Fetch votes for comments one at a time, but don't let errors stop the whole process
          for (const comment of fetchedComments) {
            try {
              const voteData = await getUserCommentVote(comment._id);
              if (voteData && voteData.action) {
                votes[comment._id] = voteData.action;
              }
            } catch {
              // Silently handle vote fetch errors - they shouldn't break comment loading
              console.log(`Couldn't get vote for comment ${comment._id}`);
            }
          }
          
          setUserVotes(votes);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast.error("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, isAuthenticated]);

  // Post a new comment
  const handleSubmitComment = async (content: string) => {
    if (!content.trim() || !isAuthenticated) return;
    
    setSubmitting(true);
    try {
      const commentData = {
        content: content.trim(),
        post: postId
      };
      
      const createdComment = await createComment(commentData);
      console.log("Created comment:", createdComment);
      
      // Ensure the comment has proper author information
      if (!createdComment.author || !createdComment.author.fullName) {
        createdComment.author = {
          _id: currentUser?.id || '',
          fullName: currentUser?.name || 'Anonymous User',
          avatar: currentUser?.avatar || '/default-avatar.png'
        };
      }
      
      // Add to comment list and reset form
      setComments(prevComments => organizeComments([createdComment, ...prevComments]));
      toast.success("Comment posted successfully");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit a reply to a comment
  const handleSubmitReply = async (commentId: string, content: string) => {
    if (!content.trim() || !commentId || !isAuthenticated) return;
    
    setSubmitting(true);
    try {
      const replyData = {
        content: content.trim(),
        post: postId,
        parentComment: commentId
      };
      
      const createdReply = await createComment(replyData);
      
      // Ensure the reply has proper author information
      if (!createdReply.author || !createdReply.author.fullName) {
        createdReply.author = {
          _id: currentUser?.id || '',
          fullName: currentUser?.name || 'Anonymous User',
          avatar: currentUser?.avatar || '/default-avatar.png'
        };
      }
      
      // Update comments state with the new reply
      setComments(prevComments => {
        const updatedComments = [...prevComments];
        
        // Find the parent comment
        const addReplyToComment = (comments: CommentType[]): CommentType[] => {
          return comments.map(comment => {
            if (comment._id === commentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), createdReply]
              };
            } else if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: addReplyToComment(comment.replies)
              };
            }
            return comment;
          });
        };
        
        return addReplyToComment(updatedComments);
      });
      
      toast.success("Reply posted successfully");
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  // Update a comment
  const handleUpdateComment = async (commentId: string, content: string) => {
    if (!content.trim() || !commentId || !isAuthenticated) return;
    
    setSubmitting(true);
    try {
      await updateComment(commentId, content.trim());
      
      // Update comment in state
      setComments(prevComments => {
        const updateCommentContent = (comments: CommentType[]): CommentType[] => {
          return comments.map(comment => {
            if (comment._id === commentId) {
              return {
                ...comment,
                content: content.trim(),
                updatedAt: new Date()
              };
            } else if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentContent(comment.replies)
              };
            }
            return comment;
          });
        };
        
        return updateCommentContent(prevComments);
      });
      
      toast.success("Comment updated successfully");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!isAuthenticated) return;
    
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    
    try {
      await deleteComment(commentId);
      
      // Remove comment from state
      setComments(prevComments => {
        // Helper function to filter out the deleted comment and its replies
        const filterDeletedComment = (comments: CommentType[]): CommentType[] => {
          return comments
            .filter(comment => comment._id !== commentId)
            .map(comment => {
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: filterDeletedComment(comment.replies)
                };
              }
              return comment;
            });
        };
        
        return filterDeletedComment(prevComments);
      });
      
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  // Handle voting (upvote/downvote)
  const handleVote = async (commentId: string, action: 'upvote' | 'downvote') => {
    if (!isAuthenticated || submittingVote === commentId) return;
    
    setSubmittingVote(commentId);
    try {
      const currentVote = userVotes[commentId];
      
      // If already voted the same way, this will cancel the vote
      const effectiveAction = currentVote === action ? 
        (action === 'upvote' ? 'downvote' : 'upvote') : // Toggle the vote
        action; // New vote
      
      const response = await voteComment(commentId, effectiveAction);
      
      // Update comment vote counts in state
      setComments(prevComments => {
        const updateCommentVotes = (comments: CommentType[]): CommentType[] => {
          return comments.map(comment => {
            if (comment._id === commentId) {
              return {
                ...comment,
                upvotes: response.upvotes,
                downvotes: response.downvotes
              };
            } else if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentVotes(comment.replies)
              };
            }
            return comment;
          });
        };
        
        return updateCommentVotes(prevComments);
      });
      
      // Update user votes
      setUserVotes(prev => {
        const updated = { ...prev };
        
        // If same action, remove vote. If different, set to new action.
        if (currentVote === action) {
          delete updated[commentId];
        } else {
          updated[commentId] = action;
        }
        
        return updated;
      });
    } catch (error) {
      console.error(`Error ${action}ing comment:`, error);
      toast.error(`Failed to ${action} comment`);
    } finally {
      setSubmittingVote(null);
    }
  };

  return (
    <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Comments</h2>
      
      <CommentForm 
        isAuthenticated={isAuthenticated}
        onSubmit={handleSubmitComment}
      />

      <div className="space-y-6">
        <CommentList
          comments={comments}
          loading={loading}
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
          userVotes={userVotes}
          submittingVote={submittingVote}
          submitting={submitting}
          onVote={handleVote}
          onReply={handleSubmitReply}
          onEdit={handleUpdateComment}
          onDelete={handleDeleteComment}
        />
      </div>
    </div>
  );
};

export default FixedCommentSection;
