"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="border-b sticky top-0 z-40 backdrop-blur bg-background/80">
      <div className="container-narrow flex h-14 items-center justify-between">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="font-semibold">
            Lunchmate
          </Link>
          <Link href="/suggest" className="hover:underline">
            Suggest
          </Link>
          <Link href="/manage" className="hover:underline">
            Manage
          </Link>
          <Link href="/history" className="hover:underline">
            History
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
