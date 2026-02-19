import { defineArrayMember, defineField } from "sanity";

export const shopifyProduct = defineField({
  name: "shopifyProduct",
  title: "Shopify",
  type: "object",
  description:
    "Product data synced from Shopify including title, pricing, variants, and status",
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
    {
      name: "organization",
      title: "Organization",
      options: {
        columns: 2,
      },
    },
    {
      name: "variants",
      title: "Variants",
      options: {
        collapsed: true,
        collapsible: true,
      },
    },
  ],
  fields: [
    defineField({
      fieldset: "status",
      name: "createdAt",
      type: "string",
      description: "When this product was first created in Shopify",
    }),
    defineField({
      fieldset: "status",
      name: "updatedAt",
      type: "string",
      description: "When this product was last updated in Shopify",
    }),
    defineField({
      fieldset: "status",
      name: "status",
      type: "string",
      description: "Current availability status of this product in Shopify",
      options: {
        layout: "dropdown",
        list: ["active", "archived", "draft"],
      },
    }),
    defineField({
      fieldset: "status",
      name: "isDeleted",
      title: "Deleted from Shopify?",
      type: "boolean",
      description: "Whether this product has been removed from Shopify",
    }),
    defineField({
      name: "title",
      type: "string",
      description: "Title displayed in both cart and checkout",
    }),
    defineField({
      name: "id",
      title: "ID",
      type: "number",
      description: "Shopify Product ID",
    }),
    defineField({
      name: "gid",
      title: "GID",
      type: "string",
      description: "Shopify Product GID",
    }),
    defineField({
      name: "slug",
      type: "slug",
      description: "Shopify Product handle",
    }),
    defineField({
      name: "descriptionHtml",
      title: "HTML Description",
      type: "text",
      rows: 5,
      description: "The product description from Shopify in HTML format",
    }),
    defineField({
      fieldset: "organization",
      name: "productType",
      type: "string",
      description: "The product category assigned in Shopify",
    }),
    defineField({
      fieldset: "organization",
      name: "vendor",
      type: "string",
      description: "The brand or manufacturer of this product",
    }),
    defineField({
      fieldset: "organization",
      name: "tags",
      type: "string",
      description: "Tags assigned to this product in Shopify for filtering",
    }),
    defineField({
      name: "priceRange",
      type: "priceRange",
      description: "The range of prices across all variants",
    }),
    defineField({
      name: "previewImageUrl",
      title: "Preview Image URL",
      type: "string",
      description: "Image displayed in both cart and checkout",
    }),
    defineField({
      name: "options",
      type: "array",
      of: [{ type: "option" }],
      description: "Product options like color, size, or material from Shopify",
    }),
    defineField({
      name: "shop",
      type: "object",
      description: "The Shopify store this product belongs to",
      fields: [defineField({ name: "domain", type: "string" })],
    }),
    defineField({
      fieldset: "variants",
      name: "variants",
      type: "array",
      description: "All available variants of this product from Shopify",
      of: [
        defineArrayMember({
          title: "Variant",
          type: "reference",
          weak: true,
          to: [{ type: "productVariant" }],
        }),
      ],
    }),
  ],
});
