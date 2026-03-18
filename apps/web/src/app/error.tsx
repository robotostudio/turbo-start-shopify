"use client";

import { useEffect } from "react";
import Link from "next/link";

import { captureException } from "@/lib/error-tracking";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center px-4">
      <p className="select-none font-(family-name:--font-geist-pixel-square) text-[10rem] leading-none text-foreground md:text-[14rem] lg:text-[24rem]">
        500
      </p>
      <div className="flex flex-col items-center gap-4">
        <h1 className="font-light text-3xl tracking-tight md:text-4xl">
          Something went wrong
        </h1>
        <p className="text-muted-foreground text-sm tracking-wide">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-4 flex gap-3">
          <button
            className="rounded-none border border-foreground bg-foreground px-6 py-2.5 text-sm uppercase text-background tracking-wider transition-colors hover:bg-transparent hover:text-foreground"
            onClick={reset}
            type="button"
          >
            Try Again
          </button>
          <Link
            className="rounded-none border border-foreground bg-transparent px-6 py-2.5 text-sm uppercase text-foreground tracking-wider transition-colors hover:bg-foreground hover:text-background"
            href="/"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
