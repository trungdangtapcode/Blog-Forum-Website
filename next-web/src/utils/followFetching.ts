import { auth0Client } from "@/lib/auth0-client";
import axios from "axios";

export const getFollowing = async () => {
  try {
      const token = await auth0Client.getToken();
      const response = await axios.get(`${process.env.NEXT_PUBLIC_DISPATCH_URL}/account/following`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
	    });
    return response.data;
  } catch (error) {
    console.error("Error fetching following:", error);
    throw error;
  }
};

export const getFollowers = async () => {
  try {
    const token = await auth0Client.getToken();
    const response = await axios.get(`${process.env.NEXT_PUBLIC_DISPATCH_URL}/account/followers`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
	    });
    return response.data;
  } catch (error) {
    console.error("Error fetching followers:", error);
    throw error;
  }
};
