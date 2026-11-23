// Patrón Singleton (capa de datos).
// Cada función serverless reutiliza una sola instancia de PrismaClient para no
// agotar las conexiones de PostgreSQL (RNF2). En desarrollo se guarda en globalThis
// porque Next.js recarga los módulos en cada cambio.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

function crearCliente() {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
}

export const prisma: PrismaClient = globalParaPrisma.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") globalParaPrisma.prisma = prisma;
