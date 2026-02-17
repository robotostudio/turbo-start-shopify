import { defineField } from "sanity";

import { customRichText } from "@/schemaTypes/definitions/rich-text";
import blocksToText from "../../../utils/blocksToText";

export const accordionGroup = defineField({
  name: "accordionGroup",
  title: "Accordion Group",
  type: "object",
  icon: false,
  fields: [
    defineField({
      name: "title",
      type: "string",
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
