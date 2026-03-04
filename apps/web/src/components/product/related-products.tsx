import { sanityFetch } from "@workspace/sanity/live";
import { queryRelatedProducts } from "@workspace/sanity/query";

import { ProductCard } from "./product-card";

type RelatedProductsProps = {
  productType: string | null;
  handle: string;
};

export async function RelatedProducts({
  productType,
  handle,
}: RelatedProductsProps) {
  if (!productType) return null;

  const { data: products } = await sanityFetch({
    query: queryRelatedProducts,
    params: { productType, handle },
  });

  if (!products || products.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 font-medium font-(family-name:--font-geist-pixel-square) text-3xl">
        Related Products
      </h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            imageUrl={product.store?.previewImageUrl ?? null}
            key={product._id}
            priceRange={{
              minVariantPrice: product.store?.priceRange?.minVariantPrice ?? 0,
              maxVariantPrice:
                product.store?.priceRange?.maxVariantPrice ??
                product.store?.priceRange?.minVariantPrice ??
                0,
            }}
            slug={product.slug ?? ""}
            title={product.store?.title ?? "Untitled"}
            vendor={product.store?.vendor}
          />
        ))}
      </div>
    </section>
  );
}
