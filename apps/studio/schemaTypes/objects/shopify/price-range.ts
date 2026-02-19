import { defineField } from "sanity";

export const priceRange = defineField({
  name: "priceRange",
  title: "Price range",
  type: "object",
  description:
    "Minimum and maximum variant prices for a product synced from Shopify",
  options: {
    columns: 2,
  },
  fields: [
    defineField({
      name: "minVariantPrice",
      type: "number",
      description: "The lowest price among all variants of this product",
    }),
    defineField({
      name: "maxVariantPrice",
      type: "number",
      description: "The highest price among all variants of this product",
    }),
  ],
});
