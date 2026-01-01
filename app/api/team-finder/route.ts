import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;

        // Dev fallback


        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const query = searchParams.get("q");

        const whereClause: any = {
            status: "OPEN",
        };

        if (category && category !== "All") {
            whereClause.type = category;
        }

        if (query) {
            const cleanedQuery = query.trim().replace(/^#/, "");

            whereClause.OR = [
                { title: { contains: cleanedQuery, mode: "insensitive" } },
                { description: { contains: cleanedQuery, mode: "insensitive" } },
                { lookingFor: { contains: cleanedQuery, mode: "insensitive" } },
                { author: { name: { contains: cleanedQuery, mode: "insensitive" } } },
                {
                    tags: {
                        hasSome: [
                            query,
                            cleanedQuery,
                            query.toLowerCase(),
                            cleanedQuery.toLowerCase(),
                            cleanedQuery.charAt(0).toUpperCase() + cleanedQuery.slice(1).toLowerCase()
                        ]
                    }
                }
            ];
        }

        const posts = await db.teamPost.findMany({
            where: whereClause,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true, // Assuming branch/year is stored here or similar
                        image: true,
                        year: true,
                        branch: true
                    },
                },
                requests: {
                    where: { userId: userId || "" }, // Only fetch request for current user to check status
                    select: { status: true }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const formattedPosts = posts.map((post) => ({
            ...post,
            isOwner: post.authorId === userId,
        }));

        return NextResponse.json(formattedPosts);

    } catch (error) {
        console.error("[TEAM_FINDER_GET]", error);
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

        const post = await db.teamPost.create({
            data: {
                ...data,
                authorId: userId,
            },
        });

        return NextResponse.json(post);

    } catch (error) {
        console.error("[TEAM_FINDER_POST]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;



        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await req.json();

        if (!postId) {
            return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
        }

        // Verify ownership
        const existingPost = await db.teamPost.findUnique({
            where: { id: postId },
        });

        if (!existingPost) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        if (existingPost.authorId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await db.teamPost.delete({
            where: { id: postId },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[TEAM_FINDER_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
