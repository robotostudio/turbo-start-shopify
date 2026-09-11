import "@workspace/ui/globals.css";

import { SanityLive } from "@workspace/sanity/live";
import { Toaster } from "@workspace/ui/components/sonner";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { cookies, draftMode } from "next/headers";
import { resolvePerspectiveFromCookies } from "next-sanity/live";
import { preconnect, prefetchDNS } from "react-dom";

import { CartToasts } from "@/components/cart/cart-toasts";
import { Footer } from "@/components/footer";
import { CombinedJsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { PreviewBar } from "@/components/preview-bar";
import { PromoBanner } from "@/components/promo-banner";
import { Providers } from "@/components/providers";
import { VisualEditingLayer } from "@/components/visual-editing-layer";
import { getLayoutData } from "@/lib/navigation";
import { getSEOMetadata, SITE_LANG } from "@/lib/seo";

/** Fallback for routes that export no `generateMetadata` of their own. */
export async function generateMetadata() {
  const metadata = await getSEOMetadata();

  // `not-found.tsx` and `error.tsx` inherit this, and the default slug is "/" —
  // leaving the canonical on has every unmatched URL claim to be the home page.
  // `og:url` is the same claim in OpenGraph form, so it goes too.
  return {
    ...metadata,
    alternates: undefined,
    openGraph: { ...metadata.openGraph, url: undefined },
  };
}

const fontSans = GeistSans;
const fontMono = GeistMono;

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  preconnect("https://cdn.sanity.io");
  prefetchDNS("https://cdn.sanity.io");
  const layoutData = await getLayoutData();
  const isDraftMode = (await draftMode()).isEnabled;
  // The perspective `sanityFetch` renders in draft mode. Cookies are read only
  // then, so a visitor's request stays static.
  const inlineEditing =
    isDraftMode &&
    (await resolvePerspectiveFromCookies({ cookies: await cookies() })) ===
      "drafts";
  return (
    <html lang={SITE_LANG} suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>
          <a
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-[3px] focus:ring-ring/50"
            href="#main-content"
          >
            Skip to content
          </a>
          <div className="flex min-h-screen flex-col">
            <PromoBanner data={layoutData.promoBannerData} />
            <Navbar
              navbarData={layoutData.navbarData}
              settingsData={layoutData.settingsData}
            />
            <div className="flex-1" id="main-content" tabIndex={-1}>
              {children}
            </div>
            {/* Deliberately not wrapped in Suspense. A boundary here streams
             * the resolved footer into a trailing `<div hidden>` and swaps it
             * in with an inline script, so with JavaScript off every page on
             * the site ended in a permanent skeleton. Blocking on it puts the
             * real footer in the initial HTML instead — and its data rides
             * along in the single `getLayoutData()` round trip above, so it
             * adds no round trip of its own. */}
            <Footer
              data={layoutData.footerData}
              settingsData={layoutData.settingsData}
            />
          </div>
          {modal}
          <CartToasts />
          <Toaster position="bottom-right" richColors />
          <SanityLive />
          <CombinedJsonLd includeOrganization includeWebsite />
          {isDraftMode && (
            <>
              <PreviewBar />
              <VisualEditingLayer inlineEditing={inlineEditing} />
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
