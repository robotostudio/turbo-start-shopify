"use client";

import { useEffect } from "react";

import { captureException } from "@/lib/error-tracking";

export default function GlobalError({
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
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <h1 className="mb-4 text-4xl font-light tracking-tight">
            Something went wrong
          </h1>
          <p className="mb-8 text-sm text-gray-500">
            A critical error occurred. Please try again.
          </p>
          <button
            className="border border-black bg-black px-6 py-2.5 text-sm uppercase text-white tracking-wider transition-colors hover:bg-transparent hover:text-black"
            onClick={reset}
            type="button"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
