import { defineField } from "sanity";

import { customRichText } from "@/schemaTypes/definitions/rich-text";
import blocksToText from "../../../utils/blocksToText";

export const accordionGroup = defineField({
  name: "accordionGroup",
  title: "Accordion Group",
  type: "object",
  icon: false,
  description:
    "A single expandable panel with a title and rich text body content",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "The heading text shown on this expandable panel",
      validation: (Rule) => Rule.required(),
    }),
    customRichText(["block"], { name: "body" }),
  ],
  preview: {
    select: {
      title: "title",
      body: "body",
    },
    prepare({ title, body }) {
      return {
        title,
        subtitle: body && blocksToText(body),
      };
    },
  },
});
