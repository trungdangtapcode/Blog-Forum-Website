// Safe date formatting utility
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

/**
 * Safely formats a date string or Date object to a relative time string (e.g., "2 days ago").
 * If the input date is invalid, returns a fallback value.
 * 
 * @param dateInput The date to format (string, Date, or null/undefined)
 * @param fallback The fallback string to return if the date is invalid
 * @returns A formatted string representing the relative time
 */
export function formatRelativeDate(dateInput: string | Date | null | undefined, fallback: string = "Unknown date"): string {
  if (!dateInput) {
    return fallback;
  }
  
  try {
    const date = new Date(dateInput);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return fallback;
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error);
    return fallback;
  }
}

/**
 * Simplified version that formats a date to a relative time string (e.g., "2 days ago").
 * This is a safer replacement for formatDistanceToNowSimple.
 * 
 * @param dateInput The date to format
 * @param fallback The fallback string to return if the date is invalid
 * @returns A formatted string representing the relative time without "ago"
 */
export function formatRelativeDateSimple(dateInput: string | Date | null | undefined, fallback: string = "Unknown"): string {
  if (!dateInput) {
    return fallback;
  }
  
  try {
    const date = new Date(dateInput);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return fallback;
    }
    
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count > 0) {
        return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  } catch (error) {
    console.error("Error formatting date:", error);
    return fallback;
  }
}
