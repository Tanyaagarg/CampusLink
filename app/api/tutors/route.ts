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

        const whereClause: any = {};



        // Better search logic: fetch all and filter in memory if "hasSome" with contains is difficult in prisma w/o postgres extensions sometimes, 
        // but for now let's just fetch all and filter in JS if needed or use simple logic.
        // Actually, let's just fetch all for now and standard filtering.

        const tutors = await db.tutorProfile.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        year: true,
                        branch: true,
                    },
                },
                requests: {
                    where: { userId: userId || "" }
                }
            },
        });

        const formattedTutors = tutors.map((t) => ({
            ...t,
            name: t.user.name,
            image: t.user.image,
            year: t.user.year + " " + t.user.branch, // Format year/branch
            avatar: t.user.name ? t.user.name.substring(0, 2).toUpperCase() : "?",
            color: "from-blue-500 to-indigo-600", // Default color
            rating: 5.0, // Mock rating for now
            reviews: 0,
            isOwner: t.userId === userId,
            hasRequested: t.requests.length > 0,
            requestStatus: t.requests[0]?.status,
        }));

        // Manual filter if query exists and wasn't handled by whereClause fully
        let finalTutors = formattedTutors;
        if (query) {
            const q = query.toLowerCase();
            finalTutors = formattedTutors.filter(t =>
                (t.name && t.name.toLowerCase().includes(q)) ||
                t.subjects.some(s => s.toLowerCase().includes(q))
            );
        }

        return NextResponse.json(finalTutors);

    } catch (error) {
        console.error("[TUTORS_GET]", error);
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

        const data = await req.json(); // subjects (array), rate, bio

        // Check if profile exists
        const existing = await db.tutorProfile.findUnique({ where: { userId } });
        if (existing) {
            // Update
            const updated = await db.tutorProfile.update({
                where: { userId },
                data: {
                    subjects: data.subjects,
                    hourlyRate: parseFloat(data.rate),
                    bio: data.bio
                }
            });
            return NextResponse.json(updated);
        }

        const profile = await db.tutorProfile.create({
            data: {
                userId,
                subjects: data.subjects,
                hourlyRate: parseFloat(data.rate),
                bio: data.bio
            },
        });

        return NextResponse.json(profile);

    } catch (error) {
        console.error("[TUTORS_POST]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;



        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Delete OWN profile
        await db.tutorProfile.delete({
            where: { userId },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[TUTORS_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
