// Default configuration values for the application

// This provides a fallback URL for the dispatch API if the environment variable is not set
export const DISPATCH_URL = process.env.NEXT_PUBLIC_DISPATCH_URL || 'http://localhost:3001'; 

// Export other configuration settings as needed
export const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
