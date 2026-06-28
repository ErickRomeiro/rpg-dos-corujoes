// Cliente Prisma (singleton).
// Em desenvolvimento, reaproveita a mesma instância entre hot-reloads para
// evitar excesso de conexões. O cliente gerado fica em lib/generated/prisma.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

function resolverDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;

  // Durante o build de produção ainda não há conexão real e nenhuma query é
  // executada — usamos um placeholder só para permitir a construção do cliente.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return "postgresql://build:build@localhost:5432/build";
  }

  throw new Error(
    "DATABASE_URL não definida. Configure-a em .env.local (local) e nas variáveis de ambiente da Vercel (produção).",
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: resolverDatabaseUrl() }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
