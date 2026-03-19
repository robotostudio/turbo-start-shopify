import { Badge } from "@workspace/ui/components/badge";

import type { PagebuilderType } from "@/types";
import { RichText } from "../elements/rich-text";
import { SanityIcon } from "../elements/sanity-icon";

type FeatureCardsWithIconProps = PagebuilderType<"featureCardsIcon">;

type FeatureCardProps = {
  card: NonNullable<FeatureCardsWithIconProps["cards"]>[number];
  index: number;
};

function FeatureCard({ card, index }: FeatureCardProps) {
  const { icon, title, richText } = card ?? {};
  return (
    <div className="group relative border border-border/60 bg-border/60 p-8 md:p-10">
      <span className="absolute top-6 right-8 font-mono text-muted-foreground text-xs tracking-widest md:right-10">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="mb-8 flex size-12 items-center justify-center rounded-full border border-border/80 bg-muted/50 transition-colors duration-300">
        <SanityIcon className="size-5!" icon={icon} />
      </span>

      <h3 className="mb-3 font-medium text-base tracking-tight md:text-lg">
        {title}
      </h3>
      <RichText
        className="text-muted-foreground text-sm leading-relaxed"
        richText={richText}
      />
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
    <section className="my-6 md:my-20" id="features">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-14 flex max-w-2xl flex-col items-start gap-4 md:mb-16">
          {eyebrow && <Badge variant="secondary">{eyebrow}</Badge>}
          <h2 className="font-semibold text-3xl tracking-tight md:text-4xl font-(family-name:--font-geist-pixel-square)">
            {title}
          </h2>
          <RichText
            className="text-muted-foreground text-base md:text-lg"
            richText={richText}
          />
        </div>
        <div className="grid  border gap-1   border-border/60 sm:grid-cols-2 lg:grid-cols-3">
          {cards?.map((card, index) => (
            <FeatureCard
              card={card}

              index={index}
              key={`FeatureCard-${card?._key}-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
