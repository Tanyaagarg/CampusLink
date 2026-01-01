import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { userId } = await params;

        if (!userId) {
            return new NextResponse("User ID required", { status: 400 });
        }

        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                // @ts-ignore
                banner: true,
                bio: true,
                github: true,
                linkedin: true,
                instagram: true,
                branch: true,
                year: true,
                hostel: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        ventures: true,
                        teamPosts: true,
                        listings: true,
                        rides: true
                    }
                }
            }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Check ownership
        const currentUserEmail = session.user?.email || "";
        const currentUser = await db.user.findUnique({
            where: { email: currentUserEmail },
            select: { id: true }
        });

        const isOwner = currentUser?.id === user.id;

        return NextResponse.json({ ...user, isOwner });

    } catch (error) {
        console.error("[USER_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
