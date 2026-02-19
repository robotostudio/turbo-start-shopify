import { TagIcon } from "@sanity/icons";
import pluralize from "pluralize-esm";
import { defineField, defineType } from "sanity";

import ProductHiddenInput from "../../components/inputs/product-hidden";
import ShopifyDocumentStatus from "../../components/media/shopify-document-status";
import { customRichText } from "@/schemaTypes/definitions/rich-text";
import { GROUP, GROUPS } from "@/utils/constants";
import { getPriceRange } from "../../utils/getPriceRange";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: TagIcon,
  groups: GROUPS,
  description:
    "Shopify product with editorial content, synced via Shopify Connect",
  fields: [
    defineField({
      name: "hidden",
      type: "string",
      components: {
        field: ProductHiddenInput,
      },
      group: GROUPS.map((group) => group.name),
      hidden: ({ parent }) => {
        const isActive = parent?.store?.status === "active";
        const isDeleted = parent?.store?.isDeleted;
        return !parent?.store || (isActive && !isDeleted);
      },
    }),
    defineField({
      name: "titleProxy",
      title: "Title",
      type: "proxyString",
      description: "The product title synced from Shopify",
      options: { field: "store.title" },
    }),
    defineField({
      name: "slugProxy",
      title: "Slug",
      type: "proxyString",
      description: "The URL slug synced from Shopify",
      options: { field: "store.slug.current" },
    }),
    defineField({
      name: "colorTheme",
      type: "reference",
      description: "Choose a color theme to style this product page",
      to: [{ type: "colorTheme" }],
      group: GROUP.CONTENT,
    }),
    customRichText(
      [
        "block",
        "image",
        "accordion",
        "callout",
        "grid",
        "images",
        "imageWithProductHotspots",
        "instagram",
        "products",
      ],
      {
        name: "body",
        title: "Body",
        description: "Editorial content for this product",
        group: GROUP.CONTENT,
      }
    ),
    defineField({
      name: "store",
      type: "shopifyProduct",
      description: "Product data from Shopify (read-only)",
      group: GROUP.COMMERCE,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      description: "Search engine optimization settings for this product",
      group: GROUP.SEO,
    }),
  ],
  orderings: [
    {
      name: "titleAsc",
      title: "Title (A-Z)",
      by: [{ field: "store.title", direction: "asc" }],
    },
    {
      name: "titleDesc",
      title: "Title (Z-A)",
      by: [{ field: "store.title", direction: "desc" }],
    },
    {
      name: "priceDesc",
      title: "Price (Highest first)",
      by: [{ field: "store.priceRange.minVariantPrice", direction: "desc" }],
    },
    {
      name: "priceAsc",
      title: "Price (Lowest first)",
      by: [{ field: "store.priceRange.minVariantPrice", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      isDeleted: "store.isDeleted",
      options: "store.options",
      previewImageUrl: "store.previewImageUrl",
      priceRange: "store.priceRange",
      status: "store.status",
      title: "store.title",
      variants: "store.variants",
    },
    prepare(selection) {
      const {
        isDeleted,
        options,
        previewImageUrl,
        priceRange,
        status,
        title,
        variants,
      } = selection;

      const optionCount = options?.length;
      const variantCount = variants?.length;

      const description = [
        variantCount ? pluralize("variant", variantCount, true) : "No variants",
        optionCount ? pluralize("option", optionCount, true) : "No options",
      ];

      let subtitle = getPriceRange(priceRange);
      if (status !== "active") {
        subtitle = "(Unavailable in Shopify)";
      }
      if (isDeleted) {
        subtitle = "(Deleted from Shopify)";
      }

      return {
        description: description.join(" / "),
        subtitle,
        title,
        media: (
          <ShopifyDocumentStatus
            isActive={status === "active"}
            isDeleted={isDeleted}
            type="product"
            url={previewImageUrl}
            title={title}
          />
        ),
      };
    },
  },
});
