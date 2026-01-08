import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET: List all conversations for the current user
export async function GET(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;



        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Update user heartbeat
        await db.user.update({
            where: { id: userId },
            data: { lastSeen: new Date() }
        });

        const conversations = await db.conversation.findMany({
            where: {
                users: {
                    some: { id: userId }
                }
            },
            include: {
                users: {
                    where: { id: { not: userId } },
                    select: { id: true, name: true, image: true, email: true, lastSeen: true }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                read: false,
                                senderId: { not: userId }
                            }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Format for frontend
        const formatted = conversations.map(c => {
            const unreadCount = (c as any)._count?.messages || 0;
            return {
                id: c.id,
                otherUser: c.users[0], // The other participant
                lastMessage: c.messages[0]?.text || "No messages yet",
                updatedAt: c.updatedAt,
                unreadCount
            };
        });

        return NextResponse.json(formatted);

    } catch (error) {
        console.error("[CHAT_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// POST: Create a new conversation with a specific user
export async function POST(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;



        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { targetUserId } = await req.json();

        if (!targetUserId) {
            return NextResponse.json({ error: "Target user required" }, { status: 400 });
        }

        // Helper to format conversation for frontend
        const formatConversation = (c: any) => ({
            id: c.id,
            otherUser: c.users.find((u: any) => u.id !== userId),
            lastMessage: c.messages?.[0]?.text || "No messages yet",
            updatedAt: c.updatedAt
        });

        // Check if conversation already exists
        const existing = await db.conversation.findFirst({
            where: {
                AND: [
                    { users: { some: { id: userId } } },
                    { users: { some: { id: targetUserId } } }
                ]
            },
            include: {
                users: {
                    select: { id: true, name: true, image: true, email: true, lastSeen: true }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (existing) {
            return NextResponse.json(formatConversation(existing));
        }

        const conversation = await db.conversation.create({
            data: {
                users: {
                    connect: [
                        { id: userId },
                        { id: targetUserId }
                    ]
                }
            },
            include: {
                users: {
                    select: { id: true, name: true, image: true, email: true, lastSeen: true }
                }
            }
        });

        return NextResponse.json(formatConversation(conversation));

    } catch (error) {
        console.error("[CHAT_POST]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
