import { DISPATCH_URL } from '@/app/config';
import { auth0Client } from '@/lib/auth0-client';

// Get user's credit
export async function getUserCredit() {
  try {
    const token = await auth0Client.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${DISPATCH_URL}/account/credit`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get credit: ${response.statusText}`);
    }

    const data = await response.json();
    return data.credit;
  } catch (error) {
    console.error('Error fetching user credit:', error);
    throw error;
  }
}

// Transfer credit to another user
export async function transferCredit(recipientId: string, amount: number) {
  try {
    const token = await auth0Client.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }


    const response = await fetch(`${DISPATCH_URL}/account/credit/transfer/${recipientId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to transfer credit: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error transferring credit:', error);
    throw error;
  }
}

// Update credit distribution interval (admin only)
export async function updateCreditDistributionInterval(interval: string) {
  try {
    const token = await auth0Client.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${DISPATCH_URL}/account/credit/distribution-interval`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interval }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update interval: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating credit distribution interval:', error);
    throw error;
  }
}

// Update user's credit amount (admin only)
export async function updateUserCredit(userId: string, amount: number) {
  try {
    const response = await fetch(`/api/account/credit/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `Failed to update user credit: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user credit:', error);
    throw error;
  }
}
