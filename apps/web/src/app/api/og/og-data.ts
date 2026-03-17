import { client } from "@workspace/sanity/client";
import {
  queryBlogPageOGData,
  queryCollectionOGData,
  queryGenericPageOGData,
  queryHomePageOGData,
  queryProductOGData,
  querySlugPageOGData,
} from "@workspace/sanity/query";

import { handleErrors } from "@/utils";

export async function getHomePageOGData(id: string) {
  return await handleErrors(client.fetch(queryHomePageOGData, { id }));
}

export async function getSlugPageOGData(id: string) {
  return await handleErrors(client.fetch(querySlugPageOGData, { id }));
}

export async function getBlogPageOGData(id: string) {
  return await handleErrors(client.fetch(queryBlogPageOGData, { id }));
}

export async function getGenericPageOGData(id: string) {
  return await handleErrors(client.fetch(queryGenericPageOGData, { id }));
}

export async function getProductOGData(id: string) {
  return await handleErrors(client.fetch(queryProductOGData, { id }));
}

export async function getCollectionOGData(id: string) {
  return await handleErrors(client.fetch(queryCollectionOGData, { id }));
}
