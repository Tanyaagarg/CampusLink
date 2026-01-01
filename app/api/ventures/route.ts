import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;



        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        const whereClause: any = {
            // status: "Open", // Don't filter by status by default for now, or maybe only show Open?
        };

        if (query) {
            const cleanedQuery = query.trim().replace(/^#/, "");
            const orConditions: any[] = [
                { name: { contains: cleanedQuery, mode: "insensitive" } },
                { description: { contains: cleanedQuery, mode: "insensitive" } },
                { hostel: { contains: cleanedQuery, mode: "insensitive" } },
                { category: { contains: cleanedQuery, mode: "insensitive" } },
            ];

            // If the query matches part of "Campus" (the default UI fallback for empty hostel),
            // include items with empty/null hostel. Only if query is long enough to be meaningful.
            if (cleanedQuery.length >= 3 && "campus".includes(cleanedQuery.toLowerCase())) {
                orConditions.push({ hostel: null });
                orConditions.push({ hostel: "" });
            }

            // Perform JSON search for catalog
            // We find IDs where the catalog (cast to text) contains the query
            // This is a simple, effective way to search JSON structure for text
            const jsonMatches: { id: string }[] = await db.$queryRaw`
                SELECT id FROM "Venture" 
                WHERE "catalog"::text ILIKE ${'%' + cleanedQuery + '%'}
            `;

            if (jsonMatches.length > 0) {
                const jsonIds = jsonMatches.map(m => m.id);
                orConditions.push({ id: { in: jsonIds } });
            }

            whereClause.OR = orConditions;
        }

        const ventures = await db.venture.findMany({
            where: whereClause,
            include: {
                owner: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const formattedVentures = ventures.map((v) => ({
            ...v,
            isOwner: v.ownerId === userId,
        }));

        return NextResponse.json(formattedVentures);

    } catch (error) {
        console.error("[VENTURES_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;



        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        // Basic validation

        const { name, description, category, timing, contact, hostel, catalog, logo } = data;

        const venture = await db.venture.create({
            data: {
                name,
                description,
                category,
                timing,
                contact,
                hostel,
                logo,
                catalog: catalog || [], // Ensure it is not undefined
                ownerId: userId,
                status: "Open",
            },
        });

        return NextResponse.json(venture);

    } catch (error) {
        console.error("[VENTURES_POST]", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;



        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { ventureId } = await req.json();

        if (!ventureId) {
            return NextResponse.json({ error: "Venture ID is required" }, { status: 400 });
        }

        const existingVenture = await db.venture.findUnique({
            where: { id: ventureId },
        });

        if (!existingVenture) {
            return NextResponse.json({ error: "Venture not found" }, { status: 404 });
        }

        if (existingVenture.ownerId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await db.venture.delete({
            where: { id: ventureId },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[VENTURES_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;



        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { ventureId, status, name, description, category, timing, contact, hostel, catalog, logo } = await req.json();

        const existingVenture = await db.venture.findUnique({
            where: { id: ventureId },
        });

        if (!existingVenture) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (existingVenture.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const updatedVenture = await db.venture.update({
            where: { id: ventureId },
            data: {
                status,
                name,
                description,
                category,
                timing,
                contact,
                hostel,
                catalog,
                logo
            },
        });

        return NextResponse.json(updatedVenture);
    } catch (error) {
        console.error("[VENTURES_PUT]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
