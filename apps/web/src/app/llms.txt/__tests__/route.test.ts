import { describe, expect, it, vi } from "vitest";

/**
 * SEO crawlers and agents following llmstxt.org parse this file as Markdown,
 * so its shape is the contract: one H1, then file lists whose every item is a
 * real `- [name](url)` link. Emitting bare URLs — which this route did until an
 * audit caught it — yields bullets that parse to zero link nodes, so the file
 * reads as having no links at all while looking fine to a human.
 *
 * `environment: "node"` means there is no rendering here; the response body is
 * the whole surface, and asserting on its lines is the honest level.
 */

// The document read, hoisted so each case can pick its own resolve or reject.
const { readDocs } = vi.hoisted(() => ({ readDocs: vi.fn() }));

// Every mock below is here for the same reason: the module reaches
// `@workspace/env/*`, which validates with Zod at import time and has nothing
// to validate in the runner.
vi.mock("@workspace/sanity/live", () => ({
  sanityFetch: async () => ({ data: await readDocs() }),
}));
// Reached through `@/lib/markdown/shared`; the same stub the Markdown tests use.
vi.mock("@workspace/sanity/client", () => ({
  urlFor: () => ({ width: () => ({ url: () => "https://cdn.test/x" }) }),
}));
vi.mock("@/lib/seo", () => ({
  getSiteConfig: async () => ({
    title: "Demo Store",
    description: "A demo storefront.",
  }),
}));
vi.mock("@/utils", () => ({ getBaseUrl: () => "https://base.test" }));

const { GET } = await import("../route");

/**
 * `- [name](url)` with an optional `: note`. The label alternation allows the
 * backslash-escaped brackets `escapeMarkdown` emits, which a plain `[^\]]+`
 * would reject.
 */
const LINK_ITEM =
  /^- \[(?:[^[\]\\]|\\.)+\]\(https:\/\/base\.test\/\S*\)(?:: .+)?$/;

function fixture(overrides: Record<string, unknown> = {}) {
  return {
    page: [
      { path: "/about", title: "About", description: "Who we are." },
      { path: "/contact", title: "Contact", description: null },
    ],
    blog: [{ path: "/blog/hello", title: "Hello", description: null }],
    blogIndex: [{ path: "/blog", title: "Blog", description: null }],
    product: [],
    collection: [],
    // Shopify keys carry both description sources; `seo.description` is plain
    // text and `descriptionHtml` is merchant HTML.
    ...overrides,
  };
}

async function bodyOf(): Promise<string> {
  const response = await GET();
  return response.text();
}

describe("llms.txt route", () => {
  it("emits exactly one H1, as the first line", async () => {
    readDocs.mockResolvedValue(fixture());

    const lines = (await bodyOf()).split("\n");

    expect(lines.filter((line) => line.startsWith("# "))).toHaveLength(1);
    expect(lines[0]).toBe("# Demo Store");
  });

  it("emits every list item as a Markdown link, never a bare URL", async () => {
    readDocs.mockResolvedValue(
      fixture({
        collection: [
          {
            path: "tees",
            title: "Tees",
            description: null,
            descriptionHtml: "<p>Cotton.</p>",
          },
        ],
        product: [
          {
            path: "a",
            title: "A",
            description: null,
            descriptionHtml: "<p>Soft.</p>",
          },
        ],
      })
    );

    const items = (await bodyOf())
      .split("\n")
      .filter((line) => line.startsWith("- "));

    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item).toMatch(LINK_ITEM);
    }
  });

  it("escapes brackets in a title so the link label cannot close early", async () => {
    readDocs.mockResolvedValue(
      fixture({
        product: [
          { path: "sale", title: "Sale [50%] _now_", description: null },
        ],
      })
    );

    expect(await bodyOf()).toContain(
      "- [Sale \\[50%\\] \\_now\\_](https://base.test/products/sale.md)"
    );
  });

  it("reduces merchant HTML to one plain-text line", async () => {
    readDocs.mockResolvedValue(
      fixture({
        product: [
          {
            path: "tee",
            title: "Tee",
            // The list is the discriminating part: without a space inserted
            // before each tag, `</p><ul><li>` welds "strong." to "100%".
            description: null,
            descriptionHtml:
              "<p>Soft &amp; strong.</p><ul><li>100% cotton</li></ul>",
          },
        ],
      })
    );

    expect(await bodyOf()).toContain(
      "- [Tee](https://base.test/products/tee.md): Soft & strong. 100% cotton"
    );
  });

  it("leaves a plain seo.description alone rather than stripping tags from it", async () => {
    // The regression eve caught: flagging the whole section as HTML sent plain
    // editor text through sanitize-html, and "Sizes <XS> to <XL> in stock" came
    // back as "Sizes to in stock" because the sizes parse as unknown tags.
    readDocs.mockResolvedValue(
      fixture({
        product: [
          {
            path: "tee",
            title: "Tee",
            description: "Sizes <XS> to <XL> in stock",
            descriptionHtml: "<p>ignored, the plain one wins</p>",
          },
        ],
      })
    );

    const body = await bodyOf();

    expect(body).toContain("Sizes \\<XS\\> to \\<XL\\> in stock");
    expect(body).not.toContain("Sizes to in stock");
  });

  it("falls back to merchant HTML only when there is no plain description", async () => {
    readDocs.mockResolvedValue(
      fixture({
        product: [
          {
            path: "tee",
            title: "Tee",
            description: null,
            descriptionHtml:
              "<p>Soft &amp; strong.</p><ul><li>100% cotton</li></ul>",
          },
        ],
      })
    );

    expect(await bodyOf()).toContain(
      "- [Tee](https://base.test/products/tee.md): Soft & strong. 100% cotton"
    );
  });

  it("omits a section that has no entries", async () => {
    // Pages, Collections and Blog always carry their synthesized index entry,
    // so Products is the only section an empty read can actually drop.
    readDocs.mockResolvedValue(fixture());

    const body = await bodyOf();

    expect(body).not.toContain("## Products");
    expect(body).toContain("## Pages");
  });

  it("throws rather than serving a degraded file the CDN would cache", async () => {
    readDocs.mockResolvedValue(null);

    await expect(GET()).rejects.toThrow(/read failed/i);
  });

  it("propagates a failed read", async () => {
    readDocs.mockRejectedValue(new Error("sanity 503"));

    await expect(GET()).rejects.toThrow(/sanity 503/);
  });
});
