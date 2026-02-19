import { defineField } from "sanity";

export const inventory = defineField({
  name: "inventory",
  title: "Inventory",
  type: "object",
  description:
    "Stock availability and inventory tracking data synced from Shopify",
  options: {
    columns: 3,
  },
  fields: [
    defineField({
      name: "isAvailable",
      title: "Available",
      type: "boolean",
      description: "Whether this variant is currently in stock",
    }),
    defineField({
      name: "management",
      type: "string",
      description: "How inventory is tracked for this variant in Shopify",
    }),
    defineField({
      name: "policy",
      type: "string",
      description: "Whether customers can purchase when out of stock",
    }),
  ],
});
