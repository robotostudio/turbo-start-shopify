import Image from "next/image";
import Link from "next/link";

import type { Maybe, SanityImageProps } from "@/types";
import { SanityImage } from "./elements/sanity-image";

const LOGO_URL =
  "https://cdn.sanity.io/images/s6kuy1ts/production/68c438f68264717e93c7ba1e85f1d0c4b58b33c2-1200x621.svg";

type LogoProps = {
  src?: Maybe<string>;
  image?: Maybe<SanityImageProps>;
  alt?: Maybe<string>;
  text?: Maybe<string>;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function Logo({
  src,
  alt = "logo",
  image,
  text,
  width = 170,
  height = 40,
  priority = true,
}: LogoProps) {
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
