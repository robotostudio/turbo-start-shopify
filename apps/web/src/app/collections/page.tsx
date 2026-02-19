import { sanityFetch } from "@workspace/sanity/live";
import { queryAllCollections } from "@workspace/sanity/query";

import { CollectionCard } from "@/components/collection/collection-card";
import { getSEOMetadata } from "@/lib/seo";

export function generateMetadata() {
  return getSEOMetadata({
    title: "Collections",
    description: "Browse all collections",
    slug: "/collections",
  });
}

export default async function CollectionsPage() {
  const { data: collections } = await sanityFetch({
    query: queryAllCollections,
  });

  if (!collections || collections.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-8 font-semibold text-3xl">Collections</h1>
        <p className="text-muted-foreground">No collections found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 font-semibold text-3xl">Collections</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {collections.map((collection) => (
          <CollectionCard
            description={collection.description}
            handle={collection.slug ?? ""}
            imageUrl={collection.imageUrl ?? null}
            key={collection._id}
            title={collection.title ?? "Untitled"}
          />
        ))}
      </div>
    </div>
  );
}
