import NextAuth from "next-auth"
// re-trigger build
import Google from "next-auth/providers/google"
import dotenv from "dotenv"

dotenv.config()

import { db } from "@/lib/db"

console.log("DEBUG_AUTH_SECRET:", process.env.AUTH_SECRET ? "Exists" : "Missing");

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google],
    callbacks: {
        async signIn({ profile }) {
            if (!profile?.email) return false

            // Strict domain check
            if (!profile.email.endsWith("@thapar.edu")) return false;

            try {
                // Check if user exists
                const existingUser = await db.user.findUnique({
                    where: { email: profile.email }
                });

                if (!existingUser) {
                    console.log("Creating new user for:", profile.email);
                    await db.user.create({
                        data: {
                            email: profile.email,
                            name: profile.name || "Unknown",
                            image: profile.picture,
                            role: "STUDENT",
                            year: "1",
                            branch: "CSE",
                            hostel: "J",
                        }
                    });
                }
                return true;
            } catch (error) {
                console.error("Error creating user during signin:", error);
                return false;
            }
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
            }

            // Should fetch fresh data from DB to ensure updates (like profile edits) are reflected
            if (token.email) {
                const dbUser = await db.user.findUnique({ where: { email: token.email } });
                if (dbUser) {
                    token.id = dbUser.id;
                    token.branch = dbUser.branch;
                    token.year = dbUser.year;
                    token.hostel = dbUser.hostel;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.branch = token.branch as string;
                session.user.year = token.year as string;
                session.user.hostel = token.hostel as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/", // Custom sign-in page is the home page
    },
})
