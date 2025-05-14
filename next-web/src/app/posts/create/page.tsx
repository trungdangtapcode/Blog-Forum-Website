"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, CreatePostInput } from "@/utils/postFetching";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
} from "@/components/ui/toast"; // Your shadcn toast components
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Define post categories
const categories = [
  { id: "technology", name: "Technology" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "science", name: "Science" },
  { id: "health", name: "Health" },
  { id: "business", name: "Business" },
  { id: "general", name: "General" },
];

export default function CreatePostPage() {
  const [formData, setFormData] = useState<CreatePostInput>({
    title: "",
    content: "",
    category: "general",
    summary: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      title: string;
      description: string;
      variant: "default" | "destructive";
      open: boolean;
    }>
  >([]);
  const router = useRouter();

  const showToast = (
    title: string,
    description: string,
    variant: "default" | "destructive" = "default"
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [
      ...prev,
      { id, title, description, variant, open: true },
    ]);
    // Auto-close after 4 seconds
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, open: false } : t))
      );
    }, 4000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
    showToast(
      "Category Updated",
      `Selected category: ${categories.find((c) => c.id === value)?.name}`
    );
  };

  const handleCancel = () => {
    showToast("Action Canceled", "You have canceled the post creation.");
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast(
        "Missing Information",
        "Please fill in all required fields.",
        "destructive"
      );
      return;
    }

    setSubmitting(true);

    try {
      const result = await createPost(formData);

      showToast("Success", "Your post has been created successfully!");

      // Navigate to the new post
      router.push(`/posts/${result._id}`);
    } catch (error) {
      console.error("Error creating post:", error);

      showToast(
        "Error",
        "Failed to create post. Please try again.",
        "destructive"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ToastProvider>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/posts"
            className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts
          </Link>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Create a New Post</CardTitle>
              <CardDescription>
                Share your thoughts, ideas, or questions with the community.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="required">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter a descriptive title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary (Optional)</Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    placeholder="A brief summary of your post (will be shown in post previews)"
                    value={formData.summary || ""}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="required">
                    Content
                  </Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Write your post content here..."
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={12}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Simple formatting is supported. Use markdown-style syntax for
                    basic formatting.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="mr-2"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Publish Post"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="font-medium mb-2">Tips for a great post:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>Use a clear, descriptive title</li>
              <li>Add details to help readers understand your content</li>
              <li>Break up long text into paragraphs for readability</li>
              <li>Review your post before publishing</li>
              <li>Be respectful and follow community guidelines</li>
            </ul>
          </div>
        </div>

        {/* Render Toasts */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            open={toast.open}
            onOpenChange={(open) =>
              setToasts((prev) =>
                prev.map((t) => (t.id === toast.id ? { ...t, open } : t))
              )
            }
            variant={toast.variant}
          >
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              <ToastDescription>{toast.description}</ToastDescription>
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}