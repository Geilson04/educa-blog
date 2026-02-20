import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET || 'changeme';

/**
 * Generate a JSON Web Token for a given payload. The token
 * expires after 7 days to enforce periodic logins.
 *
 * @param payload Data to encode in the token. Typically includes the
 * user ID and role.
 */
export function generateToken(payload: unknown): string {
  return jwt.sign(payload as object, secret, { expiresIn: '7d' });
}

/**
 * Verify a JSON Web Token and return the decoded payload. Throws
 * if the token is invalid or expired.
 *
 * @param token The token to verify
 */
export function verifyToken<T>(token: string): T {
  return jwt.verify(token, secret) as T;
}