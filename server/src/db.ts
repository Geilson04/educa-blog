import { randomUUID } from 'crypto';
import { hashPassword } from './utils/hash.js';

// User roles
export type Role = 'DOCENTE' | 'ALUNO';

// Interfaces representing our entities
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // stored as salted hash
  role: Role;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  content: string;
  createdAt: Date;
  teacherId: string;
}

export type ActivityStatus = 'PENDING' | 'SUBMITTED' | 'COMPLETED';

export interface StudentActivity {
  id: string;
  studentId: string;
  activityId: string;
  status: ActivityStatus;
  submission?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * In-memory database. In a real application you would use a
 * persistent store like PostgreSQL. For the purposes of this MVP
 * running in a restricted environment, we use arrays. All changes
 * live only for the process lifetime.
 */
export const db: {
  users: User[];
  activities: Activity[];
  assignments: StudentActivity[];
} = {
  users: [],
  activities: [],
  assignments: [],
};

// Seed some sample data on startup
export async function seed() {
  if (db.users.length > 0) return;
  // Create a teacher and a student
  const teacherPassword = await hashPassword('senha123');
  const studentPassword = await hashPassword('senha123');
  const teacher: User = {
    id: randomUUID(),
    name: 'Professor Carlos',
    email: 'professor@escola.com',
    password: teacherPassword,
    role: 'DOCENTE',
  };
  const student: User = {
    id: randomUUID(),
    name: 'Aluno Maria',
    email: 'aluno@escola.com',
    password: studentPassword,
    role: 'ALUNO',
  };
  db.users.push(teacher, student);
  // Sample activity created by teacher
  const activity: Activity = {
    id: randomUUID(),
    title: 'Atividade de Matemática',
    description: 'Exercícios básicos de adição e subtração',
    content: 'Resolva: 2+2=?, 5-3=?',
    createdAt: new Date(),
    teacherId: teacher.id,
  };
  db.activities.push(activity);
  // Assign to student
  const assignment: StudentActivity = {
    id: randomUUID(),
    studentId: student.id,
    activityId: activity.id,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.assignments.push(assignment);
}