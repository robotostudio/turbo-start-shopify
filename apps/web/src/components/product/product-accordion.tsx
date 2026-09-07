"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion } from "motion/react";
import { type MouseEvent, useEffect, useRef, useState } from "react";

export type AccordionSection = {
  id: string;
  title: string;
  /** Sanitized HTML (isHtml) or plain text. */
  content: string;
  isHtml?: boolean;
};

type ProductAccordionProps = {
  sections: AccordionSection[];
  /** Which section starts expanded. */
  defaultOpenId?: string;
};

/**
 * The disclosure rows under a product's gallery: the description, then the
 * `custom.*` metafields the route resolved.
 *
 * Native <details> rather than the Radix accordion the rest of the app uses.
 * Radix keeps a closed panel out of the markup entirely and toggles through a
 * <button> that needs the bundle, so with JavaScript off a shopper saw the open
 * Description and four bare titles with nothing behind them. Here every body is
 * in the server HTML and the browser opens it; once hydrated, JS intercepts the
 * toggle and Motion height-animates the panel, the same progressive enhancement
 * as `sections/faq-entry.tsx`. Sections open independently, as those rows do.
 */
export function ProductAccordion({
  sections,
  defaultOpenId,
}: ProductAccordionProps) {
  if (sections.length === 0) return null;

  return (
    <div className="border-border border-t">
      {sections.map((section) => (
        <ProductAccordionEntry
          defaultOpen={section.id === defaultOpenId}
          key={section.id}
          section={section}
        />
      ))}
    </div>
  );
}

function ProductAccordionEntry({
  section,
  defaultOpen,
}: {
  section: AccordionSection;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  // Keeps the element in the [open] state until the close animation finishes,
  // so the body stays visible while it collapses.
  const [rendered, setRendered] = useState(defaultOpen);
  // Motion writes its resolved styles into the server HTML, and `initial={false}`
  // below makes it render the `animate` target. Ungated, a closed row would ship
  // `height: 0` next to `overflow-hidden`, and the native <details> would open
  // onto a clipped, empty body for anyone without JavaScript. The gate picks
  // the target and the class; it does not remove the target (see below).
  const [hydrated, setHydrated] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    // A visitor on a slow connection can open the row natively before the
    // bundle lands: the browser sets `open` on the <details> while React is not
    // running. Adopting that state here, in the same batch as the `hydrated`
    // flip, makes the motion target below `auto` for a row that is visibly
    // open — rather than the `0` React would otherwise still hold, which would
    // snap the body shut the moment scripting arrived.
    const nativeOpen = detailsRef.current?.open;
    if (nativeOpen !== undefined) {
      setOpen(nativeOpen);
      setRendered(nativeOpen);
    }
    setHydrated(true);
  }, []);

  const toggle = (event: MouseEvent) => {
    event.preventDefault(); // hand the toggle to JS/motion; native fallback still works with JS off
    const next = !open;
    setOpen(next);
    // Opening puts `[open]` on the element in the same commit as the `auto`
    // target below, so the <details> is already open when Motion measures the
    // panel for `auto` in that commit's effects. Whether a closed one still
    // lays its content out is up to the browser, and a panel that measures 0
    // there resolves `auto` to 0 and snaps open instead of tweening. Closing
    // leaves `rendered` to `onAnimationComplete`, so the body stays visible
    // while it collapses.
    if (next) setRendered(true);
  };

  return (
    <details
      className="group border-border border-b"
      open={rendered}
      ref={detailsRef}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: <summary> is natively interactive + keyboard-operable */}
      <summary
        className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-base marker:hidden [&::-webkit-details-marker]:hidden"
        onClick={toggle}
      >
        {section.title}
        {/* Plus morphs into a minus by rotating the vertical bar flat, rather
         * than swapping two icons with hidden/block. Transform-only, and
         * because it's a transition on a persistent node it interpolates from
         * the current angle when the row is mashed instead of snapping.
         *
         * Keyed off the real `[open]` attribute rather than React state: with
         * JS off the state never changes, and the glyph would sit on Plus while
         * the body was plainly open. The JS path holds `rendered` true through
         * the 200ms collapse, so on close the flip trails the click by that
         * much — imperceptible against a panel that is already animating. */}
        <span className="pointer-events-none relative flex size-4 shrink-0 items-center justify-center text-muted-foreground">
          <span className="absolute h-px w-3 bg-current" />
          {/* motion-reduce drops the transition, not the rotation: the bar
           * still flips flat so the plus/minus state stays legible, it just
           * gets there instantly instead of sweeping. */}
          <span className="absolute h-px w-3 rotate-90 bg-current transition-transform duration-200 ease-flow group-open:rotate-0 motion-reduce:transition-none" />
        </span>
      </summary>
      <motion.div
        /* `auto` until hydrated rather than no target at all. Motion only
         * starts tracking a property once `animate` names it, and it treats
         * the first target it sees as the initial render — which
         * `initial={false}` tells it not to animate. Gated on `hydrated`, the
         * `0` a closed row needed as its starting point was that first target,
         * so it was never applied and every panel's first open snapped to full
         * height instead of tweening. `auto` is also the honest server value:
         * the native <details> sizes an open body itself and hides a closed
         * one regardless. */
        animate={{ height: !hydrated || open ? "auto" : 0 }}
        className={cn(hydrated && "overflow-hidden")}
        initial={false}
        onAnimationComplete={() => {
          if (!open) setRendered(false);
        }}
        /* 200ms on the flow curve (`--ease-flow`), as the Radix version was:
         * expanding a panel is on-screen movement of an already-visible
         * container, not an entrance. */
        transition={{ duration: 0.2, ease: [0.65, 0, 0.35, 1] }}
      >
        <div className="pb-4 text-sm">
          {section.isHtml ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
              // Sanitised by the route with sanitize-html before it reaches this prop.
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          ) : (
            <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
              {section.content}
            </p>
          )}
        </div>
      </motion.div>
    </details>
  );
}
