import { DISPATCH_URL } from '@/lib/config';
import { auth0Client } from '@/lib/auth0-client';

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const token = await auth0Client.getToken();
    
    if (!token) {
      console.error('No auth token available. User may not be authenticated.');
      throw new Error('Authentication token is missing. Please log in again.');
    }
    
    console.log(`Making API request to: ${endpoint}`);
    const url = `${DISPATCH_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '69420'
      },
    };
    
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });    if (!response.ok) {
      // Try to get detailed error message from the response if available
      try {
        const errorData = await response.json();
        throw new Error(`API request failed: ${errorData.message || response.statusText}`);
      } catch (error){
        console.error(error)
        // If we can't parse the error response, use the status text
        throw new Error(`API request failed: ${response.statusText}`);
      }
    }
      // For HEAD or DELETE requests that might not return content
    if (response.status === 204) {
      return null as T;
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    throw error;
  }
}
