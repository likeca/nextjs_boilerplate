import { prisma } from './prisma';

// Export prisma client as db for consistency with actions
export const db = prisma;
