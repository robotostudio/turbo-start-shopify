import { PackageIcon } from "@sanity/icons";
import { defineField } from "sanity";

export const collectionGroup = defineField({
  name: "collectionGroup",
  title: "Collection group",
  type: "object",
  icon: PackageIcon,
  description:
    "A named group of product collections for organizing navigation menus and category pages",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description:
        "The heading for this collection group displayed in navigation",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "collectionLinks",
      type: "collectionLinks",
      description: "Product collections to display in this group",
    }),
    defineField({
      name: "collectionProducts",
      type: "reference",
      description: "Products from this collection will be listed",
      weak: true,
      to: [{ type: "collection" }],
    }),
  ],
});
