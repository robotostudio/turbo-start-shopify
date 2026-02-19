import { defineField } from "sanity";

export const imageCallToAction = defineField({
  name: "imageCallToAction",
  title: "Call to action",
  type: "object",
  description:
    "A title and link overlay for images that drives visitors to take action",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "The overlay text displayed on the image",
    }),
    defineField({
      name: "link",
      type: "array",
      description: "Where visitors go when they click this call to action",
      of: [{ type: "linkInternal" }, { type: "linkExternal" }],
      validation: (Rule) => Rule.max(1),
    }),
  ],
});
