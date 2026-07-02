import "./globals.css";

import { auth } from "@/auth";
import { SessionProvider } from "@/components/providers/session-provider";

export const metadata = {
  title: "Nivello | Dashboard",
  description: "Gerenciamento de obras e orçamentos",
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
