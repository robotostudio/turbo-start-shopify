import { Logger } from "@workspace/logger";
import { sanityFetch } from "@workspace/sanity/live";
import { querySitemapData } from "@workspace/sanity/query";
import sanitizeHtml from "sanitize-html";

import {
  escapeMarkdown,
  heading,
  joinSections,
  toMarkdownHref,
} from "@/lib/markdown/shared";
import { getSiteConfig } from "@/lib/seo";
import { getBaseUrl } from "@/utils";

const logger = new Logger("LlmsTxt");

const PUBLISHED = { perspective: "published", stega: false } as const;

/** How to reach the `.md` representation; the name comes from Settings. */
const FORMAT_NOTE =
  "Append .md to any URL, or send Accept: text/markdown, to get a structured Markdown view of a page.";

/** Longest note we emit after a link, in characters. */
const MAX_NOTE = 160;
/** Below this, a leading "sentence" is too terse to prefer over the whole text. */
const MIN_SENTENCE = 40;

/**
 * sanitize-html re-escapes exactly these four on the way out. Every other
 * entity is decoded by its parser and comes back as a real character, so this
 * map is the whole of the work — a general entity decoder would be dead code.
 */
const RE_ESCAPED = new Map([
  ["&amp;", "&"],
  ["&lt;", "<"],
  ["&gt;", ">"],
  ["&quot;", '"'],
]);

/** The `path`/`title`/`description` shape every `querySitemapData` key shares. */
type SitemapDoc = {
  path: string | null;
  title: string | null;
  description: string | null;
  /**
   * Shopify-backed keys only. Merchant HTML, used when the editor left the
   * plain `seo.description` empty. Kept separate from `description` so only
   * this one is ever handed to the tag stripper.
   */
  descriptionHtml?: string | null;
};

/** One file-list entry: a URL to name, and optionally to describe. */
type Entry = {
  path: string;
  title?: string | null;
  description?: string | null;
  /** The description is merchant HTML, so it needs tags stripped. */
  html?: boolean;
};

/** Collapses whitespace so a value can sit on one Markdown list line. */
function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Reduces merchant HTML to one line of plain text. A space goes in before every
 * tag first, or `</li><li>` welds the words on either side together
 * ("cottonPre-shrunk"); sanitize-html then drops all tags, and the contents of
 * `script`/`style` with them.
 */
function htmlToText(html: string): string {
  const stripped = sanitizeHtml(html.replace(/</g, " <"), {
    allowedTags: [],
    allowedAttributes: {},
  });
  const decoded = stripped.replace(
    /&(?:amp|lt|gt|quot);/g,
    (entity) => RE_ESCAPED.get(entity) ?? entity
  );
  return oneLine(decoded);
}

/** Clips at a word boundary and marks the cut with an ellipsis. */
function truncate(text: string): string {
  if (text.length <= MAX_NOTE) return text;
  const clipped = text.slice(0, MAX_NOTE);
  const lastSpace = clipped.lastIndexOf(" ");
  const cut = lastSpace > MIN_SENTENCE ? clipped.slice(0, lastSpace) : clipped;
  return `${cut.trimEnd()}…`;
}

/** A description reduced to one short plain-text line, or null if it is empty. */
function summarize(raw: string, isHtml: boolean): string | null {
  const text = isHtml ? htmlToText(raw) : oneLine(raw);
  if (!text) return null;
  // A first sentence is the better note only when it carries enough on its own.
  const [first = text] = text.split(/(?<=[.!?])\s/);
  return truncate(first.length >= MIN_SENTENCE ? first : text);
}

/**
 * Percent-encodes the two characters that would terminate a Markdown `(url)`.
 * `escapeMarkdown` deliberately leaves parens alone, so the URL side has to.
 */
function encodeLinkUrl(url: string): string {
  return encodeURI(url).replace(/\(/g, "%28").replace(/\)/g, "%29");
}

