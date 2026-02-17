import { defineField } from "sanity";

export const imageCallToAction = defineField({
  name: "imageCallToAction",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "link",
      type: "array",
      of: [{ type: "linkInternal" }, { type: "linkExternal" }],
      validation: (Rule) => Rule.max(1),
    }),
  ],
});
