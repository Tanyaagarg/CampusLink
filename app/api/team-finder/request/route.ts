import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;

        if (!userId && process.env.NODE_ENV === "development") {
            const devUser = await db.user.findUnique({ where: { email: "dev@campuslink.com" } });
            userId = devUser?.id;
        }

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await req.json();

        if (!postId) {
            return NextResponse.json({ error: "Post ID required" }, { status: 400 });
        }

        // Create request
        const request = await db.teamRequest.create({
            data: {
                userId,
                postId,
                status: "PENDING"
            }
        });

        // Create Notification for Post Owner
        const post = await db.teamPost.findUnique({
            where: { id: postId },
            select: { authorId: true, title: true }
        });

        if (post && post.authorId !== userId) {
            await db.notification.create({
                data: {
                    userId: post.authorId,
                    type: "TEAM_REQUEST",
                    title: "New Team Request",
                    message: `Someone requested to join your team for "${post.title}"`,
                    metadata: { postId, requestId: request.id }
                }
            });
        }

        return NextResponse.json(request);

    } catch (error) {
        // Handle unique constraint violation (already requested)
        if ((error as any).code === 'P2002') {
            return NextResponse.json({ error: "Already requested" }, { status: 400 });
        }
        console.error("[TEAM_REQUEST_POST]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;

        if (!userId && process.env.NODE_ENV === "development") {
            const devUser = await db.user.findUnique({ where: { email: "dev@campuslink.com" } });
            userId = devUser?.id;
        }

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await req.json();

        if (!postId) {
            return NextResponse.json({ error: "Post ID required" }, { status: 400 });
        }

        // Delete request
        await db.teamRequest.delete({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[TEAM_REQUEST_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
