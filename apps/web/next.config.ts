import "@workspace/env/client";
import "@workspace/env/server";

import { env } from "@workspace/env/client";
import { client } from "@workspace/sanity/client";
import { queryRedirects } from "@workspace/sanity/query";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  reactCompiler: true,
  experimental: {
    inlineCss: true,
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
      "form-action 'self'",
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
