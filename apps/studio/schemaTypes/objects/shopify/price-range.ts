import { defineField } from "sanity";

export const priceRange = defineField({
  name: "priceRange",
  title: "Price range",
  type: "object",
  options: {
    columns: 2,
  },
  fields: [
    defineField({
      name: "minVariantPrice",
      type: "number",
    }),
    defineField({
      name: "maxVariantPrice",
      type: "number",
    }),
  ],
});
