"use client";
//NO MORE USE THIS CODE, USE "./comments/" INSTEAD
import { CommentType, UserInfo } from "./types";
import { CommentItem } from "./CommentItem";
import { Skeleton } from "@/components/ui/skeleton";

interface CommentListProps {
  comments: CommentType[];
  loading: boolean;
  currentUser: UserInfo | null;
  isAuthenticated: boolean;
  userVotes: Record<string, string>;
  submittingVote: string | null;
  submitting: boolean;
  onVote: (commentId: string, action: 'upvote' | 'downvote') => Promise<void>;
  onReply: (commentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  loading,
  currentUser,
  isAuthenticated,
  userVotes,
  submittingVote,
  submitting,
  onVote,
  onReply,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      // Skeleton loading state
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <>
      {comments.map(comment => (
        <CommentItem
          key={comment._id}
          comment={comment}
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
          userVote={userVotes[comment._id]}
          isVoting={submittingVote === comment._id}
          onVote={onVote}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          submitting={submitting}
        />
      ))}
    </>
  );
};

export default CommentList;
