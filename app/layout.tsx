import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/common/Header";
import Link from "next/link";
import ThemeToggle from "@/components/common/ThemeToggle.client";

export const metadata: Metadata = {
  title: "Lunchmate",
  description: "What’s for lunch? Familiar, Fresh, or Mixed—decide smarter.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="border-b bg-[hsl(var(--background))]/70 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))/0.7]">
            <div className="container-narrow flex h-14 items-center justify-between">
              <Link href="/" className="font-semibold tracking-tight">
                🍱 Lunchmate
              </Link>
              <nav className="flex items-center gap-3 text-sm text-muted-foreground">
                <Link href="/manage" className="hover:text-foreground">
                  Manage
                </Link>
                <Link href="/history" className="hover:text-foreground">
                  History
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="container-narrow py-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
