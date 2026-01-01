import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await auth();
        let userId = session?.user?.email ? (await db.user.findUnique({ where: { email: session.user.email } }))?.id : null;



        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        const category = searchParams.get("category") || "All";

        const whereClause: any = {
            status: "AVAILABLE",
            OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { category: { contains: query, mode: "insensitive" } },
            ],
        };

        if (category !== "All") {
            whereClause.category = category;
        }

        const listings = await db.marketplaceListing.findMany({
            where: whereClause,
            include: {
                seller: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const formattedListings = listings.map((l) => ({
            ...l,
            isOwner: l.sellerId === userId,
        }));

        return NextResponse.json(formattedListings);
    } catch (error) {
        console.error("[MARKETPLACE_GET]", error);
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

        const body = await req.json();
        const { title, price, category, condition, description, images } = body;

        if (!title || !price || !category || !condition) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const listing = await db.marketplaceListing.create({
            data: {
                title,
                price: parseFloat(price),
                category,
                condition,
                description: description || "",
                images: images || [],
                sellerId: userId,
            },
        });

        return NextResponse.json(listing);

    } catch (error) {
        console.error("[MARKETPLACE_POST]", error);
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

        const { listingId } = await req.json();

        if (!listingId) {
            return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
        }

        const existingListing = await db.marketplaceListing.findUnique({
            where: { id: listingId },
        });

        if (!existingListing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        if (existingListing.sellerId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await db.marketplaceListing.delete({
            where: { id: listingId },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[MARKETPLACE_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
