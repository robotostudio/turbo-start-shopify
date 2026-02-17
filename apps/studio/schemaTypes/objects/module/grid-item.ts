import { defineField } from "sanity";

import { customRichText } from "@/schemaTypes/definitions/rich-text";
import blocksToText from "../../../utils/blocksToText";

export const gridItem = defineField({
  name: "gridItem",
  title: "Grid Item",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      type: "image",
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
