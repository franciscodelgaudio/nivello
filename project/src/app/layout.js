import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { auth } from "@/auth";
import { SessionProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata = {
  title: "Nivello | Dashboard",
  description: "Gerenciamento de obras e orçamentos",
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="pt-BR" className={`h-full antialiased ${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
