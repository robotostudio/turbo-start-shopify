import { Logger } from "@workspace/logger";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { PortableText, type PortableTextReactComponents } from "next-sanity";

import type { SanityRichTextProps } from "@/types";
import { parseChildrenToSlug } from "@/utils";
import { SanityImage } from "./sanity-image";

const logger = new Logger("RichText");

const components: Partial<PortableTextReactComponents> = {
  block: {
    h2: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h2
          className="scroll-m-24 mt-12 mb-4 border-b border-border pb-2 font-semibold text-2xl tracking-tight first:mt-0"
          id={slug}
        >
          {children}
        </h2>
      );
    },
    h3: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h3
          className="scroll-m-24 mt-8 mb-3 font-semibold text-xl tracking-tight"
          id={slug}
        >
          {children}
        </h3>
      );
    },
    h4: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h4
          className="scroll-m-24 mt-6 mb-2 font-semibold text-lg tracking-tight"
          id={slug}
        >
          {children}
        </h4>
      );
    },
    h5: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h5 className="scroll-m-24 mt-4 mb-2 font-semibold text-base" id={slug}>
          {children}
        </h5>
      );
    },
    h6: ({ children, value }) => {
      const slug = parseChildrenToSlug(value.children);
      return (
        <h6
          className="scroll-m-24 mt-4 mb-2 font-semibold text-sm uppercase tracking-wide text-muted-foreground"
          id={slug}
        >
          {children}
        </h6>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-primary/40 pl-5 italic text-muted-foreground leading-relaxed">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="leading-7 text-foreground/90 [&:not(:first-child)]:mt-5">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-5 ml-6 list-disc space-y-2 text-foreground/90 marker:text-muted-foreground">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-5 ml-6 list-decimal space-y-2 text-foreground/90">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-7">{children}</li>,
    number: ({ children }) => <li className="leading-7">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-foreground/80">{children}</em>
    ),
    code: ({ children }) => (
      <code className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground lg:whitespace-nowrap">
        {children}
      </code>
    ),
    customLink: ({ children, value }) => {
      if (!value.href || value.href === "#") {
        return (
          <span className="underline decoration-dotted underline-offset-4 text-muted-foreground">
            Link Broken
          </span>
        );
      }
      return (
        <Link
          aria-label={`Link to ${value?.href}`}
          className="font-medium text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors"
          href={value.href}
          prefetch={false}
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
          className="font-medium text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors"
          href={value.href}
          prefetch={false}
        >
          {children}
        </Link>
      );
    },
    linkExternal: ({ children, value }) => {
      if (!value?.href) return <span>{children}</span>;
      return (
        <Link
          className="font-medium text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors"
          href={value.href}
          prefetch={false}
          target={value.openInNewTab ? "_blank" : "_self"}
          rel={value.openInNewTab ? "noopener noreferrer" : undefined}
        >
          {children}
        </Link>
      );
    },
    linkEmail: ({ children, value }) => {
      if (!value?.href) return <span>{children}</span>;
      return (
        <a
          className="font-medium text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors"
          href={value.href}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.id) return null;
      return (
        <figure className="my-8">
          <SanityImage
            className="h-auto w-full rounded-lg shadow-sm"
            height={900}
            image={value}
            width={1600}
          />
          {value?.caption && (
            <figcaption className="mt-3 text-center text-sm text-muted-foreground leading-snug">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  hardBreak: () => <br />,
};

export function RichText<T extends SanityRichTextProps>({
  richText,
  className,
}: {
  richText?: T | null;
  className?: string;
}) {
  if (!richText) return null;

  return (
    <div className={cn("", className)}>
      <PortableText
        components={components}
        onMissingComponent={(_, { nodeType, type }) => {
          logger.warn(`Missing component: ${nodeType} for type: ${type}`);
        }}
        value={richText}
      />
    </div>
  );
}