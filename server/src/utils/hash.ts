import bcrypt from 'bcryptjs';

/**
 * Hash a plain text password. A salt is generated automatically.
 * @param password Plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password against a stored hash.
 * @param password The plain text password provided by the user
 * @param hash The hashed password stored in the database
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}