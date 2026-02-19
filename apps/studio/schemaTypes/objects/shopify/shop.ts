import { defineField } from "sanity";

export const shop = defineField({
  name: "shop",
  title: "Shop",
  type: "object",
  readOnly: true,
  description: "Shopify store domain information synced automatically",
  fields: [
    defineField({
      name: "domain",
      title: "Domain",
      type: "string",
      description: "Your Shopify store domain name",
    }),
  ],
});
