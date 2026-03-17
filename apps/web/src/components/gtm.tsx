import { GoogleTagManager as NextGTM } from "@next/third-parties/google";

import { env } from "@workspace/env/client";

export function GoogleTagManager() {
  const gtmId = env.NEXT_PUBLIC_GTM_ID;
  if (!gtmId) return null;

  return <NextGTM gtmId={gtmId} />;
}
