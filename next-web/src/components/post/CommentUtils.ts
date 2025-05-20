"use client";

import { CommentType } from "./types";

/**
 * Organizes comments into threads (top-level and replies)
 */
export const organizeComments = (comments: CommentType[]): CommentType[] => {
  // When the backend already provides a properly nested structure with populated replies,
  // we just need to filter out the top-level comments and ensure proper sorting
  
  if (!Array.isArray(comments)) {
    console.error("Expected comments to be an array, received:", comments);
    return [];
  }
  
  // Filter for top-level comments only (those without a parentComment)
  const topLevelComments = comments.filter(comment => !comment.parentComment);
  
  // In case we receive a flat structure where parentComment references exist but replies aren't populated,
  // fall back to the manual organization
  if (topLevelComments.length === 0 && comments.length > 0) {
    console.log("No top-level comments found, falling back to manual organization");
    
    const commentMap = new Map<string, CommentType>();
    const manualTopLevelComments: CommentType[] = [];

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
          manualTopLevelComments.push(processedComment);
        }
      } else {
        // This is a top-level comment
        manualTopLevelComments.push(processedComment);
      }
    });
    
    return manualTopLevelComments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  // Sort top-level comments by date (newest first)
  return topLevelComments.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
