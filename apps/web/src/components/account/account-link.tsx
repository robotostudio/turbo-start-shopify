import Link from "next/link";

import { UserIcon } from "../icons";

/**
 * Navbar entry to `/account`. Signed out, the proxy turns the visit into
 * sign-in, so one link serves both states and the cached navbar never has to
 * read the session cookie. `prefetch={false}`: a prefetch of a signed-out
 * `/account` would follow that redirect and start a sign-in flow.
 */
export function AccountLink({
  variant = "icon",
}: Readonly<{
  variant?: "icon" | "text";
}>) {
  if (variant === "text") {
    return (
      <Link
        className="font-medium text-foreground text-sm transition-colors hover:text-foreground/70"
        href="/account"
        prefetch={false}
      >
        Account
      </Link>
    );
  }
  return (
    <Link
      aria-label="Account"
      className="inline-flex items-center justify-center transition-colors hover:text-foreground"
      href="/account"
      prefetch={false}
    >
      <UserIcon className="size-5" />
    </Link>
  );
}
