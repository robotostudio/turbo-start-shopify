import { defineField } from "sanity";

export const shopifyCollection = defineField({
  name: "shopifyCollection",
  title: "Shopify",
  type: "object",
  description:
    "Collection data synced from Shopify including title, description, rules, and status",
  options: {
    collapsed: false,
    collapsible: true,
  },
  readOnly: true,
  fieldsets: [
    {
      name: "status",
      title: "Status",
    },
  ],
  fields: [
    defineField({
      fieldset: "status",
      name: "createdAt",
      type: "string",
      description: "When this collection was first created in Shopify",
    }),
    defineField({
      fieldset: "status",
      name: "updatedAt",
      type: "string",
      description: "When this collection was last updated in Shopify",
    }),
    defineField({
      fieldset: "status",
      name: "isDeleted",
      title: "Deleted from Shopify?",
      type: "boolean",
      description: "Whether this collection has been removed from Shopify",
    }),
    defineField({
      name: "title",
      type: "string",
      description: "The collection name as it appears in Shopify",
    }),
    defineField({
      name: "id",
      title: "ID",
      type: "number",
      description: "Shopify Collection ID",
    }),
    defineField({
      name: "gid",
      title: "GID",
      type: "string",
      description: "Shopify Collection GID",
    }),
    defineField({
      name: "slug",
      description: "Shopify Collection handle",
      type: "slug",
    }),
    defineField({
      name: "descriptionHtml",
      title: "HTML Description",
      type: "text",
      rows: 5,
      description: "The collection description from Shopify in HTML format",
    }),
    defineField({
      name: "imageUrl",
      title: "Image URL",
      type: "string",
      description: "The URL of the collection image from Shopify",
    }),
    defineField({
      name: "rules",
      type: "array",
      description: "Include Shopify products that satisfy these conditions",
      of: [{ type: "collectionRule" }],
    }),
    defineField({
      name: "disjunctive",
      title: "Disjunctive rules?",
      description:
        "Require any condition if true, otherwise require all conditions",
      type: "boolean",
    }),
    defineField({
      name: "shop",
      type: "object",
      description: "The Shopify store this collection belongs to",
      fields: [defineField({ name: "domain", type: "string" })],
    }),
    defineField({
      name: "sortOrder",
      type: "string",
      description: "How products are sorted within this collection",
    }),
  ],
});
