"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNowSimple } from "@/utils/distanceToNow";
import { auth0Client } from "@/lib/auth0-client";
import { 
  ThumbsUp, 
  ThumbsDown, 
  Loader2, 
  Reply, 
  MoreVertical, 
  Edit, 
  Trash2 
} from "lucide-react";
import { 
  Comment as CommentType, 
  AuthorInfo,
  getCommentsByPostId, 
  createComment, 
  voteComment,
  getUserCommentVote,
  deleteComment,
  updateComment
} from "@/utils/commentFetching";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

interface CommentSectionProps {
  postId: string;  initialComments?: string[]; // Comment IDs from the post
}

const FixedCommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [submittingVote, setSubmittingVote] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{id: string, name: string, avatar: string} | null>(null);
  
  // Organize comments into threads (top-level and replies)
  const organizeComments = (comments: CommentType[]): CommentType[] => {
    const commentMap = new Map<string, CommentType>();
    const topLevelComments: CommentType[] = [];

    // First pass: index all comments by ID
    comments.forEach(comment => {
      commentMap.set(comment._id, {...comment, replies: []});
    });

    // Second pass: organize into parent-child relationships
    comments.forEach(comment => {
      const processedComment = commentMap.get(comment._id)!;
      
      if (comment.parentComment) {
        // This is a reply, add to parent's replies
        const parent = commentMap.get(comment.parentComment);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(processedComment);
        } else {
          // Parent not found, treat as top-level
          topLevelComments.push(processedComment);
        }
      } else {
        // This is a top-level comment
        topLevelComments.push(processedComment);
      }
    });

    // Sort top-level comments by date (newest first)
    return topLevelComments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

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
        setComments(organizeComments(fetchedComments));
        
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
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;
    
    setSubmitting(true);
    try {
      const commentData = {
        content: newComment.trim(),
        post: postId
      };
      
      const createdComment = await createComment(commentData);
      
      // Ensure the comment has proper author information
      // The API response might not include complete author info, so we ensure it has it
      if (!createdComment.author || !createdComment.author.fullName) {
        createdComment.author = {
          _id: currentUser?.id || '',
          fullName: currentUser?.name || 'Anonymous User',
          avatar: currentUser?.avatar || '/default-avatar.png'
        };
      }
      
      // Add to comment list and reset form
      setComments(prevComments => organizeComments([createdComment, ...prevComments]));
      setNewComment("");
      toast.success("Comment posted successfully");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit a reply to a comment
  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !replyingTo || !isAuthenticated) return;
    
    setSubmitting(true);
    try {
      const replyData = {
        content: replyContent.trim(),
        post: postId,
        parentComment: replyingTo
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
            if (comment._id === replyingTo) {
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
      
      // Reset reply state
      setReplyingTo(null);
      setReplyContent("");
      toast.success("Reply posted successfully");
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  // Update a comment
  const handleUpdateComment = async () => {
    if (!editContent.trim() || !editingComment || !isAuthenticated) return;
    
    setSubmitting(true);
    try {
      await updateComment(editingComment, editContent.trim());
      
      // Update comment in state
      setComments(prevComments => {
        const updateCommentContent = (comments: CommentType[]): CommentType[] => {
          return comments.map(comment => {
            if (comment._id === editingComment) {
              return {
                ...comment,
                content: editContent.trim(),
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
      
      // Reset edit state
      setEditingComment(null);
      setEditContent("");
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

  // Start editing a comment
  const startEditing = (comment: CommentType) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent("");
  };

  // Start replying to a comment
  const startReplying = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent("");
  };

  // Cancel replying
  const cancelReplying = () => {
    setReplyingTo(null);
    setReplyContent("");
  };
  
  // Check if current user is the author of a comment
  const isCommentAuthor = (author: AuthorInfo) => {
    return currentUser && author && author._id === currentUser.id;
  };

  // Render a single comment and its replies
  const renderComment = (comment: CommentType, level = 0) => {
    const isEditing = editingComment === comment._id;
    const isReplying = replyingTo === comment._id;
    const userVote = userVotes[comment._id];
    const isVoting = submittingVote === comment._id;
    
    return (
      <div key={comment._id} className={`border-t border-gray-100 dark:border-gray-800 pt-4 ${level > 0 ? 'ml-8' : ''}`}>
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.author?.avatar || "/default-avatar.png"} />
            <AvatarFallback>{(comment.author?.fullName || 'User').substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{comment.author?.fullName || 'Anonymous User'}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNowSimple(new Date(comment.createdAt))}
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && 
                    " (edited)"
                  }
                </span>
              </div>
              
              {isAuthenticated && comment.author && isCommentAuthor(comment.author) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => startEditing(comment)} className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteComment(comment._id)} 
                      className="cursor-pointer text-red-500"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {isEditing ? (
              <div className="mt-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Edit your comment..."
                  className="min-h-[100px] mb-2"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpdateComment} 
                    disabled={!editContent.trim() || submitting}
                    size="sm"
                  >
                    {submitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Save
                  </Button>
                  <Button 
                    onClick={cancelEditing} 
                    variant="outline" 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 mt-1">{comment.content}</p>
            )}
            
            {!isEditing && (
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 px-1 ${userVote === 'upvote' ? 'text-blue-500' : ''}`}
                    onClick={() => handleVote(comment._id, 'upvote')}
                    disabled={!isAuthenticated || isVoting}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="ml-1">{comment.upvotes || 0}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 px-1 ${userVote === 'downvote' ? 'text-red-500' : ''}`}
                    onClick={() => handleVote(comment._id, 'downvote')}
                    disabled={!isAuthenticated || isVoting}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span className="ml-1">{comment.downvotes || 0}</span>
                  </Button>
                </div>
                
                {isAuthenticated && !isReplying && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1"
                    onClick={() => startReplying(comment._id)}
                  >
                    <Reply className="h-4 w-4" />
                    <span className="ml-1">Reply</span>
                  </Button>
                )}
              </div>
            )}
            
            {isReplying && (
              <div className="mt-4">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[80px] mb-2"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmitReply} 
                    disabled={!replyContent.trim() || submitting}
                    size="sm"
                  >
                    {submitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Reply
                  </Button>
                  <Button 
                    onClick={cancelReplying} 
                    variant="outline" 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {/* Render replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-4">
                {comment.replies.map(reply => renderComment(reply, level + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
          <Button variant="outline" className="mt-2" onClick={() => window.location.href = '/api/auth/login'}>
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
          comments.map(comment => renderComment(comment))
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        )}      </div>
    </div>
  );
};

export default FixedCommentSection;
