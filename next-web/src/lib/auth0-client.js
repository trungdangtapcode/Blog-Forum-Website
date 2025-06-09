// This file is specifically for client components that need access to Auth0 functionality

import axios from 'axios';

// Client-side Auth0 helper
export const auth0Client = {
  getToken: async () => {
    try {
      // Fetch token from a server endpoint that securely provides the token
      const response = await axios.get('/api/auth/token');
      if (response.status === 200 && response.data.token) {
        return response.data.token;
      }
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      
      // Handle token expiration by redirecting to login
      if (error.response && 
          (error.response.status === 401 || error.response.status === 403) &&
          error.response.data?.code === 'token_expired') {
        
        console.log('Token expired, redirecting to login...');
        // Use window.location instead of router for a hard refresh
        window.location.href = `/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
        return null;
      }
      
      return null;
    }
  },

  getSession: async () => {
    try {
      // Fetch user session data from a server endpoint
      const response = await axios.get('/api/auth/session');
      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting session:', error);
      
      // Handle session expiration
      if (error.response && 
          (error.response.status === 401 || error.response.status === 403)) {
        // Only redirect if we're not already on the login page or a public page
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        if (!currentPath.startsWith('/auth') && !currentPath.startsWith('/landing') && currentPath !== '/') {
          console.log('Session expired, redirecting to login...');
          window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
        }
      }
      
      return null;
    }
  }
};
