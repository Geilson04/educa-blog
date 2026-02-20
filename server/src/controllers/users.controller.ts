import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

/**
 * Return the authenticated user's profile. Useful for the frontend to
 * fetch current user info after login.
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (req as any).user as { id: string; role: string };
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(dbUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao obter perfil' });
  }
}

/**
 * List all students. Only teachers should call this endpoint to
 * assign activities. Students are filtered by role.
 */
export async function listStudents(req: Request, res: Response): Promise<void> {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'ALUNO' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar alunos' });
  }
}