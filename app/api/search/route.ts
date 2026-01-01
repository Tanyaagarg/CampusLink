
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json([]);
    }

    const cleanedQuery = query.trim().replace(/^#/, "");
    const lowerQuery = cleanedQuery.toLowerCase();

    try {
        // 1. Team Finder Logic
        const teamQuery = prisma.teamPost.findMany({
            where: {
                status: "OPEN",
                OR: [
                    { title: { contains: cleanedQuery, mode: "insensitive" } },
                    { description: { contains: cleanedQuery, mode: "insensitive" } },
                    { lookingFor: { contains: cleanedQuery, mode: "insensitive" } },
                    { author: { name: { contains: cleanedQuery, mode: "insensitive" } } },
                    {
                        tags: {
                            hasSome: [
                                query,
                                cleanedQuery,
                                lowerQuery,
                                cleanedQuery.charAt(0).toUpperCase() + cleanedQuery.slice(1).toLowerCase() // Capitalized
                            ]
                        }
                    }
                ],
            },
            include: { author: true },
        });

        // 2. Rides Logic
        const rideQuery = prisma.ride.findMany({
            where: {
                status: "ACTIVE",
                OR: [
                    { from: { contains: query, mode: "insensitive" } },
                    { to: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                ],
            },
            include: { host: true },
        });

        // 3. Marketplace Logic
        const marketQuery = prisma.marketplaceListing.findMany({
            where: {
                status: "AVAILABLE",
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                    { category: { contains: query, mode: "insensitive" } },
                ],
            },
            include: { seller: true },
        });

        // 4. Ventures Logic
        const ventureWhere: any = {
            OR: [
                { name: { contains: cleanedQuery, mode: "insensitive" } },
                { description: { contains: cleanedQuery, mode: "insensitive" } },
                { category: { contains: cleanedQuery, mode: "insensitive" } },
                { hostel: { contains: cleanedQuery, mode: "insensitive" } },
            ],
        };

        if (cleanedQuery.length >= 3 && "campus".includes(lowerQuery)) {
            ventureWhere.OR.push({ hostel: null });
            ventureWhere.OR.push({ hostel: "" });
        }

        try {
            const jsonMatches: { id: string }[] = await prisma.$queryRaw`
                SELECT id FROM "Venture" 
                WHERE "catalog"::text ILIKE ${'%' + cleanedQuery + '%'}
            `;

            if (jsonMatches.length > 0) {
                const jsonIds = jsonMatches.map(m => m.id);
                ventureWhere.OR.push({ id: { in: jsonIds } });
            }
        } catch (e) {
            console.warn("Catalog search optional raw query failed", e);
        }

        const ventureQuery = (prisma.venture as any).findMany({
            where: ventureWhere,
        });

        // 5. Tutors Logic
        const tutorQuery = prisma.tutorProfile.findMany({
            where: {
                OR: [
                    { subjects: { hasSome: [query, cleanedQuery, lowerQuery] } },
                    { bio: { contains: query, mode: "insensitive" } },
                    { user: { name: { contains: query, mode: "insensitive" } } },
                ]
            },
            include: { user: true },
        });

        // 6. Users Logic
        const userQuery = prisma.user.findMany({
            where: {
                name: { contains: cleanedQuery, mode: "insensitive" }
            },
            select: {
                id: true,
                name: true,
                branch: true,
                year: true,
                hostel: true,
                image: true,
                createdAt: true
            }
        });

        // Execute all
        const [teams, rides, marketItems, ventures, tutors, users] = await Promise.all([
            teamQuery,
            rideQuery,
            marketQuery,
            ventureQuery,
            tutorQuery,
            userQuery
        ]);

        // Normalize results
        const results = [
            ...users.map(item => ({
                id: item.id,
                type: "user",
                title: item.name,
                desc: `${item.branch || 'Unknown Branch'} • ${item.year || 'Unknown Year'} • ${item.hostel || 'Unknown Hostel'}`,
                tags: [item.branch, item.year, item.hostel].filter(Boolean),
                link: `/dashboard/profile/${item.id}`,
                author: "CampusLink User",
                createdAt: item.createdAt,
            })),
            ...teams.map(item => ({
                id: item.id,
                type: "team",
                title: item.title,
                desc: item.description,
                tags: item.tags,
                link: "/dashboard/team-finder",
                author: item.author.name || "Unknown",
                createdAt: item.createdAt,
            })),
            ...rides.map(item => ({
                id: item.id,
                type: "ride",
                title: `Ride: ${item.from} -> ${item.to}`,
                desc: `${item.date.toLocaleDateString()} at ${item.time} (${item.type})`,
                tags: [item.type, `${item.seats} Seats`],
                link: "/dashboard/rides",
                author: item.host.name || "Unknown",
                createdAt: item.createdAt,
            })),
            ...marketItems.map(item => ({
                id: item.id,
                type: "market",
                title: item.title,
                desc: `₹${item.price} - ${item.description?.substring(0, 50)}...`,
                tags: [item.category, `₹${item.price}`],
                link: "/dashboard/marketplace",
                author: item.seller.name || "Unknown",
                createdAt: item.createdAt,
            })),
            ...ventures.map((item: any) => ({
                id: item.id,
                type: "venture",
                title: item.name,
                desc: item.description,
                tags: [item.category, item.hostel || "Campus"],
                link: "/dashboard/ventures",
                author: "Venture Owner",
                createdAt: item.createdAt,
            })),
            ...tutors.map(item => ({
                id: item.id,
                type: "tutor",
                title: `${item.user.name} (Tutor)`,
                desc: item.bio || "Rich academic background",
                tags: [...item.subjects, `₹${item.hourlyRate}/hr`],
                link: "/dashboard/tutors",
                author: item.user.name || "Unknown",
                createdAt: item.createdAt,
            })),
        ];

        // Sort by newest first
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(results);

    } catch (error) {
        console.error("Global Search Error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
