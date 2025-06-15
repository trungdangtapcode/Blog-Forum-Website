'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface PaymentTransaction {
  _id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  amount: number;
  creditAmount: number;
  status: string;
  paymentUrl?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  creditError?: boolean;
  retryCount?: number;
}

export default function AdminPayments() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [retrying, setRetrying] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);

  useEffect(() => {
    // Check if the user is an admin
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/check');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAllTransactions();
    }
  }, [isAdmin]);

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payments/all-transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data);    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryFailedCredits = async () => {
    try {
      setRetrying(true);
      const response = await fetch('/api/admin/payments/retry-credits', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to retry credit additions');
      }      const data = await response.json();
      
      toast.success(`${data.message}. ${data.count} transaction(s) updated.`);
      
      // Refresh transactions after retry
      fetchAllTransactions();    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to retry credit additions');
    } finally {
      setRetrying(false);
    }
  };

  const getStatusBadge = (status: string, creditError?: boolean) => {
    if (status === 'success' && creditError) {
      return (
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-amber-500">Success (Credit Error)</span>
        </div>
      );
    } else if (status === 'success') {
      return (
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-green-500">Success</span>
        </div>
      );
    } else if (status === 'pending') {
      return (
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 text-amber-500 animate-spin mr-1" />
          <span className="text-amber-500">Pending</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <XCircle className="h-4 w-4 text-red-500 mr-1" />
          <span className="text-red-500">Failed</span>
        </div>
      );
    }
  };

  if (!isAdmin) {
    return (      <div className="flex flex-col items-center justify-center py-10">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-500">You don&apos;t have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Payment Management</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
            <CardDescription>Manage and monitor all payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-between">
              <Button
                variant="outline"
                onClick={fetchAllTransactions}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>

              <Button
                onClick={handleRetryFailedCredits}
                disabled={retrying}
              >
                {retrying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Retry Failed Credit Additions
              </Button>
            </div>

            {transactions.length > 0 ? (
              <Table>
                <TableCaption>A list of all payment transactions.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Amount (VND)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell className="font-mono">{transaction.orderId.substring(0, 8)}...</TableCell>
                      <TableCell>{transaction.userEmail}</TableCell>
                      <TableCell>{transaction.creditAmount}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status, transaction.creditError)}</TableCell>
                      <TableCell>{new Date(transaction.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-gray-500">
                {loading ? 'Loading transactions...' : 'No transactions found.'}
              </div>
            )}
          </CardContent>
        </Card>      </div>
      <Toaster />
    </div>
  );
}
