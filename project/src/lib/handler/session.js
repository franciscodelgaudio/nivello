import { redirect } from "next/navigation";

import { auth } from "@/auth";

export async function requireUser() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return session.user;
}

export async function requireRole(role) {
    const user = await requireUser();

    if (user.role !== role) {
        redirect("/");
    }

    return user;
}
