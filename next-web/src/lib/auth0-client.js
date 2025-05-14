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
      return null;
    }
  }
};
