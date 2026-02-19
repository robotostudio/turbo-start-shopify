import { defineField } from "sanity";

import { customRichText } from "@/schemaTypes/definitions/rich-text";

export const footer = defineField({
  name: "footerSettings",
  title: "Footer",
  type: "object",
  description:
    "Footer navigation links and rich text content displayed at the bottom of every page",
  options: {
    collapsed: false,
    collapsible: true,
  },
  fields: [
    defineField({
      name: "links",
      type: "array",
      description: "Navigation links displayed in the footer",
      of: [{ type: "linkInternal" }, { type: "linkExternal" }],
    }),
    customRichText(["block"], { name: "text" }),
  ],
});
