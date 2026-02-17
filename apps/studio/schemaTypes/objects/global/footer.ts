import { defineField } from "sanity";

import { customRichText } from "@/schemaTypes/definitions/rich-text";

export const footer = defineField({
  name: "footerSettings",
  title: "Footer",
  type: "object",
  options: {
    collapsed: false,
    collapsible: true,
  },
  fields: [
    defineField({
      name: "links",
      type: "array",
      of: [{ type: "linkInternal" }, { type: "linkExternal" }],
    }),
    customRichText(["block"], { name: "text" }),
  ],
});
