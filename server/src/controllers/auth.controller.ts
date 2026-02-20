import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Schema for user registration. Requires name, email, password, and
 * role. The role must be either 'DOCENTE' or 'ALUNO'.
 */
const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['DOCENTE', 'ALUNO']),
});

/**
 * Handle user registration. Creates a new user in the database and
 * returns a JWT token. Teachers and students are created with the
 * same endpoint to simplify the MVP.
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(400).json({ message: 'E-mail já cadastrado' });
      return;
    }
    const hashed = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        role: data.role,
      },
    });
    const token = generateToken({ id: user.id, role: user.role });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Erro no servidor' });
    }
  }
}

/**
 * Schema for user login. Requires email and password.
 */
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

/**
 * Handle user login. Validates credentials and returns a JWT token on
 * success. Passwords are compared using bcrypt.
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      res.status(400).json({ message: 'Credenciais inválidas' });
      return;
    }
    const passwordMatches = await comparePassword(data.password, user.password);
    if (!passwordMatches) {
      res.status(400).json({ message: 'Credenciais inválidas' });
      return;
    }
    const token = generateToken({ id: user.id, role: user.role });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Erro no servidor' });
    }
  }
}