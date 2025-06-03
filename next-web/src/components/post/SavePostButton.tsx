'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { savePost, unsavePost, isPostSaved } from '@/utils/savePostFetching';
import { auth0Client } from '@/lib/auth0-client';

interface SavePostButtonProps {
  postId: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export default function SavePostButton({
  postId,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
  className = '',
}: SavePostButtonProps) {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthAndSaveStatus = async () => {
      try {
        const token = await auth0Client.getToken();
        setIsAuthenticated(!!token);
        
        if (token) {
          const saveStatus = await isPostSaved(postId);
          setIsSaved(saveStatus?.saved || false);
        }
      } catch (error) {
        console.error("Error checking authentication or save status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthAndSaveStatus();
  }, [postId]);  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save posts");
      return;
    }

    setIsLoading(true);
    try {
      if (isSaved) {
        await unsavePost(postId);
        setIsSaved(false);
        toast.success("Post has been removed from your saved items");
        
        // Dispatch event for parent components to listen to
        window.dispatchEvent(new CustomEvent('savePostChange', {
          detail: { postId, action: 'unsave' }
        }));
      } else {
        await savePost(postId);
        setIsSaved(true);
        toast.success("Post has been added to your saved items");
        
        // Dispatch event for parent components to listen to
        window.dispatchEvent(new CustomEvent('savePostChange', {
          detail: { postId, action: 'save' }
        }));
      }
    } catch (error) {
      console.error("Error toggling save status:", error);
      toast.error("Failed to update save status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleSave}
      disabled={isLoading || !isAuthenticated}
      className={`${className} ${isLoading ? 'opacity-50' : ''}`}
      aria-label={isSaved ? "Unsave post" : "Save post"}
    >
      {isSaved ? (
        <BookmarkCheck className="h-5 w-5" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
      {showLabel && (
        <span className="ml-2">{isSaved ? "Saved" : "Save"}</span>
      )}
    </Button>
  );
}
