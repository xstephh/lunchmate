"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLinks() {
  const pathname = usePathname();
  const items = [
    { href: "/manage", label: "Manage" },
    { href: "/history", label: "History" },
  ];

  return (
    <nav className="flex items-center gap-1 text-sm">
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted/70",
              active && "bg-muted/80 text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
