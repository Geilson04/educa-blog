/* eslint-disable no-console */
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/utils/hash.js';

const prisma = new PrismaClient();

async function main() {
  // Create sample users
  const teacherPassword = await hashPassword('senha123');
  const studentPassword = await hashPassword('senha123');
  const [teacher, student] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'professor@escola.com' },
      update: {},
      create: {
        name: 'Professor Carlos',
        email: 'professor@escola.com',
        password: teacherPassword,
        role: Role.DOCENTE,
      },
    }),
    prisma.user.upsert({
      where: { email: 'aluno@escola.com' },
      update: {},
      create: {
        name: 'Aluno Maria',
        email: 'aluno@escola.com',
        password: studentPassword,
        role: Role.ALUNO,
      },
    }),
  ]);

  // Create sample activity
  const activity = await prisma.activity.upsert({
    where: { id: 'sample-activity-1' },
    update: {},
    create: {
      id: 'sample-activity-1',
      title: 'Atividade de Matemática',
      description: 'Exercícios básicos de adição e subtração',
      content: 'Resolva os seguintes problemas: 2+2=?, 5-3=?',
      teacherId: teacher.id,
    },
  });

  // Assign the activity to the student
  await prisma.studentActivity.upsert({
    where: { id: 'sample-assignment-1' },
    update: {},
    create: {
      id: 'sample-assignment-1',
      studentId: student.id,
      activityId: activity.id,
      status: 'PENDING',
    },
  });

  console.log('Sample data seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });