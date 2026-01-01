import { PrismaClient } from "@prisma/client";

declare global {
    var prisma_v2: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
    // Prevent build failures if DATABASE_URL is missing
    const url = process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy";
    return new PrismaClient({
        datasources: {
            db: {
                url,
            },
        },
    });
};

export const db = globalThis.prisma_v2 || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma_v2 = db;
