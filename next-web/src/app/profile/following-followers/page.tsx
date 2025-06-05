"use client";

import { useEffect, useState } from "react";
import { getFollowing, getFollowers } from "@/utils/followFetching";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  UserPlus, 
  UserMinus,
  Loader2,
  Search
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const FollowingFollowersPage = () => {
  const [following, setFollowing] = useState<AccountProfile[]>([]);
  const [followers, setFollowers] = useState<AccountProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("following");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [followingData, followersData] = await Promise.all([
          getFollowing(),
          getFollowers(),
        ]);
        setFollowing(Array.isArray(followingData) ? followingData : []);
        setFollowers(Array.isArray(followersData) ? followersData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredFollowing = following.filter((user) =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFollowers = followers.filter((user) =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-5xl">
      <Link href="/posts" className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts
      </Link>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-4xl font-bold text-primary-800 dark:text-primary-100">
            Network
          </h1>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input 
              placeholder="Search connections..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="following" className="text-base">
              Following
              {following.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  {following.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="followers" className="text-base">
              Followers
              {followers.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  {followers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="following" className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-14 w-14 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-1/3" />
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredFollowing.length === 0 ? (              <div className="text-center py-12 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                {searchTerm ? (
                  <p className="text-gray-500 dark:text-gray-400">No matches found for &quot;{searchTerm}&quot;</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">You aren&apos;t following anyone yet</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredFollowing.map((user) => (
                  <UserCard key={user._id} user={user} relationshipType="following" />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="followers" className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-14 w-14 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-1/3" />
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredFollowers.length === 0 ? (              <div className="text-center py-12 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                {searchTerm ? (
                  <p className="text-gray-500 dark:text-gray-400">No matches found for &quot;{searchTerm}&quot;</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">You don&apos;t have any followers yet</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredFollowers.map((user) => (
                  <UserCard key={user._id} user={user} relationshipType="follower" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Separate component for user cards
const UserCard = ({ user, relationshipType }: { user: AccountProfile; relationshipType: 'following' | 'follower' }) => {
  const [isFollowing, setIsFollowing] = useState(relationshipType === 'following');
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    // This would normally call the API to follow/unfollow
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsFollowing(!isFollowing);
      setIsLoading(false);
    }, 500);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary-900/5">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-background">
            <AvatarImage src={user.avatar || "/default-avatar.png"} alt={`${user.fullName}'s avatar`} />
            <AvatarFallback className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
              {user.fullName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <Link 
                  href={`/profile/${user._id}`} 
                  className="text-lg font-semibold text-primary-800 dark:text-primary-100 hover:text-primary-600 dark:hover:text-primary-300 transition-colors line-clamp-1"
                >
                  {user.fullName || "Anonymous User"}
                </Link>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                  {user.email}
                </p>
              </div>
              
              <Button
                onClick={handleFollowToggle}
                disabled={isLoading}
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                className="sm:self-start whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-1" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
              {user.occupation && (
                <div className="flex items-center">
                  <Briefcase className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-500" />
                  <span className="line-clamp-1">{user.occupation}</span>
                </div>
              )}
              
              {user.location && (
                <div className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-500" />
                  <span className="line-clamp-1">{user.location}</span>
                </div>
              )}
            </div>
            
            {user.bio && (
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowingFollowersPage;
