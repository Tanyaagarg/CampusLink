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
        }
    },
    pages: {
        signIn: "/", // Custom sign-in page is the home page
    },
    // Hardcoding secret for local dev to bypass .env read issues
    secret: "7f8b3c2d1e9f4a5b6c7d8e9f0a1b2c3d",
})
