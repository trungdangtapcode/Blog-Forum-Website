'use client';

import { useState, useEffect } from 'react';
import { updateUserCredit } from '@/utils/creditApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast, { Toaster } from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

interface UserData {
  _id: string;
  email: string;
  fullName?: string;
  credit: number;
  isVerified: boolean;
  isAdmin: boolean;
}

export default function CreditManager({ users }: { users: UserData[] }) {
  const [usersWithCredit, setUsersWithCredit] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'credit' | 'role'>('credit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (users && users.length > 0) {
      const sortedUsers = [...users].sort((a, b) => {
        if (sortBy === 'name') {
          const nameA = (a.fullName || '').toLowerCase();
          const nameB = (b.fullName || '').toLowerCase();
          return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        } else if (sortBy === 'credit') {
          return sortOrder === 'asc' ? a.credit - b.credit : b.credit - a.credit;
        } else if (sortBy === 'role') {
          const roleComparison = Number(b.isAdmin) - Number(a.isAdmin);
          return sortOrder === 'asc' ? -roleComparison : roleComparison;
        }
        return 0;
      });
      setUsersWithCredit(sortedUsers);
    }
  }, [users, sortBy, sortOrder]);

  const handleUpdateCredit = async () => {
    if (!selectedUser || creditAmount < 0) {
      toast.error('Please select a user and enter a valid credit amount');
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateUserCredit(selectedUser, creditAmount);
      toast.success(result.message || 'Credit updated successfully');
      
      // Update the local state to reflect the changes
      setUsersWithCredit(prevUsers => 
        prevUsers.map(user => 
          user._id === selectedUser ? { ...user, credit: creditAmount } : user
        )
      );
      
      // Reset form
      setSelectedUser(null);
      setCreditAmount(0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update credit');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUserSelect = (userId: string, currentCredit: number) => {
    setSelectedUser(userId);
    setCreditAmount(currentCredit);
  };

  return (
    <Card className="w-full">      <CardHeader>
        <CardTitle>User Credit Management</CardTitle>
        <CardDescription>
          View and modify user credits
        </CardDescription>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <select 
              className="text-sm border rounded px-2 py-1"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'credit' | 'role')}
            >
              <option value="credit">Credit</option>
              <option value="name">Name</option>
              <option value="role">Role</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Order:</span>
            <Button 
              variant={sortOrder === 'asc' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSortOrder('asc')}
            >
              Ascending
            </Button>
            <Button 
              variant={sortOrder === 'desc' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSortOrder('desc')}
            >
              Descending
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Table>
          <TableCaption>A list of all users and their credit balances</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersWithCredit.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              usersWithCredit.map((user) => (
                <TableRow key={user._id} className={selectedUser === user._id ? "bg-muted/50" : ""}>
                  <TableCell className="font-medium">
                    {user.fullName || 'No name'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge variant="secondary">Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-100">
                      {user.credit} credits
                    </Badge>
                  </TableCell>                  <TableCell className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUserSelect(user._id, user.credit)}
                    >
                      Select
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        handleUserSelect(user._id, user.credit + 10);
                        setTimeout(() => handleUpdateCredit(), 100);
                      }}
                    >
                      +10
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (user.credit >= 5) {
                          handleUserSelect(user._id, user.credit - 5);
                          setTimeout(() => handleUpdateCredit(), 100);
                        } else {
                          toast.error("Credit cannot go below 0");
                        }
                      }}
                    >
                      -5
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="pt-6 border-t">
          <h3 className="text-lg font-medium mb-4">Update User Credit</h3>
          {selectedUser ? (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="credit-amount">Credit Amount</Label>
                <div className="flex space-x-2">
                  <Input
                    id="credit-amount"
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                    min={0}
                  />
                  <Button 
                    onClick={handleUpdateCredit} 
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update Credit'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Selected user: {usersWithCredit.find(u => u._id === selectedUser)?.email || selectedUser}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a user from the table above to modify their credit.</p>
          )}
        </div>
      </CardContent>
      <Toaster />
    </Card>
  );
}
