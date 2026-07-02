import Link from "next/link";

import { auth } from "@/auth";
import { SessionStatus } from "@/components/auth/session-status";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-6 py-32 px-16 bg-white text-center dark:bg-black">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          Nivello
        </h1>

        {session?.user ? (
          <>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              (server) Logado como{" "}
              <span className="font-medium text-zinc-950 dark:text-zinc-50">
                {session.user.name ?? session.user.email}
              </span>{" "}
              · função: {session.user.role}
            </p>
            <SessionStatus />
            <SignOutButton />
          </>
        ) : (
          <>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Você não está autenticado.
            </p>
            <SessionStatus />
            <Button render={<Link href="/login" />}>Entrar</Button>
          </>
        )}
      </main>
    </div>
  );
}
