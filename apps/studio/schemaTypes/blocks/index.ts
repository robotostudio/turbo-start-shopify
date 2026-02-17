import { cta } from "@/schemaTypes/blocks/cta";
import { faqAccordion } from "@/schemaTypes/blocks/faq-accordion";
import { featureCardsIcon } from "@/schemaTypes/blocks/feature-cards-icon";
import { imageLinkCards } from "@/schemaTypes/blocks/image-link-cards";
import { subscribeNewsletter } from "@/schemaTypes/blocks/subscribe-newsletter";

export const pageBuilderBlocks = [
  // hero is registered via objects/module/hero — not duplicated here
  cta,
  featureCardsIcon,
  faqAccordion,
  imageLinkCards,
  subscribeNewsletter,
];
