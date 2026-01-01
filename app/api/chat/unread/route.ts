import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Count unread messages where the current user is a participant in the conversation
        // but NOT the sender of the message.
        // We first need to find all conversations the user is part of.

        // However, a more direct query on Message might be more efficient if we can filter by conversations the user is in.
        // But Prisma doesn't support "where conversation.users has some id" directly in Message query easily without a join.
        // Actually it does:

        const unreadCount = await db.conversation.count({
            where: {
                users: {
                    some: {
                        id: user.id
                    }
                },
                messages: {
                    some: {
                        senderId: {
                            not: user.id
                        },
                        read: false
                    }
                }
            }
        });

        return NextResponse.json({ count: unreadCount });

    } catch (error) {
        console.error("[CHAT_UNREAD_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
