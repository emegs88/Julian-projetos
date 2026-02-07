// Prisma é opcional - apenas usado em algumas rotas internas
// Se não estiver instalado, retorna um mock que lança erro quando usado
let PrismaClient: any;
try {
  PrismaClient = require('@prisma/client').PrismaClient;
} catch (e) {
  // Prisma não está instalado - criar mock
  PrismaClient = null;
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma = PrismaClient
  ? (globalForPrisma.prisma ??
     new PrismaClient({
       log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
     }))
  : ({
      // Mock que lança erro quando usado
      findMany: () => {
        throw new Error('Prisma não está configurado. Instale @prisma/client e execute prisma generate.');
      },
      findUnique: () => {
        throw new Error('Prisma não está configurado. Instale @prisma/client e execute prisma generate.');
      },
      create: () => {
        throw new Error('Prisma não está configurado. Instale @prisma/client e execute prisma generate.');
      },
      update: () => {
        throw new Error('Prisma não está configurado. Instale @prisma/client e execute prisma generate.');
      },
      delete: () => {
        throw new Error('Prisma não está configurado. Instale @prisma/client e execute prisma generate.');
      },
    } as any);

if (process.env.NODE_ENV !== 'production' && PrismaClient) {
  globalForPrisma.prisma = prisma;
}
