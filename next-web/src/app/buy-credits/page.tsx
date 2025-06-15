'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createCreditPurchase, checkPaymentStatus, getTransactionHistory } from '@/utils/paymentApi';
import { getCurrentUserProfile } from '@/utils/accountApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, CreditCard, Check, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

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
  const [userProfile, setUserProfile] = useState<AccountProfile|null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [autoCheckActive, setAutoCheckActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [checkProgress, setCheckProgress] = useState<number>(0);
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
    // Define handleCheckStatus with useCallback to avoid dependency issues
  const handleCheckStatus = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setCheckingStatus(true);
      // Removed retry count increment from here to break the circular dependency
      
      const result = await checkPaymentStatus(orderId);
      console.log('Payment status:', paymentStatus, result.status )
      const statusText = result.momoResponse.message=="Successful."?"success":"pending"
      setPaymentStatus(statusText);
      
      if (statusText === 'success') {
        toast.success(`${result.creditAmount} credits have been added to your account.`);
        
        // Stop auto-checking
        if (statusCheckInterval.current) {
          clearInterval(statusCheckInterval.current);
          setAutoCheckActive(false);
        }
      } else if (statusText === 'pending') {
        // Continue checking
        // Check retry count but don't reference it in dependencies
        const currentRetryCount = retryCount;
        if (currentRetryCount > 30) { // After ~2.5 minutes (30 * 5 seconds)
          setErrorMessage("Payment is taking longer than expected. You can close this dialog and check your transaction history later.");
        }
      } else if (statusText === 'failed') {
        toast.error('The payment was not successful.');
        
        // Stop auto-checking
        if (statusCheckInterval.current) {
          clearInterval(statusCheckInterval.current);
          setAutoCheckActive(false);
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      // Don't show error toast during auto-checking to avoid spamming the user
      if (!autoCheckActive) {
        toast.error(error instanceof Error ? error.message : 'Failed to check payment status');
      }
      
      // Show error in dialog if persistent
      // Check retry count without referencing it in dependencies
      const currentRetryCount = retryCount;
      if (currentRetryCount > 3) {
        setErrorMessage("Error checking payment status. Please try again later.");
      }
    } finally {
      setCheckingStatus(false);
    }
  }, [orderId]); // Removed retryCount and autoCheckActive from dependencies
  
  // Load user profile to display current credit balance
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoadingProfile(true);
        const profile = await getCurrentUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    }
    
    loadProfile();
  }, []);
  
  // Load transaction history
  useEffect(() => {
    loadTransactions();
    
    // Cleanup function
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);
  // Start auto-checking when payment dialog is opened
  useEffect(() => {
    if (paymentDialogOpen && orderId && autoCheckActive) {
      // Reset state at the beginning of auto-check
      setCheckProgress(0);
      setRetryCount(0);
      
      // Start progress bar animation
      progressInterval.current = setInterval(() => {
        setCheckProgress(prev => {
          if (prev >= 100) {
            return 0;
          }
          return prev + 4; // Increment to reach 100% in ~5 seconds
        });
      }, 200);
      
      // Check immediately first
      handleCheckStatus();
      
      // Then set up interval for subsequent checks
      statusCheckInterval.current = setInterval(() => {
        // Increment retry count only during scheduled checks
        setRetryCount(prev => prev + 1);
        handleCheckStatus();
        // Reset progress animation
        setCheckProgress(0);
      }, 5000); // Check every 5 seconds

      return () => {
        if (statusCheckInterval.current) {
          clearInterval(statusCheckInterval.current);
        }
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
    }
  }, [paymentDialogOpen, orderId, autoCheckActive, handleCheckStatus]);

  // Handle payment success or failure
  useEffect(() => {
    if (paymentStatus === 'success') {
      // Stop checking when payment is successful
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      // Refresh profile after successful payment
      setTimeout(async () => {
        try {
          const profile = await getCurrentUserProfile();
          setUserProfile(profile);
        } catch (error) {
          console.error('Failed to refresh profile after payment:', error);
        }
      }, 1000);
      
      // Auto-close dialog and refresh transactions after 3 seconds
      setTimeout(() => {
        setPaymentDialogOpen(false);
        loadTransactions();
      }, 3000);
    } else if (paymentStatus === 'failed') {
      // Stop checking when payment fails
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
  }, [paymentStatus]);

  const handleCreditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 10) {
      setCreditAmount(value);
    }
  };
  const handlePurchase = async () => {
    try {
      setLoading(true);
      setPaymentStatus(null);
      setErrorMessage(null);
      setRetryCount(0); // Reset retry count for new purchase
      
      const result = await createCreditPurchase(creditAmount);
      console.log(result)
      setPaymentUrl(result.paymentUrl);
      setOrderId(result.orderId);
      
      // Open payment dialog
      setPaymentDialogOpen(true);
      // Start auto-checking
      setAutoCheckActive(true);
      toast.success('Please complete your payment to receive credits.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create purchase');
      toast.error(error instanceof Error ? error.message : 'Failed to create purchase');
    } finally {
      setLoading(false);
    }
  };
  // handleCheckStatus is already defined with useCallback above

  const loadTransactions = async () => {    try {
      setLoadingTransactions(true);
      const transactions = await getTransactionHistory();
      setTransactions(transactions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load transactions');
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
  const renderPaymentStatusContent = () => {
    switch (paymentStatus) {
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <Check className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-4 text-center">
              {creditAmount} credits have been added to your account.
            </p>
            <Button 
              onClick={() => {
                // Handle cleanup and state update in a safe way
                if (statusCheckInterval.current) {
                  clearInterval(statusCheckInterval.current);
                }
                if (progressInterval.current) {
                  clearInterval(progressInterval.current);
                }
                setAutoCheckActive(false);
                setPaymentDialogOpen(false);
              }}
            >
              Close
            </Button>
          </div>
        );
      case 'failed':
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <X className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-4 text-center">
              Your payment was not successful. Please try again.
            </p>
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Safe cleanup before state changes
                  if (statusCheckInterval.current) {
                    clearInterval(statusCheckInterval.current);
                  }
                  if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                  }
                  setAutoCheckActive(false);
                  setPaymentDialogOpen(false);
                }}
              >
                Close
              </Button>
              <Button onClick={handlePurchase}>
                Try Again
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Buy Credits Card */}
        <Card className="w-full lg:w-1/3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-6 w-6" />
              Buy Credits
            </CardTitle>
            <CardDescription>
              Add credits to your account to unlock premium features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label htmlFor="creditAmount" className="block mb-2">
                Amount of Credits (1-10)
              </Label>
              <div className="flex items-center mb-1">
                <Input
                  id="creditAmount"
                  type="number"
                  min={1}
                  max={10}
                  value={creditAmount}
                  onChange={handleCreditAmountChange}
                  className="w-full"
                  disabled={loading}
                />
              </div>
              <p className="text-sm text-gray-500">
                Price: {creditAmount * 1000} VND ({creditAmount} credits × 1,000 VND)
              </p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Your current balance:</p>
              {loadingProfile ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </div>
              ) : (
                <p className="text-xl font-bold">
                  {userProfile?.credit || 0} credits
                </p>
              )}
            </div>
            
            <Button 
              onClick={handlePurchase} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Purchase Credits</>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Transaction History */}
        <Card className="w-full lg:w-2/3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Transaction History</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadTransactions}
                disabled={loadingTransactions}
              >
                {loadingTransactions ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription>
              Recent credit purchases and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTransactions ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Date</th>
                      <th className="text-center py-3 px-2">Amount</th>
                      <th className="text-center py-3 px-2">Credits</th>
                      <th className="text-right py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction._id} className="border-b">
                        <td className="py-3 px-2">{formatDate(transaction.createdAt)}</td>
                        <td className="py-3 px-2 text-center">{transaction.amount.toLocaleString()} VND</td>
                        <td className="py-3 px-2 text-center">{transaction.creditAmount}</td>
                        <td className="py-3 px-2 text-right">{getStatusBadge(transaction.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>      {/* Payment Dialog */}      
      <Dialog 
        open={paymentDialogOpen} 
        onOpenChange={(open) => {

          console.log("Dialog open state changed:", open, "Payment status:", paymentStatus, "Error message:", errorMessage);
          // If attempting to close while payment is pending and no error, prevent dialog from closing
          if (open === false && paymentStatus === 'pending' && !errorMessage) {
            return; // Do nothing, preventing the dialog from closing
          }
          
          // For all other cases, update the dialog state
          if (open === false) {
            // Clean up resources when closing
            if (statusCheckInterval.current) {
              clearInterval(statusCheckInterval.current);
              statusCheckInterval.current = null;
            }
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
              progressInterval.current = null;
            }
            setAutoCheckActive(false);
            
            // Reset retry count when dialog is closed to prevent issues on next open
            if (retryCount > 0) {
              setRetryCount(0);
            }
          }
          
          // Update dialog state
          setPaymentDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
            <DialogDescription>
              Please complete the payment using MoMo.
            </DialogDescription>
          </DialogHeader>
          
          {paymentStatus === 'pending' && !renderPaymentStatusContent() && (
            <>
              {paymentUrl && (
                <div className="py-4">
                  <iframe 
                    src={paymentUrl} 
                    className="w-full h-[400px] border rounded-md"
                    title="MoMo Payment"
                  />
                </div>
              )}
              
              {errorMessage && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <p className="text-sm text-yellow-700">{errorMessage}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                  <span>Checking payment status...</span>
                  <span>{checkProgress.toFixed(0)}%</span>
                </div>
                <Progress value={checkProgress} className="h-1" />
                <div className="flex justify-between items-center mt-4">                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      // Increment retry count only for manual check
                      setRetryCount(prev => prev + 1);
                      handleCheckStatus();
                    }}
                    disabled={checkingStatus}
                  >
                    {checkingStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Check Status
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Stop auto-checking
                      if (statusCheckInterval.current) {
                        clearInterval(statusCheckInterval.current);
                      }
                      if (progressInterval.current) {
                        clearInterval(progressInterval.current);
                      }
                      setAutoCheckActive(false);
                      setPaymentDialogOpen(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
          
          {renderPaymentStatusContent()}
        </DialogContent>      </Dialog>
      <Toaster />
    </div>
  );
}