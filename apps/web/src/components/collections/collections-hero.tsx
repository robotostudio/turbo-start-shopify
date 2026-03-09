import type { QueryCollectionsIndexPageDataResult } from "@workspace/sanity/types";
import { Button } from "@workspace/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { SanityImage } from "@/components/elements/sanity-image";

type CollectionsHeroProps = {
  heroTitle: string | null;
  heroImage: NonNullable<QueryCollectionsIndexPageDataResult>["heroImage"];
  buttons: NonNullable<QueryCollectionsIndexPageDataResult>["buttons"];
};

export function CollectionsHero({
  heroTitle,
  heroImage,
  buttons,
}: CollectionsHeroProps) {
  if (!heroImage) {
    return null;
  }

  return (
    <section className="relative flex min-h-[50vh] lg:min-h-[60vh] items-end justify-center overflow-hidden ">
      <div className="absolute inset-0">
        <div className="relative h-full w-full">
          <SanityImage
            className="absolute inset-0 h-full w-full min-h-[50vh] lg:min-h-[60vh] rounded-none object-cover object-top"
            fetchPriority="high"
            image={heroImage}
            loading="eager"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-black/10" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 pb-10 pt-24 text-center text-white md:gap-8 ">
        {heroTitle ? (
          <h1 className="font-normal text-md md:text-xl font-(family-name:--font-geist-pixel-square) uppercase tracking-widest lg:text-2xl">
            {heroTitle}
          </h1>
        ) : null}
        {buttons?.map((button) =>
          button.href ? (
            <Button
              key={button._key}
              asChild
              className="rounded-none border border-white mt-10 lg:mt-26 bg-transparent text-white hover:bg-white hover:text-black"
              size="lg"
            >
              <Link
                href={button.href}
                target={button.openInNewTab ? "_blank" : "_self"}
              >
                {button.text}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          ) : null
        )}
      </div>
    </section>
  );
}
