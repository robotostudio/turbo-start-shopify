import { defineArrayMember, defineType } from "sanity";

import { pageBuilderBlocks } from "@/schemaTypes/blocks/index";

export const pagebuilderBlockTypes = pageBuilderBlocks.map(({ name }) => ({
  type: name,
}));

export const pageBuilder = defineType({
  name: "pageBuilder",
  type: "array",
  description:
    "Drag-and-drop page sections that let you assemble pages from reusable content blocks",
  of: pagebuilderBlockTypes.map((block) => defineArrayMember(block)),
  options: {
    insertMenu: {
      views: [
        {
          name: "grid",
          previewImageUrl: (schemaTypeName) =>
            `/static/thumbnails/${schemaTypeName}.webp`,
        },
      ],
    },
  },
});
