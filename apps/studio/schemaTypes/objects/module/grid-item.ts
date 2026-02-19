import { defineField } from "sanity";

import { customRichText } from "@/schemaTypes/definitions/rich-text";
import blocksToText from "../../../utils/blocksToText";

export const gridItem = defineField({
  name: "gridItem",
  title: "Grid Item",
  type: "object",
  description: "A single grid cell with title, image, and rich text content",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "The heading for this grid card",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      type: "image",
      description: "The image displayed in this grid card",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    customRichText(["block"], { name: "body" }),
  ],
  preview: {
    select: {
      body: "body",
      image: "image",
      title: "title",
    },
    prepare({ body, image, title }) {
      return {
        media: image,
        subtitle: body && blocksToText(body),
        title,
      };
    },
  },
});
