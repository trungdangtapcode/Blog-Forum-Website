/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Post } from "@/utils/postFetching";
import { FC, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart3, BookMarked, Calendar, Edit3, Heart, MessageSquare, Pencil, UserCircle, Users } from "lucide-react";
import Link from "next/link";

interface DashboardClientProps {
  profile: any;
  userPosts: Post[];
  stats: {
    totalPosts: number;
    totalLikes: number;
    averageLikes: number;
    totalComments: number;
    savedPostsCount: number;
    followersCount?: number;
    followingCount?: number;
  };
  categories?: Record<string, number>;
  timeline?: Record<string, number>;
  recentActivity?: Array<{
    id: string;
    title: string;
    likes: number;
    comments: number;
    createdAt: string;
  }>;
}

const DashboardClient: FC<DashboardClientProps> = ({ 
  profile, 
  userPosts, 
  stats, 
  categories = {}, 
  timeline = {}, 
  recentActivity = [] 
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
      : "U";
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="md:max-w-sm w-full">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <CardTitle className="text-2xl">{profile.fullName || "User"}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
              </div>
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback>{getInitials(profile.fullName || "User")}</AvatarFallback>
              </Avatar>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.bio && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm">{profile.bio}</p>
                </div>
              )}
              <div className="flex flex-col space-y-1.5">
                {profile.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <UserCircle className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.occupation && (
                  <div className="flex items-center gap-2 text-sm">
                    <Pencil className="h-4 w-4" />
                    <span>{profile.occupation}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-2 bg-muted rounded-md">
                  <p className="text-2xl font-semibold">{stats.totalPosts}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div className="text-center p-2 bg-muted rounded-md">
                  <p className="text-2xl font-semibold">{stats.totalLikes}</p>
                  <p className="text-sm text-muted-foreground">Likes</p>
                </div>
              </div>

              {/* Add follower stats */}
              {(stats.followersCount !== undefined || stats.followingCount !== undefined) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-muted rounded-md">
                    <p className="text-2xl font-semibold">{stats.followersCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-md">
                    <p className="text-2xl font-semibold">{stats.followingCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                </div>
              )}

              <Link href="/profilepage" passHref>
                <Button className="w-full" variant="outline">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="posts">Your Posts</TabsTrigger>
              <TabsTrigger value="saved">Saved Posts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Edit3 className="mr-2 h-4 w-4" />
                      Content Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalPosts}</div>
                    <p className="text-xs text-muted-foreground">Total posts published</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalLikes}</div>
                    <p className="text-xs text-muted-foreground">Total likes received</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Discussions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalComments}</div>
                    <p className="text-xs text-muted-foreground">Comments on your posts</p>
                  </CardContent>
                </Card>
              </div>              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Analytics Overview
                  </CardTitle>
                  <CardDescription>
                    A summary of your blog activity and engagement metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Average Likes Per Post</p>
                        <p className="text-2xl font-medium">{stats.averageLikes.toFixed(1)}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Saved Posts</p>
                        <p className="text-2xl font-medium">{stats.savedPostsCount}</p>
                      </div>
                    </div>

                    {Object.keys(categories).length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Content Categories</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(categories).map(([category, count]) => (
                              <div key={category} className="flex justify-between items-center text-sm">
                                <span className="capitalize">{category}</span>
                                <span className="text-muted-foreground">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <p className="text-muted-foreground">Engagement Rate</p>
                        <p className="font-medium">
                          {stats.totalPosts > 0 
                            ? `${((stats.totalLikes + stats.totalComments) / stats.totalPosts).toFixed(1)}` 
                            : "N/A"}
                        </p>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ 
                            width: `${stats.totalPosts > 0 
                              ? Math.min(((stats.totalLikes + stats.totalComments) / (stats.totalPosts * 10)) * 100, 100) 
                              : 0}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Based on likes and comments per post
                      </p>
                    </div>
                    
                    {Object.keys(timeline).length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Posting Timeline</p>
                          <div className="flex items-end h-24 gap-1">
                            {Object.entries(timeline)
                              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                              .slice(-6) // Show last 6 months
                              .map(([date, count], index) => {
                                // Calculate relative height (max height is 100%)
                                const maxCount = Math.max(...Object.values(timeline) as number[]);
                                const height = maxCount > 0 ? (count as number) / maxCount * 100 : 0;
                                
                                // Extract month and year for display
                                const [year, month] = date.split('-');
                                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                const monthName = monthNames[parseInt(month) - 1];
                                
                                return (
                                  <div key={date} className="flex flex-col items-center flex-1">
                                    <div 
                                      className="w-full bg-primary rounded-sm" 
                                      style={{ height: `${height}%`, minHeight: '4px' }}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
                                      {monthName}
                                    </p>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(recentActivity.length > 0 || userPosts.length > 0) ? (
                    <div className="space-y-4">
                      {(recentActivity.length > 0 ? recentActivity : userPosts.slice(0, 5)).map((post: any) => (
                        <div key={post.id || post._id} className="flex justify-between items-center">
                          <div>
                            <Link href={`/posts/${post.id || post._id}`} className="text-sm font-medium hover:underline">
                              {post.title}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {post.likes} likes • {post.comments || post.comments?.length || 0} comments
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(post.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">
                        You have not created any posts yet</p>
                      <Link href="/posts/create" passHref>
                        <Button className="mt-2" variant="outline">
                          Create Your First Post
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="posts" className="space-y-4">
              {userPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {userPosts.map((post) => (
                    <Card key={post._id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              <Link href={`/posts/${post._id}`} className="hover:underline">
                                {post.title}
                              </Link>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <span>{formatDate(post.createdAt)}</span>
                              <span>•</span>
                              <span className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" /> {post.likes}
                              </span>
                              <span>•</span>
                              <span className="flex items-center">
                                <MessageSquare className="h-3 w-3 mr-1" /> {post.comments?.length || 0}
                              </span>
                            </CardDescription>
                          </div>
                          <Link href={`/posts/edit/${post._id}`} passHref>
                            <Button size="sm" variant="outline">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {post.summary || post.content.substring(0, 150)}...
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Edit3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No posts yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You have not created any posts yet. Start sharing your thoughts!
                  </p>
                  <Link href="/posts/create" passHref>
                    <Button className="mt-4">
                      Create Your First Post
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="saved" className="space-y-4">
              {profile.savedPosts && profile.savedPosts.length > 0 ? (
                <div className="text-center py-12">
                  <BookMarked className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Saved Posts</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You have {profile.savedPosts.length} saved posts
                  </p>
                  <Link href="/posts?filter=saved" passHref>
                    <Button className="mt-4" variant="outline">
                      View Saved Posts
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookMarked className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No saved posts</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You have not saved any posts yet. Browse posts and save ones you like!
                  </p>
                  <Link href="/posts" passHref>
                    <Button className="mt-4" variant="outline">
                      Browse Posts
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
