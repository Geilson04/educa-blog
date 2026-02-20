import { Request, Response, NextFunction } from 'express';

/**
 * Factory to create a role-checking middleware. It compares the
 * authenticated user's role against an array of allowed roles. If
 * permitted, it calls `next()`, otherwise it returns a 403 error.
 *
 * @param allowedRoles Array of accepted roles (e.g. ['DOCENTE'])
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user as { id: string; role: string } | undefined;
    if (!user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ message: 'Acesso negado' });
      return;
    }
    next();
  };
}