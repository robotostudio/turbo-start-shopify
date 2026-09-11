import { Badge } from "@workspace/ui/components/badge";

import type { PagebuilderType } from "@/types";
import { RichText } from "../elements/rich-text";
import { SanityIcon } from "../elements/sanity-icon";

type FeatureCardsWithIconProps = PagebuilderType<"featureCardsIcon">;

type FeatureCardProps = {
  card: NonNullable<FeatureCardsWithIconProps["cards"]>[number];
};

function FeatureCard({ card }: FeatureCardProps) {
  const { icon, title, richText } = card ?? {};
  return (
    <div className="border p-8 md:min-h-75">
      <span className="mb-9 flex w-fit items-center justify-center bg-zinc-100 p-3 drop-shadow-sm dark:bg-background">
        <SanityIcon className="size-12!" icon={icon} />
      </span>
      <div>
        <h3 className="mb-2 font-medium text-lg md:text-2xl" data-inline-edit>
          {title}
        </h3>
        <RichText
          className="text-balance font-normal text-black/90 text-sm leading-7 md:text-base dark:text-neutral-300"
          richText={richText}
        />
      </div>
    </div>
  );
}

export function FeatureCardsWithIcon({
  eyebrow,
  title,
  richText,
  cards,
}: FeatureCardsWithIconProps) {
  return (
    <section className="my-6 md:my-16" id="features">
      <div className="site-container">
        <div className="flex max-w-2xl flex-col items-start gap-4">
          {eyebrow && (
            <Badge data-inline-edit variant="secondary">
              {eyebrow}
            </Badge>
          )}
          <h2 className="font-semibold text-3xl md:text-5xl" data-inline-edit>
            {title}
          </h2>
          <RichText
            className="max-w-3xl text-balance text-base text-muted-foreground md:text-lg"
            richText={richText}
          />
        </div>
        <div className="mt-20 grid gap-8 lg:grid-cols-3">
          {cards?.map((card, index) => (
            <FeatureCard
              card={card}
              key={`FeatureCard-${card?._key}-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
