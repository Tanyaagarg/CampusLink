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

        const { tutorProfileId } = await req.json();

        if (!tutorProfileId) {
            return NextResponse.json({ error: "Tutor Profile ID is required" }, { status: 400 });
        }

        // Prevent duplicate requests
        const existingRequest = await db.tutorRequest.findUnique({
            where: {
                userId_tutorProfileId: {
                    userId,
                    tutorProfileId
                }
            }
        });

        if (existingRequest) {
            return NextResponse.json({ error: "Request already sent" }, { status: 409 });
        }

        const request = await db.tutorRequest.create({
            data: {
                userId,
                tutorProfileId,
            }
        });

        return NextResponse.json(request);

    } catch (error) {
        console.error("[TUTOR_REQUEST_POST]", error);
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

        const { tutorProfileId } = await req.json();

        if (!tutorProfileId) {
            return NextResponse.json({ error: "Tutor Profile ID is required" }, { status: 400 });
        }

        await db.tutorRequest.delete({
            where: {
                userId_tutorProfileId: {
                    userId,
                    tutorProfileId
                }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[TUTOR_REQUEST_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
