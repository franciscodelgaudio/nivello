import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import clientPromise from "@/lib/handler/mongodbClient";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        Google({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
    ],
    session: {
        strategy: "database",
    },
    pages: {
        signIn: "/login",
    },
    trustHost: true,
    callbacks: {
        async session({ session, user }) {
            session.user.id = user.id;
            session.user.role = user.role ?? "user";
            return session;
        },
    },
});
