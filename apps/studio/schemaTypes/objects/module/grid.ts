import { ThLargeIcon } from "@sanity/icons";
import pluralize from "pluralize-esm";
import { defineArrayMember, defineField } from "sanity";

export const grid = defineField({
  name: "grid",
  title: "Grid",
  type: "object",
  icon: ThLargeIcon,
  description: "A multi-column layout of content cards with images and text",
  fields: [
    defineField({
      name: "items",
      type: "array",
      description: "The content cards displayed in this grid layout",
      of: [defineArrayMember({ type: "gridItem" })],
    }),
  ],
  preview: {
    select: {
      items: "items",
    },
    prepare({ items }) {
      return {
        subtitle: "Grid",
        title:
          items?.length > 0
            ? pluralize("item", items.length, true)
            : "No items",
      };
    },
  },
});
