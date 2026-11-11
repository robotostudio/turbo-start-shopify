"use client";

import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/profile", label: "Profile & addresses" },
] as const;

function isActive(pathname: string, href: string): boolean {
  return href === "/account" ? pathname === href : pathname.startsWith(href);
}

function AccountNavLinks({ pathname }: Readonly<{ pathname: string | null }>) {
  return (
    <nav aria-label="Account">
      <ul className="flex gap-6 overflow-x-auto text-sm md:flex-col md:gap-3">
        {LINKS.map((link) => {
          const active = pathname !== null && isActive(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap transition-colors hover:text-foreground",
                  active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ActiveAccountNav() {
  return <AccountNavLinks pathname={usePathname()} />;
}

/**
 * `usePathname` is request data under Cache Components, so the active state
 * streams in; the prerendered fallback is the same links with none active.
 */
export function AccountNav() {
  return (
    <Suspense fallback={<AccountNavLinks pathname={null} />}>
      <ActiveAccountNav />
    </Suspense>
  );
}
