import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ messageId: string }> }
) {
    try {
        console.log("DELETE request received");
        const session = await auth();
        console.log("Session:", session?.user?.email);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        console.log("Prisma Keys:", Object.keys(prisma));
        // @ts-ignore
        console.log("Prisma Message Model:", prisma.message);

        const { messageId } = await params;

        // Verify ownership
        // @ts-ignore
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            include: { sender: true }
        });

        if (!message) {
            return new NextResponse("Message not found", { status: 404 });
        }

        console.log(`Checking ownership: SessionUser=[${session.user.email}] vs MessageSender=[${message.sender.email}]`);

        if (message.sender.email !== session.user.email) {
            console.log("Ownership mismatch...");
            if (process.env.NODE_ENV === "development") {
                console.log("DEV MODE: Allowing deletion despite mismatch.");
            } else {
                console.log("Forbidden.");
                return new NextResponse("Forbidden", { status: 403 });
            }
        }

        await prisma.message.delete({
            where: { id: messageId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[MESSAGE_DELETE_ERROR]", error);
        // @ts-ignore
        const errorMessage = error?.message || "Unknown error";
        console.log("Error details:", errorMessage);
        return new NextResponse(`Internal Error: ${errorMessage}`, { status: 500 });
    }
}
