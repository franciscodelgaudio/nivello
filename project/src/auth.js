import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import { authConfig } from "@/auth.config";
import clientPromise from "@/lib/handler/mongodbClient";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: MongoDBAdapter(clientPromise),
    session: {
        strategy: "jwt",
    },
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role ?? "user";
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub;
                session.user.role = token.role ?? "user";
            }

            return session;
        },
    },
});
