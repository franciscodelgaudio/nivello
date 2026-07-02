import { NextResponse } from "next/server";

import { auth } from "@/auth";

const publicRoutes = ["/", "/login"];

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
