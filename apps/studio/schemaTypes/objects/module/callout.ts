import { BulbOutlineIcon } from "@sanity/icons";
import { defineField } from "sanity";

export const callout = defineField({
  name: "callout",
  title: "Callout",
  type: "object",
  icon: BulbOutlineIcon,
  description:
    "A short highlighted message with an optional link to draw attention to key information",
  fields: [
    defineField({
      name: "text",
      type: "text",
      description: "The short attention-grabbing message to display",
      rows: 2,
      validation: (Rule) => [
        Rule.required(),
        Rule.max(70).warning(
          `Callout length shouldn't be more than 70 characters.`
        ),
      ],
    }),
    defineField({
      name: "link",
      type: "array",
      description: "Optional link for visitors who want to learn more",
      of: [{ type: "linkInternal" }, { type: "linkExternal" }],
      validation: (Rule) => Rule.max(1),
    }),
  ],
  preview: {
    select: {
      text: "text",
    },
    prepare({ text }) {
      return {
        subtitle: "Callout",
        title: text,
        media: BulbOutlineIcon,
      };
    },
  },
});
