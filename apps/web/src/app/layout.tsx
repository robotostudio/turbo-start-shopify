import "@workspace/ui/globals.css";

import { SanityLive } from "@workspace/sanity/live";
import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { Suspense } from "react";
import { preconnect, prefetchDNS } from "react-dom";

import { FooterServer, FooterSkeleton } from "@/components/footer";
import { CombinedJsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { PreviewBar } from "@/components/preview-bar";
import { PromoBanner } from "@/components/promo-banner";
import { Providers } from "@/components/providers";
import { getNavigationData } from "@/lib/navigation";

const fontSans = GeistSans;
const fontMono = GeistMono;
const fontPixel = GeistPixelSquare;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preconnect("https://cdn.sanity.io");
  prefetchDNS("https://cdn.sanity.io");
  const nav = await getNavigationData();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontPixel.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <PromoBanner data={nav.promoBannerData} />
            <Navbar
              navbarData={nav.navbarData}
              settingsData={nav.settingsData}
            />
            <div className="flex-1">{children}</div>
            <Suspense fallback={<FooterSkeleton />}>
              <FooterServer />
            </Suspense>
          </div>
          <SanityLive />
          <CombinedJsonLd includeOrganization includeWebsite />
          {(await draftMode()).isEnabled && (
            <>
              <PreviewBar />
              <VisualEditing />
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
