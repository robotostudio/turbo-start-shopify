import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { PagebuilderType } from "@/types";
import { FaqJsonLd } from "../json-ld";
import { FaqEntry } from "./faq-entry";

type FaqAccordionProps = PagebuilderType<"faqAccordion">;

export function FaqAccordion({ _key, title, faqs, link }: FaqAccordionProps) {
  return (
    <section className="py-12 md:py-20" id="faq">
      <FaqJsonLd faqs={faqs} id={`faq-json-ld-${_key}`} />
      <div className="site-container">
        <div className="flex flex-col items-center">
          <h2
            className="mb-10 font-normal text-3xl md:text-4xl"
            data-inline-edit
          >
            {title}
          </h2>
        </div>
        <div className="mx-auto max-w-3xl">
          <div className="flex w-full flex-col gap-3">
            {faqs?.map((faq, index) => (
              <FaqEntry
                key={`FaqEntry-${faq?._id}-${index}`}
                richText={faq?.richText}
                title={faq?.title}
                variant="card"
              />
            ))}
          </div>

          {link?.href && (
            <div className="w-full py-6">
              <p className="mb-1 text-xs" data-inline-edit>
                {link?.title}
              </p>
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
