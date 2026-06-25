const CHARSET_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CHARSET_LOWER = 'abcdefghijklmnopqrstuvwxyz0123456789';

export type KeyLength = 32 | 48 | 64;

/**
 * Generate a single random key string using crypto.getRandomValues.
 * Character set: A-Z + 0-9 (uppercase) or a-z + 0-9 (lowercase).
 */
export function generateRandomKey(length: KeyLength, uppercase: boolean): string {
  const charset = uppercase ? CHARSET_UPPER : CHARSET_LOWER;
  const chars = new Array<string>(length);
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  for (let i = 0; i < length; i++) {
    chars[i] = charset[randomBytes[i] % charset.length];
  }
  return chars.join('');
}

/**
 * Generate multiple random keys.
 */
export function generateRandomKeys(count: number, length: KeyLength, uppercase: boolean): string[] {
  return Array.from({ length: count }, () => generateRandomKey(length, uppercase));
}
