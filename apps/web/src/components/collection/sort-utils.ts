/** Parses sort-related search params for collection pages. */
export function parseSortParams(sp: Record<string, string>): {
  sort: string;
  reverse: boolean;
  after: string | null;
} {
  return {
    sort: sp.sort ?? "COLLECTION_DEFAULT",
    reverse: sp.reverse === "true",
    after: sp.after ?? null,
  };
}
