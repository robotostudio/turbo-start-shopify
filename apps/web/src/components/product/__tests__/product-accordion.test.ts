import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

/**
 * The accordion under a product's gallery was Radix, which keeps a closed panel
 * out of the markup entirely and toggles through a <button> that needs the
 * bundle. With JavaScript off a shopper saw the open Description and four bare
 * titles beneath it — "Details", "Fit & Sizing", "Materials & Composition",
 * "Shipping & Returns" — with nothing behind them and nothing happening on
 * click. The rows are native disclosures now, on the same footing as the FAQ
 * rows: every body in the server HTML, opened by the browser.
 *
 * Motion is stood in for by a div, as in the FAQ tests, so the assertions read
 * what the component hands it rather than any laid-out style.
 */

vi.mock("motion/react", () => ({
  motion: {
    div: ({
      animate,
      initial: _initial,
      transition: _transition,
      onAnimationComplete: _onAnimationComplete,
      ...rest
    }: Record<string, unknown>) =>
      createElement("div", {
        ...rest,
        "data-animate":
          animate === undefined ? undefined : JSON.stringify(animate),
      }),
  },
}));

const { ProductAccordion } = await import(
  "@/components/product/product-accordion"
);

type Section = Parameters<typeof ProductAccordion>[0]["sections"][number];

const SECTIONS: Section[] = [
  {
    id: "description",
    title: "Description",
    content: "<p>A café-racer jacket in lambskin.</p>",
    isHtml: true,
  },
  { id: "details", title: "Details", content: "Short stand collar." },
  {
    id: "materials",
    title: "Materials & Composition",
    content: "100% lambskin.",
  },
  {
    id: "shipping",
    title: "Shipping & Returns",
    content: "Free returns within 30 days.",
  },
];

const render = (sections: Section[] = SECTIONS) =>
  renderToStaticMarkup(
    createElement(ProductAccordion, { sections, defaultOpenId: "description" })
  );

describe("ProductAccordion server markup", () => {
  it("ships every section's body, the closed ones included", () => {
    const html = render();

    expect(html).toContain("Short stand collar.");
    expect(html).toContain("100% lambskin.");
    expect(html).toContain("Free returns within 30 days.");
  });

  it("renders each section as a native disclosure, only the default one open", () => {
    const tags = render().match(/<details[^>]*>/g) ?? [];

    expect(tags).toHaveLength(SECTIONS.length);
    // React serialises the boolean attribute as `open=""`.
    expect(tags.filter((tag) => /\sopen(?:=|\s|>)/.test(tag))).toHaveLength(1);
    expect(tags[0]).toMatch(/\sopen(?:=|\s|>)/);
  });

  it("ships no inline height:0 and no overflow clip on a closed row", () => {
    // The two traps the FAQ rows met: Motion serialising the closed target into
    // the server HTML, and `overflow-hidden` clipping a natively opened body.
    const html = render();

    expect(html).not.toContain("height:0");
    expect(html).not.toContain("overflow-hidden");
  });

  it("names the height target from the server render on", () => {
    // Motion only starts tracking a property once `animate` names it, and it
    // treats the first target it sees as the initial render — which
    // `initial={false}` tells it not to animate. A target that first appears
    // after hydration is therefore never applied, and every panel's first open
    // snapped to full height. `auto` is the honest server value: the native
    // <details> sizes an open body itself and hides a closed one regardless.
    const targets = render().match(/data-animate="[^"]*"/g) ?? [];

    expect(targets).toHaveLength(SECTIONS.length);
    for (const target of targets) {
      expect(target).toBe(
        'data-animate="{&quot;height&quot;:&quot;auto&quot;}"'
      );
    }
  });

  it("renders an HTML section as markup and a plain one escaped", () => {
    const html = render([
      SECTIONS[0] as Section,
      { id: "details", title: "Details", content: "Fit & finish <b>bold</b>" },
    ]);

    expect(html).toContain("<p>A café-racer jacket in lambskin.</p>");
    expect(html).toContain("Fit &amp; finish &lt;b&gt;bold&lt;/b&gt;");
  });

  it("renders nothing for a product with no sections", () => {
    expect(render([])).toBe("");
  });
});
