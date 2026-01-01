import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: Request, props: { params: Promise<{ conversationId: string }> }) {
    const params = await props.params;
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

        // Mark received messages as read
        await db.message.updateMany({
            where: {
                conversationId: params.conversationId,
                senderId: { not: userId },
                read: false
            },
            data: {
                read: true
            }
        });

        const messages = await db.message.findMany({
            where: {
                conversationId: params.conversationId
            },
            include: {
                sender: {
                    select: { id: true, name: true, image: true }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return NextResponse.json(messages);

    } catch (error) {
        console.error("[MESSAGES_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request, props: { params: Promise<{ conversationId: string }> }) {
    const params = await props.params;
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

        const { text, type, attachment } = await req.json();

        const message = await db.message.create({
            data: {
                text: text || "", // Allow empty text if attachment exists
                type: type || "text",
                attachment,
                conversationId: params.conversationId,
                senderId: userId
            },
            include: {
                sender: {
                    select: { id: true, name: true, image: true }
                }
            }
        });

        // Update conversation timestamp
        await db.conversation.update({
            where: { id: params.conversationId },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(message);

    } catch (error) {
        console.error("[MESSAGE_POST]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ conversationId: string }> }) {
    const params = await props.params;
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

        const conversation = await db.conversation.findUnique({
            where: { id: params.conversationId },
            include: { users: true }
        });

        if (!conversation) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const isParticipant = conversation.users.some((u: any) => u.id === userId);
        if (!isParticipant) {
            if (process.env.NODE_ENV === "development") {
                console.log("DEV MODE: Allowing chat delete despite not being participant.");
            } else {
                return new NextResponse("Forbidden", { status: 403 });
            }
        }

        await db.conversation.delete({
            where: { id: params.conversationId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[CONVERSATION_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
