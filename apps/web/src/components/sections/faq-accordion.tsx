import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import Link from "next/link";

import type { PagebuilderType } from "@/types";
import { RichText } from "../elements/rich-text";
import { FaqJsonLd } from "../json-ld";

type FaqAccordionProps = PagebuilderType<"faqAccordion">;

export function FaqAccordion({ title, faqs, link }: FaqAccordionProps) {
  return (
    <section className="my-8" id="faq">
      <FaqJsonLd faqs={faqs} />
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center">
          <h2 className="mb-10 font-normal font-(family-name:--font-geist-pixel-square) text-3xl md:text-4xl">
            {title}
          </h2>
        </div>
        <div className="mx-auto max-w-3xl">
          <Accordion
            className="flex w-full flex-col gap-3"
            collapsible
            type="single"
          >
            {faqs?.map((faq, index) => (
              <AccordionItem
                className="border-none rounded-sm bg-zinc-100 dark:bg-zinc-900"
                key={`AccordionItem-${faq?._id}-${index}`}
                value={faq?._id}
              >
                <AccordionTrigger className="px-5 py-4 text-sm hover:no-underline [&>svg]:hidden">
                  <span className="flex-1 text-left">{faq?.title}</span>
                  <span className="text-foreground [[data-state=open]>&]:hidden">
                    <Plus className="size-4" />
                  </span>
                  <span className="hidden text-foreground [[data-state=open]>&]:inline">
                    <Minus className="size-4" />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4 text-muted-foreground">
                  <RichText
                    className="text-sm md:text-base"
                    richText={faq?.richText ?? []}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {link?.href && (
            <div className="w-full py-6">
              <p className="mb-1 text-xs">{link?.title}</p>
              <Link
                className="flex items-center gap-2"
                href={link.href ?? "#"}
                target={link.openInNewTab ? "_blank" : "_self"}
              >
                <p className="font-medium text-[15px] leading-6">
                  {link?.description}
                </p>
                <span className="rounded-full border p-1">
                  <ArrowUpRight className="text-muted-foreground" size={16} />
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
