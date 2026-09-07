// @vitest-environment jsdom
import { act, createElement, useLayoutEffect, useRef } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

/**
 * The JavaScript side of the product accordion, over jsdom. Three behaviours:
 *
 * A visitor on a slow connection can open a section natively before the bundle
 * lands. The FAQ rows met this: hydration flipped the motion target to the
 * `height: 0` React still held, and the visibly open body snapped shut. The
 * mount effect adopts the DOM's `open` instead.
 *
 * The agreed behaviour once hydrated: sections open independently, as the FAQ
 * rows do, rather than one at a time as the Radix version enforced.
 *
 * The open tween has to be measurable. Motion resolves an `auto` target by
 * measuring the panel in the commit's effects, and a panel still inside a
 * closed <details> may measure 0 — so `[open]` must land in the same commit
 * as the target, or the row snaps to full height instead of tweening.
 *
 * And a closing row has to stay `[open]` until the collapse finishes, or the
 * body vanishes the moment the click lands; `onAnimationComplete` is the only
 * thing that releases it.
 *
 * Motion is stood in for by a div that prints its `animate` prop, records per
 * commit whether its <details> was open at that moment, and keeps its
 * `onAnimationComplete` so a test can end an animation by hand; jsdom lays
 * nothing out, so those are the only observables.
 */

type Commit = { title?: string; animate: unknown; detailsOpen?: boolean };
const commits: Commit[] = [];
const completions = new Map<Element, () => void>();

vi.mock("motion/react", () => ({
  motion: {
    div: ({
      animate,
      initial: _initial,
      transition: _transition,
      onAnimationComplete,
      ...rest
    }: Record<string, unknown>) => {
      const ref = useRef<HTMLDivElement>(null);
      useLayoutEffect(() => {
        const details = ref.current?.closest("details");
        commits.push({
          title: details?.querySelector("summary")?.textContent ?? undefined,
          animate,
          detailsOpen: details?.open,
        });
        if (ref.current && typeof onAnimationComplete === "function") {
          completions.set(ref.current, onAnimationComplete as () => void);
        }
      });
      return createElement("div", {
        ...rest,
        ref,
        "data-animate":
          animate === undefined ? undefined : JSON.stringify(animate),
      });
    },
  },
}));

const { ProductAccordion } = await import(
  "@/components/product/product-accordion"
);

const element = () =>
  createElement(ProductAccordion, {
    defaultOpenId: "description",
    sections: [
      {
        id: "description",
        title: "Description",
        content: "<p>A café-racer jacket.</p>",
        isHtml: true,
      },
      { id: "details", title: "Details", content: "Short stand collar." },
      { id: "shipping", title: "Shipping & Returns", content: "Free returns." },
    ],
  });

let container: HTMLDivElement;

beforeAll(() => {
  // React's act() checks for this flag and otherwise warns on every update.
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  container?.remove();
  commits.length = 0;
  completions.clear();
});

/** Server-renders, lets `beforeBundle` play the visitor, then hydrates. */
async function hydrate(beforeBundle?: (rows: HTMLDetailsElement[]) => void) {
  container = document.createElement("div");
  container.innerHTML = renderToString(element());
  document.body.append(container);

  const rows = Array.from(container.querySelectorAll("details"));
  if (rows.length === 0) throw new Error("no <details> in the server markup");
  beforeBundle?.(rows);

  await act(async () => {
    hydrateRoot(container, element());
  });
  // Flushes the mount effect that reads the DOM and flips `hydrated`.
  await act(async () => {});

  return rows;
}

const motionTarget = (row: HTMLDetailsElement) =>
  JSON.parse(
    row.querySelector("[data-animate]")?.getAttribute("data-animate") ?? "null"
  );

describe("ProductAccordion hydrating over a natively opened section", () => {
  it("keeps the section open instead of animating it shut", async () => {
    // The click that happened before the bundle arrived, on a closed row.
    const rows = await hydrate(([, details]) => {
      if (details) details.open = true;
    });

    expect(rows[1]?.open).toBe(true);
    expect(motionTarget(rows[1] as HTMLDetailsElement)).toEqual({
      height: "auto",
    });
  });
});

describe("ProductAccordion once hydrated", () => {
  it("opens a second section without closing the first", async () => {
    const rows = await hydrate();

    await act(async () => {
      rows[1]?.querySelector("summary")?.click();
    });

    expect(rows[0]?.open).toBe(true);
    expect(rows[1]?.open).toBe(true);
    expect(motionTarget(rows[0] as HTMLDetailsElement)).toEqual({
      height: "auto",
    });
    expect(motionTarget(rows[1] as HTMLDetailsElement)).toEqual({
      height: "auto",
    });
  });

  it("has the disclosure open in the commit that first asks Motion for auto", async () => {
    const rows = await hydrate();
    commits.length = 0;

    await act(async () => {
      rows[1]?.querySelector("summary")?.click();
    });

    const firstAuto = commits.find(
      (commit) =>
        commit.title?.startsWith("Details") &&
        JSON.stringify(commit.animate) === JSON.stringify({ height: "auto" })
    );
    expect(firstAuto).toBeDefined();
    expect(firstAuto?.detailsOpen).toBe(true);
  });

  it("holds a closing section open until the collapse completes", async () => {
    const rows = await hydrate();
    const description = rows[0] as HTMLDetailsElement;
    const panel = description.querySelector("[data-animate]");
    if (!panel) throw new Error("no motion panel in the description row");

    await act(async () => {
      description.querySelector("summary")?.click();
    });

    // Collapsing: the target is 0, but `[open]` stays so the body is visible
    // while it shrinks.
    expect(motionTarget(description)).toEqual({ height: 0 });
    expect(description.open).toBe(true);

    await act(async () => {
      completions.get(panel)?.();
    });

    expect(description.open).toBe(false);
  });
});
