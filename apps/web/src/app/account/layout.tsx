import { Skeleton } from "@workspace/ui/components/skeleton";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AccountNav } from "@/components/account/account-nav";
import { SignOutButton } from "@/components/account/sign-out-button";
import { isCustomerAccountEnabled } from "@/lib/customer-account/oauth";

function AccountSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

/**
 * Shell for every signed-in page. The pages read the session cookie, so they
 * stream inside the Suspense boundary while this shell stays static.
 */
export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isCustomerAccountEnabled()) notFound();

  return (
    <main className="site-container py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="font-semibold text-3xl">Account</h1>
        <SignOutButton />
      </div>
      <div className="grid gap-8 md:grid-cols-[12rem_1fr]">
        <AccountNav />
        <div className="min-w-0">
          <Suspense fallback={<AccountSkeleton />}>{children}</Suspense>
        </div>
      </div>
    </main>
  );
}
