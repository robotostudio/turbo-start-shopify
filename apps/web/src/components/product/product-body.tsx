import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { PortableText, type PortableTextReactComponents } from "next-sanity";
import Link from "next/link";

import type { QueryProductByHandleResult } from "@workspace/sanity/types";

import { SanityImage } from "@/components/elements/sanity-image";
import { ProductHotspotsImage } from "./product-hotspots";

type ProductBody = NonNullable<NonNullable<QueryProductByHandleResult>["body"]>;

const productBodyComponents: Partial<PortableTextReactComponents> = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-semibold text-2xl">{children}</h2>
    ),
    h3: ({ children }) => <h3 className="font-semibold text-xl">{children}</h3>,
    normal: ({ children }) => (
      <p className="text-muted-foreground leading-relaxed">{children}</p>
    ),
  },
  marks: {
    customLink: ({ children, value }) => {
      if (!value?.href || value.href === "#") return <span>{children}</span>;
      return (
        <Link
          className="underline decoration-dotted underline-offset-2"
          href={value.href}
          target={value.openInNewTab ? "_blank" : "_self"}
        >
          {children}
        </Link>
      );
    },
    linkInternal: ({ children, value }) => {
      if (!value?.href) return <span>{children}</span>;
      return (
        <Link
          className="underline decoration-dotted underline-offset-2"
          href={value.href}
        >
          {children}
        </Link>
      );
    },
    linkExternal: ({ children, value }) => {
      if (!value?.href) return <span>{children}</span>;
      return (
        <Link
          className="underline decoration-dotted underline-offset-2"
          href={value.href}
          rel={value.openInNewTab ? "noopener noreferrer" : undefined}
          target={value.openInNewTab ? "_blank" : "_self"}
        >
          {children}
        </Link>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.id) return null;
      return (
        <figure className="my-4">
          <SanityImage
            className="h-auto w-full"
            height={900}
            image={value}
            width={1600}
          />
        </figure>
      );
    },
    imageWithProductHotspots: ({ value }) => {
      if (!value?.image) return null;
      return (
        <div className="my-6">
          <ProductHotspotsImage
            image={value.image}
            productHotspots={value.productHotspots}
            showHotspots={value.showHotspots}
          />
        </div>
      );
    },
    accordion: ({ value }) => {
      if (!value?.groups?.length) return null;
      return (
        <Accordion className="my-4" collapsible type="single">
          {value.groups.map(
            (group: {
              _key: string;
              title: string;
              // biome-ignore lint/suspicious/noExplicitAny: Portable Text blocks from Sanity
              body: any[];
            }) => (
              <AccordionItem key={group._key} value={group._key}>
                <AccordionTrigger>{group.title}</AccordionTrigger>
                <AccordionContent>
                  {group.body && (
                    <div className="prose prose-sm dark:prose-invert">
                      <PortableText value={group.body} />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          )}
        </Accordion>
      );
    },
    callout: ({ value }) => {
      if (!value?.text) return null;
      return (
        <div className="my-4 border bg-muted/50 p-4">
          <p className="text-sm">{value.text}</p>
        </div>
      );
    },
  },
};

export function ProductBody({ body }: { body: ProductBody }) {
  if (!body || body.length === 0) return null;

  return (
    <div className="space-y-4">
      <PortableText components={productBodyComponents} value={body} />
    </div>
  );
}
