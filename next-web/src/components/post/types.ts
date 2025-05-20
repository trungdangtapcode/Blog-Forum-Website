"use client";

export interface CommentAuthor {
  _id: string;
  fullName: string;
  avatar: string;
}

export interface CommentType {
  _id: string;
  content: string;
  author?: CommentAuthor;
  createdAt: string | Date;
  updatedAt?: string | Date;
  upvotes?: number;
  downvotes?: number;
  parentComment?: string;
  replies?: CommentType[];
}

export interface AuthorInfo {
  _id: string;
  fullName: string;
  avatar: string;
}

export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
}
