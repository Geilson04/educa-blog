import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

/**
 * Express middleware that verifies the JSON Web Token provided in the
 * `Authorization` header. If the token is valid, it attaches the
 * decoded payload to `req.user` and calls `next()`. If invalid, a
 * 401 response is sent.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: 'Token não fornecido' });
    return;
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Formato de token inválido' });
    return;
  }

  try {
    const decoded = verifyToken<{ id: string; role: string }>(token);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}