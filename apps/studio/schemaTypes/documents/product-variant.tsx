import { CopyIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import ProductVariantHiddenInput from "../../components/inputs/product-variant-hidden";
import ShopifyDocumentStatus from "../../components/media/shopify-document-status";
import { GROUP, GROUPS } from "@/utils/constants";

export const productVariant = defineType({
  name: "productVariant",
  title: "Product variant",
  type: "document",
  icon: CopyIcon,
  groups: GROUPS,
  description:
    "Product variant synced from Shopify with inventory and pricing data",
  fields: [
    defineField({
      name: "hidden",
      type: "string",
      components: {
        field: ProductVariantHiddenInput,
      },
      hidden: ({ parent }) => {
        const isDeleted = parent?.store?.isDeleted;

        return !isDeleted;
      },
    }),
    defineField({
      title: "Title",
      name: "titleProxy",
      type: "proxyString",
      description: "The variant title synced from Shopify",
      options: { field: "store.title" },
    }),
    defineField({
      name: "store",
      title: "Shopify",
      description: "Variant data from Shopify (read-only)",
      type: "shopifyProductVariant",
      group: GROUP.COMMERCE,
    }),
  ],
  preview: {
    select: {
      isDeleted: "store.isDeleted",
      previewImageUrl: "store.previewImageUrl",
      sku: "store.sku",
      status: "store.status",
      title: "store.title",
    },
    prepare(selection) {
      const { isDeleted, previewImageUrl, sku, status, title } = selection;

      return {
        media: (
          <ShopifyDocumentStatus
            isActive={status === "active"}
            isDeleted={isDeleted}
            type="productVariant"
            url={previewImageUrl}
            title={title}
          />
        ),
        subtitle: sku,
        title,
      };
    },
  },
});
