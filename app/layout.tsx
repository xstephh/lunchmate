import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/common/Header";

export const metadata: Metadata = {
  title: "Lunchmate",
  description: "What’s for lunch? Familiar, Fresh, or Mixed—decide smarter."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="container-narrow py-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}