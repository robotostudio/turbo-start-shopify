"use client";
import { Button } from "@workspace/ui/components/button";
import { LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { subscribeToNewsletter } from "@/app/actions";
import { newsletterInitialState } from "@/lib/newsletter/state";
import type { PagebuilderType } from "@/types";
import { RichText } from "../elements/rich-text";
import { SanityImage } from "../elements/sanity-image";

type SubscribeNewsletterProps = PagebuilderType<"subscribeNewsletter">;

function SubscribeNewsletterButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      aria-label={pending ? "Subscribing..." : "Subscribe to newsletter"}
      className="rounded-none bg-zinc-900 px-6 text-sm text-white hover:bg-zinc-800"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin"
          size={16}
          strokeWidth={2}
        />
      ) : (
        "Subscribe"
      )}
    </Button>
  );
}

export function SubscribeNewsletter({
  _key,
  title,
  subTitle,
  helperText,
  image,
}: SubscribeNewsletterProps) {
  // The action is bound through `useActionState` rather than a submit handler
  // so the form works unhydrated: Next posts it to the server action and the
  // result below is rendered by the server on the way back.
  const [state, formAction] = useActionState(
    subscribeToNewsletter,
    newsletterInitialState
  );
  const failed = state.status === "error";
  // Scoped to the block key — the same block can legitimately appear twice on
  // one page, and a fixed id would tie both labels to the first input.
  const inputId = `subscribe-newsletter-${_key}`;

  return (
    <section
      className="relative px-4 py-12 md:px-8 md:py-20 overflow-hidden lg:aspect-2/1 flex justify-center items-center bg-zinc-100 dark:bg-zinc-900"
      id="subscribe"
    >
      {/* Image: absolute, right half only */}
      {image && (
        <div className="absolute inset-y-0 right-0 hidden md:w-4/5 lg:w-2/3 md:block">
          <SanityImage
            className="absolute inset-0 h-full w-full rounded-none object-cover"
            image={image}
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-linear-to-r from-zinc-100 to-transparent to-50% dark:from-zinc-900" />
        </div>
      )}

      {/* Grid for layout spacing */}
      <div className="grid min-h-125 grid-cols-1 md:grid-cols-3 lg:grid-cols-2">
        {/* Left: Content */}
        <div className="relative z-10 md:col-span-2 lg:col-span-1 flex flex-col justify-center px-8 py-16 md:py-10 lg:px-16">
          <p className="mb-6 text-sm uppercase tracking-widest text-foreground/50">
            Newsletter
          </p>
          <h2
            className="mb-6 font-normal text-3xl text-foreground md:text-5xl"
            data-inline-edit
          >
            {title}
          </h2>
          {subTitle && (
            <RichText
              className="mb-8 text-sm md:text-base"
              richText={subTitle}
            />
          )}
          <form action={formAction} className="mb-4 max-w-md">
            <label className="sr-only" htmlFor={inputId}>
              Email address
            </label>
            <div className="flex items-stretch bg-white dark:bg-white">
              <input
                aria-invalid={failed}
                className="flex-1 rounded-none bg-transparent px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:text-zinc-900"
                defaultValue={failed ? (state.email ?? "") : ""}
                id={inputId}
                name="email"
                placeholder="Enter your email address"
                required
                type="email"
              />
              <div className="flex items-center pr-1.5">
                <SubscribeNewsletterButton />
              </div>
            </div>
            {/* Present from the first render, empty until there is something
                to say — a live region created together with its message is
                generally not announced. */}
            <output
              className={
                failed
                  ? "mt-2 block text-destructive text-xs"
                  : "mt-2 block text-muted-foreground text-xs"
              }
            >
              {state.status === "idle" ? "" : state.message}
            </output>
          </form>
          {helperText && (
            <RichText
              className="text-xs text-muted-foreground [&_a]:underline"
              richText={helperText}
            />
          )}
        </div>

        {/* Right: spacer */}
        <div className="hidden md:block" />
      </div>
    </section>
  );
}
