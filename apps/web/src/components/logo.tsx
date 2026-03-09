import Link from "next/link";

import type { Maybe } from "@/types";

type LogoProps = {
  text?: Maybe<string>;
};

export function Logo({ text }: LogoProps) {
  return (
    <Link className="flex gap-2 items-center" href="/">
      {text && (
        <h1 className="whitespace-nowrap text-xl tracking-wide uppercase font-(family-name:--font-geist-pixel-square)">
          {text}
        </h1>
      )}
    </Link>
  );
}
