import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod/v4";

const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },

  server: {
    SANITY_API_READ_TOKEN: z.string().min(1),
    SANITY_API_WRITE_TOKEN: z.string().min(1),
    SHOPIFY_STORE_DOMAIN: z.string().min(1),
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().min(1),
    SHOPIFY_API_VERSION: z.string().default("2025-01"),
    /**
     * Customer accounts (sign-in, `/account`). Both are optional so the
     * starter builds without them; the feature switches on only when both
     * are set. The client id comes from the Headless channel's Customer
     * Account API settings (public client).
     */
    SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: z.string().min(1).optional(),
    /** Encrypts the customer session cookie. 32+ random characters. */
    CUSTOMER_SESSION_SECRET: z.string().min(32).optional(),
  },

  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },

  extends: [vercel()],
});

export { env };
