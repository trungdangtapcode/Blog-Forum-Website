"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Post, getPostById, updatePost, isPostAuthor } from "@/utils/postFetching";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

interface EditPostClientProps {
  params: { id: string };
}

const EditPostClient = ({ params }: EditPostClientProps) => {
  console.log("EditPostClient rendered with params:", JSON.stringify(params));
  const router = useRouter();  // We'll keep the post state even if not actively used for potential future usage
  const [, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);  const [submitting, setSubmitting] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);  useEffect(() => {
    const fetchPostAndCheckAuthor = async () => {
      try {
        // Extract id from params, similar to pageClient.tsx approach
        const { id } = await params;
        console.log("Debug - extracted id:", id);
        console.log("Debug - params:", params);
        
        if (!id) {
          console.error("Invalid or missing ID:", id);
          toast.error("Invalid post ID");
          setLoading(false);
          return;
        }
        
        // First, try to fetch the post data to verify it exists
        const fetchedPost = await getPostById(id);
        
        if (!fetchedPost) {
          toast.error("Failed to load post data or post doesn't exist");
          setLoading(false);
          return;
        }
          // Then check if user is the author
        try {
          const isAuthor = await isPostAuthor(id);
          console.log("Debug - isAuthor result:", isAuthor);
          setAuthorized(isAuthor);
          
          if (!isAuthor) {
            toast.error("You are not authorized to edit this post");
            setTimeout(() => {
              router.push(`/posts/${id}`);
            }, 2000);
            return;
          }
            // Set post data now that we've confirmed the user is authorized
          setPost(fetchedPost);
          setTitle(fetchedPost.title);
          setContent(fetchedPost.content);
          setCategory(fetchedPost.category || "");
          setSummary(fetchedPost.summary || "");
        } catch (error) {
          console.error("Error checking author status:", error);
          toast.error("Could not verify author status");
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load post. Please try again later.");
      } finally {
        setLoading(false);
      }    };

    fetchPostAndCheckAuthor();
  }, [params, params.id, router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authorized) {
      toast.error("You are not authorized to edit this post");
      return;
    }

    if (!title.trim() || !content.trim() || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Show confirmation dialog instead of submitting immediately
    setShowConfirmation(true);
  };
  const handleConfirmedSubmit = async () => {
    setSubmitting(true);

    try {
      const { id } = await params;
      
      await updatePost(id, {
        title,
        content,
        category,
        summary,
      });
      
      toast.success("Post updated successfully");
      router.push(`/posts/${id}`);
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post. Please try again later.");
    } finally {
      setSubmitting(false);
      setShowConfirmation(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Skeleton className="h-8 w-40 mb-6" />
        <Skeleton className="h-12 w-full mb-6" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-12 w-1/3 mb-6" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  if (!authorized) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">Authorization Required</h1>
        <p className="mb-6">You are not authorized to edit this post. Redirecting...</p>
        <Link href={`/posts/${params.id}`} className="text-primary-600 hover:underline">
          Return to post
        </Link>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href={`/posts/${params.id}`} className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Post
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Title *
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="content" className="block text-sm font-medium">
              Content *
            </label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1"
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4" /> Edit
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" /> Preview
                </>
              )}
            </Button>
          </div>
          
          {showPreview ? (
            <div className="border rounded-md p-4 min-h-[300px] prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              required
              className="min-h-[300px]"
            />
          )}
          
          <p className="text-sm text-gray-500">
            You can use Markdown formatting in your content
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium">
            Category *
          </label>
          <Select
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="summary" className="block text-sm font-medium">
            Summary (Optional)
          </label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Enter a short summary of your post"
            className="min-h-[100px]"
          />
        </div>
        
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full sm:w-auto" 
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Post...
              </>
            ) : (
              'Update Post'
            )}
          </Button>
        </div>
      </form>
        <Toaster />
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Post Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to update this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmedSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Confirm Update'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditPostClient;
