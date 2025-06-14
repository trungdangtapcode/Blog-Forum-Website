'use client';

import { useState, useEffect } from 'react';
import { createCreditPurchase, checkPaymentStatus, getTransactionHistory } from '@/utils/paymentApi';
import { getCurrentUserProfile } from '@/utils/accountApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CreditCard, Check, X, RefreshCw } from 'lucide-react';

interface Transaction {
  _id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  amount: number;
  creditAmount: number;
  status: 'pending' | 'success' | 'failed';
  paymentUrl?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BuyCredits() {
  const [creditAmount, setCreditAmount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  
  const { toast } = useToast();
  
  // Load user profile to display current credit balance  useEffect(() => {
    async function loadProfile() {
      try {
        setLoadingProfile(true);
        const profile = await getCurrentUserProfile();
        setUserProfile(profile);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load profile',
          variant: 'destructive',
        });
      } finally {
        setLoadingProfile(false);
      }
    }
    
    loadProfile();
  }, [toast]);

  const handleCreditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 10) {
      setCreditAmount(value);
    }
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const result = await createCreditPurchase(creditAmount);
      setPaymentUrl(result.paymentUrl);
      setOrderId(result.orderId);
      toast({
        title: 'Purchase created!',
        description: 'Please complete your payment to receive credits.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create purchase',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!orderId) return;
    
    try {
      setCheckingStatus(true);
      const result = await checkPaymentStatus(orderId);
      
      if (result.status === 'success') {
        toast({
          title: 'Payment successful!',
          description: `${result.creditAmount} credits have been added to your account.`,
        });
      } else if (result.status === 'pending') {
        toast({
          title: 'Payment pending',
          description: 'The payment is still being processed.',
        });
      } else {
        toast({
          title: 'Payment failed',
          description: 'The payment was not successful.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to check payment status',
        variant: 'destructive',
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const transactions = await getTransactionHistory();
      setTransactions(transactions);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load transactions',
        variant: 'destructive',
      });
    } finally {
      setLoadingTransactions(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" /> Completed</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Pending</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" /> Failed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Buy Credits</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">      <Card>
          <CardHeader>
            <CardTitle>Purchase Credits</CardTitle>
            <CardDescription>
              Each credit costs 1,000 VND. You can buy between 1 and 10 credits at a time.
              {userProfile && (
                <div className="mt-2 text-sm font-medium">
                  Current balance: <span className="font-bold">{userProfile.credit || 0}</span> credits
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="creditAmount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="creditAmount"
                  type="number"
                  min={1}
                  max={10}
                  value={creditAmount}
                  onChange={handleCreditAmountChange}
                  className="col-span-2"
                />
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div>
                  <p className="text-sm font-medium">Total Cost:</p>
                  <p className="text-2xl font-bold">{creditAmount * 1000} VND</p>
                </div>
                <Button onClick={handlePurchase} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Buy Now
                    </>
                  )}
                </Button>
              </div>
              
              {paymentUrl && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm mb-2">Complete your payment by clicking the button below:</p>
                  <div className="flex flex-col space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(paymentUrl, '_blank')}
                    >
                      Open Payment Page
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCheckStatus}
                      disabled={checkingStatus}
                    >
                      {checkingStatus ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Check Payment Status
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Your recent credit purchases and their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="mb-4" 
              onClick={loadTransactions}
              disabled={loadingTransactions}
            >
              {loadingTransactions ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Load Transactions
                </>
              )}
            </Button>
            
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                {loadingTransactions ? 'Loading transactions...' : 'No transactions found. Make a purchase to see it here.'}
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction._id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.creditAmount} Credits
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Amount: {transaction.amount} VND</span>
                      <span>Order ID: {transaction.orderId.substring(transaction.orderId.length - 6)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
