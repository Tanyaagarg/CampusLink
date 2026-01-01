import { PrismaClient } from "@prisma/client";

declare global {
    var prisma_v2: PrismaClient | undefined;
}

export const db = globalThis.prisma_v2 || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma_v2 = db;
