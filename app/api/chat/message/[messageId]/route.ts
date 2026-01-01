import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Use global DB
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
    req: Request,
    props: { params: Promise<{ messageId: string }> }
) {
    const params = await props.params;
    try {
        console.log("DELETE request received");
        const session = await auth();
        console.log("Session:", session?.user?.email);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { messageId } = params;

        // Verify ownership
        // @ts-ignore
        const message = await db.message.findUnique({
            where: { id: messageId },
            include: { sender: true }
        });

        if (!message) {
            return new NextResponse("Message not found", { status: 404 });
        }

        console.log(`Checking ownership: SessionUser=[${session.user.email}] vs MessageSender=[${message.sender.email}]`);

        if (message.sender.email !== session.user.email) {
            console.log("Ownership mismatch...");
            return new NextResponse("Forbidden", { status: 403 });
        }

        await db.message.delete({
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
