"use client";

import { useSession } from "next-auth/react";

export function SessionStatus() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Carregando sessão...
            </p>
        );
    }

    if (!session?.user) {
        return (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                (client) Nenhum usuário autenticado.
            </p>
        );
    }

    return (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
            (client) Sessão ativa: {session.user.email} · função: {session.user.role}
        </p>
    );
}
