'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { checkPaymentStatus } from '@/utils/paymentApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle, XCircle, HomeIcon } from 'lucide-react';

enum PaymentStatus {
  LOADING = 'loading',
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
  ERROR = 'error',
}

export default function PaymentResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.LOADING);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [creditAmount, setCreditAmount] = useState<number>(0);
  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Get the orderId from query parameters
        const orderId = searchParams.get('orderId');
        const resultCode = searchParams.get('resultCode');
        
        if (!orderId) {
          setStatus(PaymentStatus.ERROR);
          setErrorMessage('Missing order ID');
          return;
        }
        
        // If MoMo already sent us resultCode in the redirect, we can use it for immediate feedback
        if (resultCode === '0') {
          // Still check with our backend to confirm
          try {
            const result = await checkPaymentStatus(orderId);
            if (result.status === 'success') {
              setStatus(PaymentStatus.SUCCESS);
              setCreditAmount(result.creditAmount);
            } else if (result.status === 'pending') {
              setStatus(PaymentStatus.PENDING);
              // Schedule a recheck after 2 seconds
              setTimeout(() => checkStatus(), 2000);
            } else {
              setStatus(PaymentStatus.FAILED);
            }
          } catch (error) {
            // If backend check fails but MoMo said success, show pending
            console.error('Error checking with backend:', error);
            setStatus(PaymentStatus.PENDING);
          }
        } else if (resultCode && resultCode !== '0') {
          // MoMo already told us it failed in the redirect
          setStatus(PaymentStatus.FAILED);
        } else {
          // No resultCode in redirect, check with our backend
          const result = await checkPaymentStatus(orderId);
          
          if (result.status === 'success') {
            setStatus(PaymentStatus.SUCCESS);
            setCreditAmount(result.creditAmount);
          } else if (result.status === 'pending') {
            setStatus(PaymentStatus.PENDING);
            // Schedule a recheck after 2 seconds
            setTimeout(() => checkStatus(), 2000);
          } else {
            setStatus(PaymentStatus.FAILED);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus(PaymentStatus.ERROR);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to check payment status');
      }
    };

    checkStatus();
  }, [searchParams]);

  const renderContent = () => {
    switch (status) {
      case PaymentStatus.LOADING:
        return (
          <div className="flex flex-col items-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-xl">Checking payment status...</p>
          </div>
        );
      
      case PaymentStatus.SUCCESS:
        return (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-xl font-bold mb-2">Payment Successful!</p>
            <p className="text-center mb-6">
              {creditAmount} credits have been added to your account.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => router.push('/buy-credits')}>
                Buy More Credits
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                <HomeIcon className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        );
      
      case PaymentStatus.PENDING:
        return (
          <div className="flex flex-col items-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
            <p className="text-xl font-bold mb-2">Payment Pending</p>
            <p className="text-center mb-6">
              Your payment is still being processed. You can check again in a few moments.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()}>
                Check Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/buy-credits')}>
                Return to Credits Page
              </Button>
            </div>
          </div>
        );
      
      case PaymentStatus.FAILED:
        return (
          <div className="flex flex-col items-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <p className="text-xl font-bold mb-2">Payment Failed</p>
            <p className="text-center mb-6">
              Your payment was not successful. Please try again.
            </p>
            <Button onClick={() => router.push('/buy-credits')}>
              Try Again
            </Button>
          </div>
        );
      
      case PaymentStatus.ERROR:
        return (
          <div className="flex flex-col items-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <p className="text-xl font-bold mb-2">Error</p>
            <p className="text-center mb-6">
              {errorMessage || 'An error occurred while processing your payment.'}
            </p>
            <Button onClick={() => router.push('/buy-credits')}>
              Return to Credits Page
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Payment Result</CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
