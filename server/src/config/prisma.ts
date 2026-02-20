// Prisma client singleton. Importing from this file ensures that the
// same PrismaClient instance is reused across the application. This
// avoids exhausting the database connection pool when hot reloading.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;