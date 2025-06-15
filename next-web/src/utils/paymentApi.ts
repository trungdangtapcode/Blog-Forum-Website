// Purchase credits and get payment URL
export async function createCreditPurchase(creditAmount: number) {
  try {
    if (creditAmount < 1 || creditAmount > 10) {
      throw new Error('Credit amount must be between 1 and 10');
    }

    const response = await fetch('/api/payment/create-purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creditAmount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create purchase');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating credit purchase:', error);
    throw error;
  }
}

// Check payment status by orderId
export async function checkPaymentStatus(orderId: string) {
  try {
    const response = await fetch(`/api/payment/check-status/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check payment status');
    }
    const data = await response.json();
    console.log('data ssr from /api/payment/check-status/',data)
    return data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
}

// Get user's transaction history
export async function getTransactionHistory() {
  try {
    const response = await fetch('/api/payment/transactions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get transaction history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw error;
  }
}