/** Readable stand-in when a document has no title: `/new-in` → `New in`. */
function nameFromPath(path: string): string {
  const slug = path.split("/").filter(Boolean).pop();
  if (!slug) return "Home";
  const words = slug.replace(/[-_]+/g, " ").trim();
  return `${words.charAt(0).toUpperCase()}${words.slice(1)}`;
}

/**
 * `- [Name](url): note` — the only list item shape the llms.txt spec accepts.
 * A bare URL parses to zero link nodes, which is what an SEO audit flagged.
 */
function listItem(base: string, entry: Entry): string {
  const name = oneLine(entry.title ?? "") || nameFromPath(entry.path);
  const url = encodeLinkUrl(`${base}${toMarkdownHref(entry.path)}`);
  const note = entry.description
    ? summarize(entry.description, entry.html === true)
    : null;
  const suffix = note ? `: ${escapeMarkdown(note)}` : "";
  return `- [${escapeMarkdown(name)}](${url})${suffix}`;
}

function section(base: string, title: string, entries: Entry[]): string | null {
  if (entries.length === 0) return null;
  const items = entries.map((entry) => listItem(base, entry)).join("\n");
  return `${heading(2, title)}\n${items}`;
}

/** Drops the pathless documents Sanity can return, then prefixes the rest. */
function entries(
  docs: readonly SitemapDoc[],
  { prefix = "" }: { prefix?: string } = {}
): Entry[] {
  return docs
    .filter((doc): doc is SitemapDoc & { path: string } => Boolean(doc.path))
    .map((doc) => {
      // The flag follows whichever source won, because only one of the two is
      // HTML. Flagging a whole section instead would send a plain description
      // reading "Sizes <XS> to <XL> in stock" through `htmlToText`, which reads
      // the sizes as unknown tags and returns "Sizes to in stock".
      const plain = oneLine(doc.description ?? "");
      return {
        path: `${prefix}${doc.path}`,
        title: doc.title,
        description: plain || doc.descriptionHtml || null,
        html: !plain && Boolean(doc.descriptionHtml),
      };
    });
}

export async function GET(): Promise<Response> {
  const base = getBaseUrl();

  // Deliberately unguarded. A rejected read has to surface as a 500 with no
  // `cache-control`, not as a 200 holding two links that `s-maxage=3600` then
  // pins to the CDN for an hour — the same window a crawler ingests it in.
  // Same reasoning as the collections index; an empty array stays a valid 200.
  //
  // `querySitemapData` already excludes `seoNoIndex` docs, so a page the site
  // asks crawlers to skip is no longer handed to model crawlers instead.
  const [siteConfig, result] = await Promise.all([
    getSiteConfig(base),
    sanityFetch({ query: querySitemapData, ...PUBLISHED }),
  ]);

  const docs = result.data;
  if (!docs) {
    logger.error("Documents for llms.txt came back empty");
    throw new Error("llms.txt document read failed");
  }

  const summary = siteConfig.description
    ? `${escapeMarkdown(oneLine(siteConfig.description))} ${FORMAT_NOTE}`
    : FORMAT_NOTE;

  const body = joinSections([
    heading(1, siteConfig.title),
    `> ${summary}`,
    section(base, "Pages", [
      { path: "/", title: "Home" },
      ...entries(docs.page),
    ]),
    section(base, "Collections", [
      // Has a markdown handler and sitemap entry but no `querySitemapData` key.
      { path: "/collections", title: "All collections" },
      ...entries(docs.collection, { prefix: "/collections/" }),
    ]),
    section(base, "Products", entries(docs.product, { prefix: "/products/" })),
    section(base, "Blog", [...entries(docs.blogIndex), ...entries(docs.blog)]),
    // `sitemap.xml` is not a Markdown twin, so it is spelled out rather than
    // run through `listItem`. `## Optional` is the spec's own convention for
    // links an agent may skip when it needs a shorter context.
    `${heading(2, "Optional")}\n- [Sitemap](${base}/sitemap.xml): every indexable URL, including the HTML pages behind these Markdown twins.`,
  ]);

  return new Response(`${body}\n`, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
