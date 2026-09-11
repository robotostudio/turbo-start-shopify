import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { stegaClean } from "next-sanity";

import type {
  SanityButtonProps,
  SanityImageProps,
  SanityRichTextProps,
} from "@/types";
import { RichText } from "../elements/rich-text";
import { SanityButtons } from "../elements/sanity-buttons";
import { SanityImage } from "../elements/sanity-image";

type HeroContentPosition = "bottomLeft" | "bottomCenter" | "bottomRight";

type HeroBlockProps = {
  _key: string;
  _type: "hero";
  style?: "classic" | "fullBleed" | null;
  contentPosition?: HeroContentPosition | null;
  badge?: string | null;
  title?: string | null;
  richText?: SanityRichTextProps | null;
  image?: SanityImageProps | null;
  buttons?: SanityButtonProps[] | null;
};

/**
 * Maps the Sanity content-position choice to its full overlay treatment.
 *
 * `text` aligns the actual text lines; `selfX` (auto margins) positions the
 * block and the w-fit buttons, which text-align alone can't move.
 *
 * bottomCenter is the "campaign" lockup: large white copy centred over the
 * image, per the SS26 design. The left/right positions keep the original
 * small dark-on-light treatment.
 *
 * `mix-blend-plus-lighter` on the white copy matches the design and softens
 * the glyph edges additively against the photo; it needs the `isolate` on the
 * hero wrapper so the blend group can't escape past the image.
 */
const CONTENT_POSITION: Record<
  HeroContentPosition,
  {
    text: string;
    selfX: string;
    scrim: string;
    pad: string;
    block: string;
    lockup: string;
    title: string;
    link: string;
    richText: string;
  }
> = {
  bottomLeft: {
    text: "text-left",
    selfX: "mr-auto",
    scrim: "from-white/90 via-white/60 to-transparent lg:hidden",
    pad: "pb-8 md:pb-12",
    block: "max-w-md text-zinc-900",
    lockup: "text-2xl leading-tight",
    title: "",
    link: "",
    richText: "text-sm [&_p]:text-zinc-800!",
  },
  bottomCenter: {
    text: "text-center",
    selfX: "mx-auto",
    // Mobile-only dark scrim: the tighter crop there can put white copy over
    // light imagery, so it needs the backing. Desktop matches the design
    // exactly — no scrim, the art direction keeps the copy over dark pixels.
    scrim: "from-black/60 via-black/25 to-transparent lg:hidden",
    pad: "pb-8",
    block: "text-white",
    lockup: "",
    title:
      "font-semibold text-3xl leading-[1.16] tracking-tighter mix-blend-plus-lighter md:text-5xl",
    link: "text-base leading-6 tracking-[0.24px] mix-blend-plus-lighter",
    // RichText hard-codes text-foreground on headings, lists, strong, code and
    // links as well as paragraphs, so whiten every descendant - anything less
    // leaves bold or linked words near-black over the image.
    richText: "text-sm marker:text-white! [&_*]:text-white!",
  },
  bottomRight: {
    text: "text-right",
    selfX: "ml-auto",
    scrim: "from-white/90 via-white/60 to-transparent lg:hidden",
    pad: "pb-8 md:pb-12",
    block: "max-w-md text-zinc-900",
    lockup: "text-2xl leading-tight",
    title: "",
    link: "",
    richText: "text-sm [&_p]:text-zinc-800!",
  },
};

export function HeroBlock(props: HeroBlockProps) {
  return stegaClean(props.style) === "fullBleed" ? (
    <FullBleedHero {...props} />
  ) : (
    <ClassicHero {...props} />
  );
}

function ClassicHero({
  title,
  buttons,
  badge,
  image,
  richText,
}: HeroBlockProps) {
  return (
    <section className="mt-4 md:my-16" id="hero">
      <div className="site-container">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="grid h-full grid-rows-[auto_1fr_auto] items-center justify-items-center gap-4 text-center lg:items-start lg:justify-items-start lg:text-left">
            {badge && (
              <Badge data-inline-edit variant="secondary">
                {badge}
              </Badge>
            )}
            <div className="grid gap-4">
              {title && (
                <h1
                  className="text-balance font-bold text-4xl lg:text-6xl"
                  data-inline-edit
                >
                  {title}
                </h1>
              )}
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

function FullBleedHero({
  title,
  buttons,
  image,
  richText,
  contentPosition,
}: HeroBlockProps) {
  const pos =
    CONTENT_POSITION[stegaClean(contentPosition) ?? "bottomLeft"] ??
    CONTENT_POSITION.bottomLeft;
  return (
    <section className="relative" id="hero">
      <div className="card-surface relative isolate h-[92dvh] min-h-125 w-full overflow-hidden">
        {image && (
          <SanityImage
            className="absolute inset-0 h-full min-h-full w-full rounded-none object-cover"
            fetchPriority="high"
            image={image}
            loading="eager"
            sizes="100vw"
            width={2000}
          />
        )}

        {/* Bottom scrim so the promo text stays legible over any imagery */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t",
            pos.scrim
          )}
        />

        {/* Promo text overlaid along the bottom (position set in Sanity) */}
        <div className="absolute inset-x-0 bottom-0">
          <div className={cn("site-container", pos.pad)}>
            <div
              className={cn(
                "flex w-full flex-col gap-2 font-medium",
                pos.block,
                pos.text,
                pos.selfX
              )}
            >
              <div className={pos.lockup}>
                {title && (
                  <h1 className={pos.title} data-inline-edit>
                    {title}
                  </h1>
                )}
                {buttons?.map((button) =>
                  button.href ? (
                    <Link
                      className={cn(
                        "block w-fit hover:underline",
                        pos.link,
                        pos.selfX
                      )}
                      href={button.href}
                      key={button._key}
                      target={button.openInNewTab ? "_blank" : "_self"}
                    >
                      {button.text}
                    </Link>
                  ) : null
                )}
              </div>
              {richText && (
                <RichText className={pos.richText} richText={richText} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
