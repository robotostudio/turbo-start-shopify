import "@workspace/env/client";
import "@workspace/env/server";

import { env } from "@workspace/env/client";
import { client } from "@workspace/sanity/client";
import { queryRedirects } from "@workspace/sanity/query";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  // Customer sign-in needs an HTTPS callback, so local testing runs through a
  // tunnel set as NEXT_PUBLIC_SITE_URL. Without this, Next's dev server blocks
  // its own assets when the page is loaded from the tunnel's host.
  allowedDevOrigins: env.NEXT_PUBLIC_SITE_URL
    ? [new URL(env.NEXT_PUBLIC_SITE_URL).hostname]
    : [],
  reactCompiler: true,
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    inlineCss: true,
    turbopackRustReactCompiler: true,
  },
  logging: {
    fetches: {},
  },
  images: {
    // Skip optimization in dev to avoid optimizer fetch timeouts on large
    // Shopify masters; Vercel optimizes normally in production.
    unoptimized: process.env.NODE_ENV === "development",
    minimumCacheTTL: 31_536_000,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560, 3840],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: `/images/${env.NEXT_PUBLIC_SANITY_PROJECT_ID}/**`,
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
  async headers() {
    // `frame-ancestors` names the Studio because Presentation iframes this site.
    // No `script-src`: the inline JSON-LD and Next bootstrap need nonces first.
    const csp = [
      "base-uri 'self'",
      // Sign-out is a POST that redirects to Shopify's end-session endpoint,
      // and Chrome applies form-action to the redirect target too.
      "form-action 'self' https://shopify.com",
      "object-src 'none'",
      `frame-ancestors 'self' ${env.NEXT_PUBLIC_SANITY_STUDIO_URL} https://*.sanity.studio`,
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Skipped in dev: HSTS on `localhost` pins every local project to
          // https for two years.
          ...(process.env.NODE_ENV === "development"
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]),
        ],
      },
    ];
  },
  async redirects() {
    const redirects = await client.fetch(queryRedirects);
    return redirects.map((redirect) => ({
      source: redirect.source,
      destination: redirect.destination,
      permanent: redirect.permanent ?? false,
    }));
  },
};

export default nextConfig;
