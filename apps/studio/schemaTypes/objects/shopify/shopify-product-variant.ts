import { defineField } from "sanity";

export const shopifyProductVariant = defineField({
  name: "shopifyProductVariant",
  title: "Shopify",
  type: "object",
  description:
    "Variant data synced from Shopify including SKU, pricing, inventory, and options",
  options: {
    collapsed: false,
    collapsible: true,
  },
  fieldsets: [
    {
      name: "options",
      title: "Options",
      options: {
        columns: 3,
      },
    },
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
      description: "When this variant was first created in Shopify",
    }),
    defineField({
      fieldset: "status",
      name: "updatedAt",
      type: "string",
      description: "When this variant was last updated in Shopify",
    }),
    defineField({
      fieldset: "status",
      name: "status",
      type: "string",
      description: "Current availability status of this variant in Shopify",
      options: {
        layout: "dropdown",
        list: ["active", "archived", "draft"],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      fieldset: "status",
      name: "isDeleted",
      title: "Deleted from Shopify?",
      type: "boolean",
      description: "Whether this variant has been removed from Shopify",
    }),
    defineField({
      name: "title",
      type: "string",
      description: "The variant name as it appears in Shopify",
    }),
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
      description: "Unique stock keeping unit identifier for this variant",
    }),
    defineField({
      name: "id",
      title: "ID",
      type: "number",
      description: "Shopify Product Variant ID",
    }),
    defineField({
      name: "gid",
      title: "GID",
      type: "string",
      description: "Shopify Product Variant GID",
    }),
    defineField({
      name: "productId",
      title: "Product ID",
      type: "number",
      description: "The numeric ID of the parent product in Shopify",
    }),
    defineField({
      name: "productGid",
      title: "Product GID",
      type: "string",
      description: "The global ID of the parent product in Shopify",
    }),
    defineField({
      name: "price",
      type: "number",
      description: "The current selling price of this variant",
    }),
    defineField({
      name: "compareAtPrice",
      type: "number",
      description: "The original price shown as a strikethrough when on sale",
    }),
    defineField({
      name: "inventory",
      type: "inventory",
      description: "Stock and availability data for this variant",
      options: {
        columns: 3,
      },
    }),
    defineField({
      fieldset: "options",
      name: "option1",
      type: "string",
      description: "First product option value for this variant",
    }),
    defineField({
      fieldset: "options",
      name: "option2",
      type: "string",
      description: "Second product option value for this variant",
    }),
    defineField({
      fieldset: "options",
      name: "option3",
      type: "string",
      description: "Third product option value for this variant",
    }),
    // Preview Image URL
    defineField({
      name: "previewImageUrl",
      title: "Preview Image URL",
      type: "string",
      description: "Image displayed in both cart and checkout",
    }),
  ],
  readOnly: true,
});
