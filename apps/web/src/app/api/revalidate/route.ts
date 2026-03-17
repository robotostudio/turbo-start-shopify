import { env } from "@workspace/env/server";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

type SanityWebhookBody = {
  _type: string;
  slug?: { current?: string } | string;
};

const TAG_MAP: Record<string, string[]> = {
  page: ["pages"],
  homePage: ["pages", "home"],
  blog: ["blogs"],
  blogIndex: ["blogs"],
  product: ["products"],
  collection: ["collections"],
  settings: ["settings"],
  navbar: ["settings", "navigation"],
  footer: ["settings", "navigation"],
  redirect: ["redirects"],
  faq: ["faqs"],
  author: ["blogs"],
};

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json(
      { ok: false, message: "Revalidation not configured" },
      { status: 501 },
    );
  }

  if (secret !== env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json(
      { ok: false, message: "Invalid secret" },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as SanityWebhookBody;
    const tags = TAG_MAP[body._type] ?? [body._type];

    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 });
    }

    return NextResponse.json({ ok: true, revalidated: tags });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body" },
      { status: 400 },
    );
  }
}
