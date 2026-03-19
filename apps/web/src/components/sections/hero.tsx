import { Badge } from "@workspace/ui/components/badge";

import type {
  SanityButtonProps,
  SanityImageProps,
  SanityRichTextProps,
} from "@/types";
import { RichText } from "../elements/rich-text";
import { SanityButtons } from "../elements/sanity-buttons";
import { SanityImage } from "../elements/sanity-image";

type HeroBlockProps = {
  _key: string;
  _type: "hero";
  badge?: string | null;
  title?: string | null;
  richText?: SanityRichTextProps | null;
  image?: SanityImageProps | null;
  buttons?: SanityButtonProps[] | null;
};

export function HeroBlock({
  title,
  buttons,
  badge,
  image,
  richText,
}: HeroBlockProps) {
  return (
    <section className="mt-4 md:my-16" id="hero">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="grid h-full grid-rows-[auto_1fr_auto] items-center justify-items-center gap-4 text-center lg:items-start lg:justify-items-start lg:text-left">
            {badge && <Badge variant="secondary">{badge}</Badge>}
            <div className="grid gap-4">
              <h1 className="text-balance font-semibold text-4xl lg:text-6xl font-(family-name:--font-geist-pixel-square)">
                {title}
              </h1>
              <RichText
                className="font-normal text-base md:text-lg"
                richText={richText}
              />
            </div>
            <SanityButtons
              buttonClassName="w-full sm:w-auto"
              buttons={buttons ?? null}
              className="mb-8 grid w-full gap-2 sm:w-fit sm:grid-flow-col lg:justify-start"
            />
          </div>

          {image && (
            <div className="h-96 w-full">
              <SanityImage
                className="max-h-96 w-full rounded-none object-cover"
                fetchPriority="high"
                height={800}
                image={image}
                loading="eager"
                width={800}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
