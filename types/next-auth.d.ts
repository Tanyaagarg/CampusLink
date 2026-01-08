import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            branch?: string | null
            year?: string | null
            hostel?: string | null
        } & DefaultSession["user"]
    }

    interface User {
        branch?: string | null
        year?: string | null
        hostel?: string | null
    }
}
