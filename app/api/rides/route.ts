import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;



        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        const whereClause: any = {
            status: "ACTIVE",
        };

        if (query) {
            whereClause.OR = [
                { from: { contains: query, mode: "insensitive" } },
                { to: { contains: query, mode: "insensitive" } },
            ];
        }

        const rides = await db.ride.findMany({
            where: whereClause,
            include: {
                host: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
                requests: {
                    where: { userId: userId || "" },
                    select: { status: true }
                }
            },
            orderBy: {
                date: "asc",
            },
        });

        const formattedRides = rides.map((ride) => ({
            ...ride,
            isOwner: ride.hostId === userId,
            hasRequested: ride.requests.length > 0,
            requestStatus: ride.requests[0]?.status || null,
        }));

        return NextResponse.json(formattedRides);

    } catch (error) {
        console.error("[RIDES_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;



        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        // Basic validation could go here

        const ride = await db.ride.create({
            data: {
                ...data,
                date: new Date(data.date), // Ensure date is Date object
                price: parseFloat(data.price), // Ensure price is float
                seats: parseInt(data.seats), // Ensure seats is int
                hostId: userId,
            },
        });

        return NextResponse.json(ride);

    } catch (error) {
        console.error("[RIDES_POST]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;



        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { rideId } = await req.json();

        if (!rideId) {
            return NextResponse.json({ error: "Ride ID is required" }, { status: 400 });
        }

        const existingRide = await db.ride.findUnique({
            where: { id: rideId },
        });

        if (!existingRide) {
            return NextResponse.json({ error: "Ride not found" }, { status: 404 });
        }

        if (existingRide.hostId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await db.ride.delete({
            where: { id: rideId },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[RIDES_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
