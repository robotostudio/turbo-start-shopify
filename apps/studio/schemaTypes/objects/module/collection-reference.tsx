import { PackageIcon } from "@sanity/icons";
import { defineField } from "sanity";

import ShopifyDocumentStatus from "../../../components/media/shopify-document-status";

export const collectionReference = defineField({
  name: "collectionReference",
  title: "Collection",
  type: "object",
  icon: PackageIcon,
  description:
    "A reference to a Shopify collection with optional background image display",
  fields: [
    defineField({
      name: "collection",
      type: "reference",
      description: "The Shopify collection to display",
      weak: true,
      to: [{ type: "collection" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "showBackground",
      type: "boolean",
      description: "Use Shopify collection image as background (if available)",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      collectionTitle: "collection.store.title",
      imageUrl: "collection.store.imageUrl",
      isDeleted: "collection.store.isDeleted",
    },
    prepare({ collectionTitle, imageUrl, isDeleted }) {
      return {
        media: (
          <ShopifyDocumentStatus
            isDeleted={isDeleted}
            type="collection"
            url={imageUrl}
            title={collectionTitle}
          />
        ),
        subtitle: "Collection",
        title: collectionTitle,
      };
    },
  },
});
