/** Parses sort-related search params for collection pages. */
export function parseSortParams(sp: Record<string, string | string[]>): {
  sort: string;
  reverse: boolean;
} {
  const sort = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  const reverse = Array.isArray(sp.reverse) ? sp.reverse[0] : sp.reverse;
  return {
    sort: sort ?? "COLLECTION_DEFAULT",
    reverse: reverse === "true",
  };
}
