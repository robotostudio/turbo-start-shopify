import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { SanityButtonProps, SanityImageProps } from "@/types";
import { SanityImage } from "../elements/sanity-image";

type CollectionBannerProps = {
  _key: string;
  _type: "collectionBanner";
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  image?: SanityImageProps | null;
  buttons?: SanityButtonProps[] | null;
};

export function CollectionBanner({
  eyebrow,
  title,
  description,
  image,
  buttons,
}: CollectionBannerProps) {
  return (
    <section>
      <div className="relative overflow-hidden bg-neutral-900 text-white">
        {image && (
          <div className="absolute inset-0">
            <div className="relative h-full w-full">
              <SanityImage
                className="absolute inset-0 h-full w-full min-h-full rounded-none object-cover opacity-40"
                image={image}
                sizes="100vw"
              />
            </div>
            <div className="absolute inset-0 bg-black/10" />
          </div>
        )}

        <div className="relative flex flex-col items-center justify-center gap-3 px-6 py-24 text-center md:gap-6 md:py-36">
          {eyebrow && (
            <p className="mb-4 text-white text-md tracking-widest uppercase">
              {eyebrow}
            </p>
          )}
          <h2 className="max-w-lg text-3xl font-light font-(family-name:--font-geist-pixel-square) tracking-tight md:text-5xl">
            {title}
          </h2>
          {description && (
            <p className="max-w-md text-sm leading-relaxed text-white/70 md:text-base">
              {description}
            </p>
          )}

          {buttons?.map((button) =>
            button.href ? (
              <Link
                key={button._key}
                className="flex items-center gap-2 border border-white px-8 py-3 text-sm uppercase tracking-wider transition-colors hover:bg-white hover:text-neutral-900"
                href={button.href}
                target={button.openInNewTab ? "_blank" : "_self"}
              >
                {button.text ?? "Shop Collection"}
                <ArrowRight className="size-4" />
              </Link>
            ) : null
          )}
        </div>
      </div>
    </section>
  );
}
