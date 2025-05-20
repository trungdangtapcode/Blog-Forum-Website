import * as crypto from 'crypto';

/**
 * Generates a secure hash for a token to use as cache key.
 * This helps prevent storing raw tokens in memory while still allowing cache lookups.
 * 
 * @param token The token to hash
 * @returns A SHA-256 hash of the token
 */
export function generateTokenHash(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Creates a cache key for a token using a secure hash
 * 
 * @param token The raw token
 * @param prefix Optional prefix for the cache key
 * @returns A cache key with the format prefix:tokenHash
 */
export function createCacheKey(token: string, prefix = 'auth0'): string {
  const hash = generateTokenHash(token);
  return `${prefix}:${hash}`;
}
