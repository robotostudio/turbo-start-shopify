"use client";

import type { QueryPromoBannerDataResult } from "@workspace/sanity/types";
import Link from "next/link";

type PromoBannerProps = {
  data: QueryPromoBannerDataResult;
};

const separator = " \u2605 ";

export function PromoBanner({ data }: PromoBannerProps) {
  if (!data?.enabled || !data.text) return null;

  const text = data.text;

  return (
    <div
      aria-label={text}
      className="w-full overflow-hidden border-b bg-zinc-900 py-2.5 whitespace-nowrap dark:bg-zinc-100"
      role="marquee"
    >
      <div className="animate-marquee inline-flex">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            aria-hidden={i > 0}
            className=" font-(family-name:--font-geist-pixel-square) text-sm  tracking-widest text-white dark:text-black"
            key={i}
          >
            {data.href ? (
              <Link className="hover:opacity-80" href={data.href}>
                {text}
              </Link>
            ) : (
              text
            )}
            <span className="m-2 ">{separator}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
