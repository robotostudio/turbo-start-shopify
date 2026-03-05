/**
 * Sanity write client for server-side mutations.
 *
 * Uses SANITY_API_WRITE_TOKEN which requires write access to the dataset.
 * This client is server-only — never expose it to the browser.
 */

import { env as clientEnv } from "@workspace/env/client";
import { env as serverEnv } from "@workspace/env/server";
import { createClient } from "next-sanity";

export const writeClient = createClient({
  projectId: clientEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: clientEnv.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: clientEnv.NEXT_PUBLIC_SANITY_API_VERSION,
  token: serverEnv.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "raw",
});
