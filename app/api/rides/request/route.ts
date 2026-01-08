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

        const { rideId } = await req.json();

        if (!rideId) {
            return NextResponse.json({ error: "Ride ID is required" }, { status: 400 });
        }

        // Prevent duplicate requests
        const existingRequest = await db.rideRequest.findUnique({
            where: {
                userId_rideId: {
                    userId,
                    rideId,
                }
            }
        });

        if (existingRequest) {
            return NextResponse.json({ error: "Request already sent" }, { status: 409 });
        }

        const request = await db.rideRequest.create({
            data: {
                userId,
                rideId,
            }
        });

        // Create Notification for Ride Host
        const ride = await db.ride.findUnique({
            where: { id: rideId },
            select: { hostId: true, from: true, to: true }
        });

        if (ride && ride.hostId !== userId) {
            await db.notification.create({
                data: {
                    userId: ride.hostId,
                    type: "RIDE_REQUEST",
                    title: "New Ride Request",
                    message: `Someone requested to join your ride from ${ride.from} to ${ride.to}`,
                    metadata: { rideId, requestId: request.id }
                }
            });
        }

        return NextResponse.json(request);

    } catch (error) {
        console.error("[RIDE_REQUEST_POST]", error);
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

        const { rideId } = await req.json();

        if (!rideId) {
            return NextResponse.json({ error: "Ride ID is required" }, { status: 400 });
        }

        await db.rideRequest.delete({
            where: {
                userId_rideId: {
                    userId,
                    rideId,
                }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[RIDE_REQUEST_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
