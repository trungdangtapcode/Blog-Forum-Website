"use client";
//NO MORE USE THIS CODE, USE "./comments/" INSTEAD
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface CommentFormProps {
  isAuthenticated: boolean;
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  initialValue?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  isAuthenticated,
  onSubmit,
  placeholder = "Add a comment...",
  buttonText = "Post Comment",
  initialValue = "",
}) => {
  const [content, setContent] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !isAuthenticated) return;
    
    setSubmitting(true);
    try {
      await onSubmit(content);
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
        <p className="text-gray-600 dark:text-gray-400">Please sign in to comment</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.href = '/api/auth/login'}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Textarea
        placeholder={placeholder}
        className="min-h-[100px] mb-3"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={submitting}
      />
      <Button 
        onClick={handleSubmit} 
        disabled={!content.trim() || submitting}
        className="flex items-center"
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {buttonText}
      </Button>
    </div>
  );
};

export default CommentForm;
