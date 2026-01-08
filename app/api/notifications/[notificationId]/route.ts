import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ notificationId: string }> }
) {
    try {
        const { notificationId } = await params;
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;

        if (!userId && process.env.NODE_ENV === "development") {
            const devUser = await db.user.findUnique({ where: { email: "dev@campuslink.com" } });
            userId = devUser?.id;
        }

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Just update read status
        const notification = await db.notification.update({
            where: {
                id: notificationId,
                userId, // Ensure ownership
            },
            data: {
                read: true,
            },
        });

        return NextResponse.json(notification);

    } catch (error) {
        console.error("[NOTIFICATION_PATCH]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ notificationId: string }> }
) {
    try {
        const { notificationId } = await params;
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;

        if (!userId && process.env.NODE_ENV === "development") {
            const devUser = await db.user.findUnique({ where: { email: "dev@campuslink.com" } });
            userId = devUser?.id;
        }

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await db.notification.delete({
            where: {
                id: notificationId,
                userId, // Ensure ownership
            },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[NOTIFICATION_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
