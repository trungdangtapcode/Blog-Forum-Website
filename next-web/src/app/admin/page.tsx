"use client";

import { useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, CheckCircle, XCircle, Trash2, Mail } from "lucide-react";
import { auth0Client } from "@/lib/auth0-client";
import Link from 'next/link';

interface PostData {
  _id: string;
  title: string;
  author: string | { 
    _id: string; 
    fullName: string;
    email: string;
  };
  createdAt: string;
  isVerified: boolean;
  category: string;
}

interface UserData {
  _id: string;
  email: string;
  fullName: string;
  isVerified: boolean;
  isAdmin: boolean;
}

export default function AdminPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);  const [isAdmin, setIsAdmin] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const router = useRouter();
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const session = await auth0Client.getSession();
        if (!session) {
          router.push('/api/auth/login');
          return;
        }

        // Get user profile from our API
        const profileResponse = await fetch('/api/account/profile', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420'
          }
        });
        const profile = await profileResponse.json();
          if (!profile || !profile.isAdmin) {
          toast.error("Access Denied: You need admin privileges to access this page.");
          router.push('/');
          return;
        }

        setIsAdmin(true);
        await fetchPosts();
        await fetchUsers();      
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error("Failed to verify admin status.");
        router.push('/');
      } finally {
        setLoading(false);
      }
    };    checkAdminStatus();
  }, [router]);
  const fetchPosts = async () => {
    try {
      // We can use the existing posts API endpoint
      const response = await fetch('/api/posts/all', { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPosts(data);    
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error("Failed to fetch posts.");
    }
  };
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/account/getAllProfiles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUsers(data);    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Failed to fetch user accounts.");
    }
  };
  const handleVerifyPost = async (postId: string, verify: boolean) => {
    try {
      // Create a new API endpoint in the frontend for verifying posts
      const endpoint = verify ? 'verify' : 'unverify';
      const response = await fetch(`/api/posts/${endpoint}/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${verify ? 'verify' : 'unverify'} post: ${response.statusText}`);
      }
        // Update local posts state
      setPosts(posts.map(post => 
        post._id === postId ? { ...post, isVerified: verify } : post
      ));
      
      toast.success(`Post ${verify ? 'verified' : 'unverified'} successfully.`);    } catch (error) {
      console.error(`Error ${verify ? 'verifying' : 'unverifying'} post:`, error);
      toast.error(`Failed to ${verify ? 'verify' : 'unverify'} post.`);
    }
  };
  const handleDeletePost = async (postId: string) => {
    try {
      // Create a new API endpoint in the frontend for deleting posts
      const response = await fetch(`/api/posts/delete/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.statusText}`);
      }
        // Update local posts state
      setPosts(posts.filter(post => post._id !== postId));
      
      toast.success("Post deleted successfully.");    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error("Failed to delete post.");
    }
  };
  const handleVerifyUser = async (userId: string, verify: boolean) => {
    try {
      const response = await fetch('/api/account/verifyUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId: userId,
          isVerified: verify 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${verify ? 'verify' : 'unverify'} user: ${response.statusText}`);
      }
        // Update local users state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isVerified: verify } : user
      ));
      
      toast.success(`User ${verify ? 'verified' : 'unverified'} successfully.`);    } catch (error) {
      console.error(`Error ${verify ? 'verifying' : 'unverifying'} user:`, error);
      toast.error(`Failed to ${verify ? 'verify' : 'unverify'} user.`);
    }
  };
  const handleSendEmail = async () => {
    if (!selectedUser) return;
    
    try {
      // Create a new API endpoint in the frontend for sending emails
      const response = await fetch('/api/mailer/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: selectedUser.email,
          subject: emailSubject,
          content: emailContent
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }
        toast.success(`Email sent to ${selectedUser.email} successfully.`);
      
      // Reset form
      setEmailSubject('');
      setEmailContent('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error sending email:', error);      toast.error("Failed to send email.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading admin panel...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // The useEffect will redirect non-admins
  }
  return (
    <div className="container mx-auto py-10 px-4">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-8">
          <TabsTrigger value="posts">Posts Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Posts Management</CardTitle>
              <CardDescription>
                View, verify, or remove posts from the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of all posts on the platform.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No posts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    posts.map((post) => (
                      <TableRow key={post._id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>
                          {typeof post.author === 'string' 
                            ? post.author 
                            : post.author?.fullName || 'Unknown author'}
                        </TableCell>
                        <TableCell>{post.category}</TableCell>
                        <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {post.isVerified ? (
                            <Badge variant="default" className="bg-green-500">Verified</Badge>
                          ) : (
                            <Badge variant="outline">Unverified</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {post.isVerified ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVerifyPost(post._id, false)}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Unverify
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVerifyPost(post._id, true)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Verify
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the post.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePost(post._id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View users, verify accounts, and send emails.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of all users on the platform.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">
                          <Link href={`profile/${user._id}`}>
                            {user.fullName || 'No name'}
                          </Link>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.isVerified ? (
                            <Badge variant="default" className="bg-green-500">Verified</Badge>
                          ) : (
                            <Badge variant="outline">Unverified</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <Badge variant="secondary">Admin</Badge>
                          ) : (
                            <Badge variant="outline">User</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {user.isVerified ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVerifyUser(user._id, false)}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Unverify
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVerifyUser(user._id, true)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Verify
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Mail className="h-4 w-4 mr-1" /> Email
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Send Email to User</DialogTitle>
                                <DialogDescription>
                                  Send an email to {user.email}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="subject" className="text-right">
                                    Subject
                                  </Label>
                                  <Input
                                    id="subject"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="content" className="text-right">
                                    Content
                                  </Label>
                                  <Textarea
                                    id="content"
                                    value={emailContent}
                                    onChange={(e) => setEmailContent(e.target.value)}
                                    className="col-span-3"
                                    rows={5}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit" onClick={handleSendEmail}>Send Email</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
