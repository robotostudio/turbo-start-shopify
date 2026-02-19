import { client } from "@workspace/sanity/client";
import {
  queryCollectionPaths,
  queryProductPaths,
  querySitemapData,
} from "@workspace/sanity/query";
import type { QuerySitemapDataResult } from "@workspace/sanity/types";
import type { MetadataRoute } from "next";

import { getBaseUrl } from "@/utils";

type Page = QuerySitemapDataResult["slugPages"][number];

const baseUrl = getBaseUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ slugPages, blogPages }, productPaths, collectionPaths] =
    await Promise.all([
      client.fetch(querySitemapData),
      client.fetch(queryProductPaths),
      client.fetch(queryCollectionPaths),
    ]);

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...slugPages.map((page: Page) => ({
      url: `${baseUrl}${page.slug}`,
      lastModified: new Date(page.lastModified ?? new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...blogPages.map((page: Page) => ({
      url: `${baseUrl}${page.slug}`,
      lastModified: new Date(page.lastModified ?? new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...(productPaths ?? [])
      .filter((handle): handle is string => handle !== null)
      .map((handle) => ({
        url: `${baseUrl}/products/${handle}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...(collectionPaths ?? [])
      .filter((handle): handle is string => handle !== null)
      .map((handle) => ({
        url: `${baseUrl}/collections/${handle}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
  ];
}
