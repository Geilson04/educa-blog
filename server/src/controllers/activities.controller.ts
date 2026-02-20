import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';

/**
 * Schema for creating an activity. All fields are required except
 * description. The teacher ID is retrieved from the authenticated
 * user so it's not part of the request body.
 */
const createActivitySchema = z.object({
  title: z.string().min(3, 'Título é obrigatório'),
  description: z.string().optional(),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
});

/**
 * Create a new activity. Only teachers can access this endpoint. It
 * inserts a record in the Activity table associated with the
 * authenticated teacher.
 */
export async function createActivity(req: Request, res: Response): Promise<void> {
  try {
    const data = createActivitySchema.parse(req.body);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user as { id: string; role: string };
    const activity = await prisma.activity.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        teacherId: user.id,
      },
    });
    res.status(201).json(activity);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Erro ao criar atividade' });
    }
  }
}

/**
 * List activities created by the authenticated teacher. Includes
 * assignments to see which students are associated.
 */
export async function listTeacherActivities(req: Request, res: Response): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (req as any).user as { id: string; role: string };
  try {
    const activities = await prisma.activity.findMany({
      where: { teacherId: user.id },
      include: { assignments: { include: { student: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar atividades' });
  }
}

/**
 * List activities assigned to the authenticated student. Returns
 * information about the assignment status and activity content.
 */
export async function listStudentActivities(req: Request, res: Response): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (req as any).user as { id: string; role: string };
  try {
    const assignments = await prisma.studentActivity.findMany({
      where: { studentId: user.id },
      include: { activity: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar atividades do aluno' });
  }
}

/**
 * Assign an existing activity to a list of students. Only teachers can
 * perform this action. Accepts an array of student IDs in the body.
 */
const assignSchema = z.object({
  studentIds: z.array(z.string().uuid()).nonempty('Lista de alunos vazia'),
});

export async function assignActivity(req: Request, res: Response): Promise<void> {
  try {
    const activityId = req.params.id;
    const { studentIds } = assignSchema.parse(req.body);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user as { id: string; role: string };
    // Verify the activity belongs to the teacher
    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity || activity.teacherId !== user.id) {
      res.status(404).json({ message: 'Atividade não encontrada' });
      return;
    }
    // Create assignments
    const assignments = studentIds.map((studentId) => ({
      studentId,
      activityId,
    }));
    await prisma.studentActivity.createMany({ data: assignments, skipDuplicates: true });
    res.status(201).json({ message: 'Atividade atribuída com sucesso' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Erro ao atribuir atividade' });
    }
  }
}

/**
 * Submit a student's response to an activity. The authenticated student
 * can submit text content which updates the assignment status to
 * SUBMITTED.
 */
const submissionSchema = z.object({
  submission: z.string().min(1, 'Submissão não pode ser vazia'),
});

export async function submitActivity(req: Request, res: Response): Promise<void> {
  try {
    const assignmentId = req.params.assignmentId;
    const { submission } = submissionSchema.parse(req.body);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user as { id: string; role: string };
    const assignment = await prisma.studentActivity.findUnique({ where: { id: assignmentId } });
    if (!assignment || assignment.studentId !== user.id) {
      res.status(404).json({ message: 'Atividade não encontrada' });
      return;
    }
    await prisma.studentActivity.update({
      where: { id: assignmentId },
      data: { submission, status: 'SUBMITTED' },
    });
    res.json({ message: 'Submissão enviada com sucesso' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Erro ao enviar submissão' });
    }
  }
}