import Link from "next/link";

import type { Maybe, SanityImageProps } from "@/types";

type LogoProps = {
  src?: Maybe<string>;
  image?: Maybe<SanityImageProps>;
  alt?: Maybe<string>;
  text?: Maybe<string>;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function Logo({ text }: LogoProps) {
  return (
    <Link className="flex gap-2 items-center" href="/">
      {/* removed it for now since the ui design didn't use it */}
      {/* <div className="relative h-5 w-5 shrink-0">
        {image ? (
          <SanityImage
            alt={alt ?? "logo"}
            className="h-full w-full object-contain dark:invert"
            decoding="sync"
            image={image}
            loading="eager"
          />
        ) : (
          <Image
            alt={alt ?? "logo"}
            className="h-full w-full object-contain dark:invert"
            decoding="sync"
            fill
            height={height}
            loading="eager"
            width={width}
            priority={priority}
            src={src ?? LOGO_URL}
          />
        )}
      </div> */}
      {text && (
        <h1 className="whitespace-nowrap text-xl tracking-wide uppercase font-(family-name:--font-geist-pixel-square)">
          {text}
        </h1>
      )}
    </Link>
  );
}
