import { PhoneIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { buttonsField } from "@/schemaTypes/common";
import { customRichText } from "@/schemaTypes/definitions/rich-text";

export const cta = defineType({
  name: "cta",
  type: "object",
  icon: PhoneIcon,
  description:
    "Focused section that drives visitors toward a specific action with a headline, description, and buttons",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description:
        "The smaller text that sits above the title to provide context",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The large text that is the primary focus of the block",
    }),
    customRichText(["block"]),
    buttonsField,
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title || "Untitled",
      subtitle: "Call to Action",
      media: PhoneIcon,
    }),
  },
});
