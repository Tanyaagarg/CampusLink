import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        let session: any = await auth();

        console.log("DEBUG: Current NODE_ENV:", process.env.NODE_ENV);
        console.log("DEBUG: Initial Session:", session);



        console.log("DEBUG: Final Session Email:", session?.user?.email);

        const targetEmail = session?.user?.email;
        if (!targetEmail) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        let user = await db.user.findUnique({
            where: { email: targetEmail },
            select: {
                id: true,
                name: true,
                image: true,
                // @ts-ignore
                // bio: true,
                // @ts-ignore
                // banner: true,
                branch: true,
                year: true,
                hostel: true,
                role: true,
                _count: {
                    select: {
                        ventures: true,
                        teamPosts: true,
                        listings: true
                    }
                },
            }
        });

        // Auto-Heal: If session exists but user doesn't (due to DB wipe), create it now.
        if (!user) {
            console.log("DEBUG: User missing in DB, recreating from session...");
            await db.user.create({
                data: {
                    email: targetEmail,
                    name: session.user?.name || "Unknown",
                    image: session.user?.image,
                    role: "STUDENT",
                    year: "1",
                    branch: "CSE",
                    hostel: "J",
                }
            });

            // Re-fetch to get the correct selected fields
            user = await db.user.findUnique({
                where: { email: targetEmail },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    branch: true,
                    year: true,
                    hostel: true,
                    role: true,
                    _count: {
                        select: {
                            ventures: true,
                            teamPosts: true,
                            listings: true
                        }
                    },
                }
            });
        }

        // Fallback: Fetch bio/banner/socials via Raw SQL (Bypass Prisma Client Schema Check)
        try {
            const rawData: any[] = await db.$queryRaw`SELECT bio, banner, github, linkedin, instagram, phone FROM "User" WHERE email = ${targetEmail}`;
            if (rawData && rawData[0]) {
                // @ts-ignore
                user.bio = rawData[0].bio;
                // @ts-ignore
                user.banner = rawData[0].banner;
                // @ts-ignore
                user.github = rawData[0].github;
                // @ts-ignore
                user.linkedin = rawData[0].linkedin;
                // @ts-ignore
                user.instagram = rawData[0].instagram;
                // @ts-ignore
                user.phone = rawData[0].phone;
            }
        } catch (e) {
            console.error("Raw SQL Fetch Failed:", e);
        }

        // Fetch Requests & Offers Separately
        if (user) {
            try {
                const [
                    teamReqs, rideReqs, tutorReqs,
                    teamPosts, hostedRides, listings
                ] = await Promise.all([
                    // REQUESTED (My Applications)
                    // @ts-ignore
                    db.teamRequest.findMany({
                        where: { userId: user.id },
                        select: {
                            id: true, status: true, createdAt: true,
                            post: { select: { title: true, type: true } }
                        },
                        orderBy: { createdAt: 'desc' }
                    }),
                    // @ts-ignore
                    db.rideRequest.findMany({
                        where: { userId: user.id },
                        select: {
                            id: true, status: true, createdAt: true,
                            ride: { select: { from: true, to: true, date: true } }
                        },
                        orderBy: { createdAt: 'desc' }
                    }),
                    // @ts-ignore
                    db.tutorRequest.findMany({
                        where: { userId: user.id },
                        select: {
                            id: true, status: true, createdAt: true,
                            tutorProfile: {
                                select: {
                                    subjects: true,
                                    user: { select: { name: true } }
                                }
                            }
                        },
                        orderBy: { createdAt: 'desc' }
                    }),

                    // OFFERED (My Posts)
                    // @ts-ignore
                    db.teamPost.findMany({
                        where: { authorId: user.id },
                        select: { id: true, title: true, type: true, status: true, createdAt: true },
                        orderBy: { createdAt: 'desc' }
                    }),
                    // @ts-ignore
                    db.ride.findMany({
                        where: { hostId: user.id },
                        select: { id: true, from: true, to: true, date: true, status: true, createdAt: true },
                        orderBy: { createdAt: 'desc' }
                    }),
                    // @ts-ignore
                    db.marketplaceListing.findMany({
                        where: { sellerId: user.id },
                        select: { id: true, title: true, price: true, status: true, createdAt: true },
                        orderBy: { createdAt: 'desc' }
                    })
                ]);

                // Fetch separate single objects or additional lists
                // @ts-ignore
                const myTutorProfile = await db.tutorProfile.findUnique({
                    where: { userId: user.id },
                    select: { id: true, subjects: true, hourlyRate: true, createdAt: true }
                });

                // @ts-ignore
                const myVentures = await db.venture.findMany({
                    where: { ownerId: user.id },
                    select: { id: true, name: true, category: true, status: true, createdAt: true },
                    orderBy: { createdAt: 'desc' }
                });

                // @ts-ignore
                user.teamRequests = teamReqs;
                // @ts-ignore
                user.rideRequests = rideReqs;
                // @ts-ignore
                user.tutorRequests = tutorReqs;

                // @ts-ignore
                user.teamPosts = teamPosts;
                // @ts-ignore
                user.hostedRides = hostedRides;
                // @ts-ignore
                user.listings = listings;
                // @ts-ignore
                user.tutorProfile = myTutorProfile;
                // @ts-ignore
                user.ventures = myVentures;

            } catch (error) {
                console.error("Failed to fetch requests/offers:", error);
                // Initialize empty
                // @ts-ignore
                user.teamRequests = [];
                // @ts-ignore
                user.rideRequests = [];
                // @ts-ignore
                user.tutorRequests = [];
                // @ts-ignore
                user.teamPosts = [];
                // @ts-ignore
                user.hostedRides = [];
                // @ts-ignore
                // @ts-ignore
                user.listings = [];
                // @ts-ignore
                user.tutorProfile = null;
                // @ts-ignore
                user.ventures = [];
            }
        }

        console.log("DEBUG: Found User:", user ? user.name : "NULL");

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        return NextResponse.json({ ...user, isOwner: true });

    } catch (error) {
        console.error("[USER_ME_GET]", error);
        return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : "Unknown"}`, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        let session: any = await auth();
        if (!session?.user?.email) {
            // Development fallback
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, bio, branch, year, hostel, image, banner, github, linkedin, instagram, phone } = body;

        const updatedUser = await db.user.update({
            where: { email: session?.user?.email || "" },
            // @ts-ignore - Client generation failed due to lock
            data: {
                name,
                // @ts-ignore
                // bio,
                branch,
                year,
                hostel,
                image,
                // @ts-ignore
                // banner
            }
        });

        // Fallback: Update bio/banner/socials via Raw SQL if provided
        try {
            console.log("DEBUG: Attempting Raw SQL Update. Bio:", bio, "Banner:", banner);
            if (bio !== undefined) {
                await db.$executeRaw`UPDATE "User" SET bio = ${bio} WHERE email = ${session?.user?.email}`;
                console.log("DEBUG: Bio updated via SQL");
                // @ts-ignore
                updatedUser.bio = bio;
            }
            if (banner !== undefined) {
                await db.$executeRaw`UPDATE "User" SET banner = ${banner} WHERE email = ${session?.user?.email}`;
                console.log("DEBUG: Banner updated via SQL");
                // @ts-ignore
                updatedUser.banner = banner;
            }

            // Socials
            if (github !== undefined) {
                await db.$executeRaw`UPDATE "User" SET github = ${github} WHERE email = ${session?.user?.email}`;
                // @ts-ignore
                updatedUser.github = github;
            }
            if (linkedin !== undefined) {
                await db.$executeRaw`UPDATE "User" SET linkedin = ${linkedin} WHERE email = ${session?.user?.email}`;
                // @ts-ignore
                updatedUser.linkedin = linkedin;
            }
            if (instagram !== undefined) {
                await db.$executeRaw`UPDATE "User" SET instagram = ${instagram} WHERE email = ${session?.user?.email}`;
                // @ts-ignore
                updatedUser.instagram = instagram;
            }
            if (phone !== undefined) {
                await db.$executeRaw`UPDATE "User" SET phone = ${phone} WHERE email = ${session?.user?.email}`;
                // @ts-ignore
                updatedUser.phone = phone;
            }

        } catch (e) {
            console.error("Raw SQL Update Failed:", e);
        }

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error("[USER_ME_PATCH]", error);
        return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : "Unknown"}`, { status: 500 });
    }
}
