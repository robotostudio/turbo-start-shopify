import { TagIcon } from "@sanity/icons";
import pluralize from "pluralize-esm";
import { defineField } from "sanity";

export const productFeatures = defineField({
  name: "products",
  title: "Products",
  type: "object",
  icon: TagIcon,
  description:
    "A showcase of up to two products displayed as large cards or compact pills",
  fields: [
    defineField({
      name: "products",
      type: "array",
      description: "The products to showcase in this section",
      of: [{ type: "productReference" }],
      validation: (Rule) => Rule.required().max(2),
    }),
    defineField({
      name: "layout",
      type: "string",
      description: "Choose between large product cards or compact pills",
      initialValue: "card",
      options: {
        direction: "horizontal",
        layout: "radio",
        list: [
          {
            title: "Cards (large)",
            value: "card",
          },
          {
            title: "Pills (small)",
            value: "pill",
          },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      products: "products",
    },
    prepare({ products }) {
      return {
        subtitle: "Products",
        title:
          products.length > 0
            ? pluralize("product", products.length, true)
            : "No products",
        media: TagIcon,
      };
    },
  },
});
