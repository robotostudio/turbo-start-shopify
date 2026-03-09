import { Logger } from "@workspace/logger";
import { client } from "@workspace/sanity/client";
import { sanityFetch } from "@workspace/sanity/live";
import { queryBlogPaths, queryBlogSlugPageData } from "@workspace/sanity/query";
import { notFound } from "next/navigation";

import { BlogAuthor } from "@/components/blog-card";
import { RichText } from "@/components/elements/rich-text";
import { SanityImage } from "@/components/elements/sanity-image";
import { TableOfContent } from "@/components/elements/table-of-content";
import { ArticleJsonLd } from "@/components/json-ld";
import { getSEOMetadata } from "@/lib/seo";

const logger = new Logger("BlogSlug");

async function fetchBlogSlugPageData(slug: string) {
  return await sanityFetch({
    query: queryBlogSlugPageData,
    params: { slug: `/blog/${slug}` },
  });
}

async function fetchBlogPaths() {
  try {
    const slugs = await client.fetch(queryBlogPaths);

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return [];
    }

    const paths: { slug: string }[] = [];
    for (const slug of slugs) {
      if (!slug) continue;
      const [, , path] = slug.split("/");
      if (path) paths.push({ slug: path });
    }
    return paths;
  } catch (error) {
    logger.error("Error fetching blog paths", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await fetchBlogSlugPageData(slug);
  return getSEOMetadata(
    data
      ? {
          title: data?.title ?? data?.seoTitle ?? "",
          description: data?.description ?? data?.seoDescription ?? "",
          slug: data?.slug,
          contentId: data?._id,
          contentType: data?._type,
          pageType: "article",
        }
      : {}
  );
}

export async function generateStaticParams() {
  return await fetchBlogPaths();
}

export const dynamicParams = true;

export default async function BlogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await fetchBlogSlugPageData(slug);
  if (!data) return notFound();

  const { title, description, image, richText, authors, publishedAt } =
    data ?? {};

  return (
    <div className="container mx-auto px-4 md:px-6 py-16 max-w-7xl">
      <ArticleJsonLd article={data} />

      {/* Hero header — full width, centered */}
      <header className="mb-12 max-w-3xl mx-auto text-center">
        <h1 className="font-semibold text-4xl md:text-5xl leading-tight tracking-tight font-(family-name:--font-geist-pixel-square) mb-4">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          {description}
        </p>
        {(authors || publishedAt) && (
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <BlogAuthor author={authors} />
            {authors && publishedAt && (
              <span className="text-muted-foreground/40">&middot;</span>
            )}
            {publishedAt && (
              <time dateTime={publishedAt}>
                {new Date(publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
          </div>
        )}
      </header>

      {/* Hero image — full width */}
      {image && (
        <div className="mb-12  overflow-hidden">
          <SanityImage
            alt={title}
            className="h-auto w-full object-cover"
            height={900}
            image={image}
            loading="eager"
            width={1600}
          />
        </div>
      )}

      {/* Two-column: article body + sticky TOC sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] xl:grid-cols-[1fr_280px] gap-12 items-start">
        <main className="min-w-0">
          <RichText richText={richText} />
        </main>

        {/* Sticky TOC sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              On this page
            </p>
            <TableOfContent richText={richText ?? []} />
          </div>
        </aside>
      </div>
    </div>
  );
}