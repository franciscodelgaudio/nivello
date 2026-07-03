import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-lg border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-zinc-950">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
          Entrar no Nivello
        </h1>
        <form
          className="w-full"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <SubmitButton className="w-full">
            Entrar com Google
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
