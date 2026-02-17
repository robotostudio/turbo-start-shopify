import { SunIcon } from "@sanity/icons";
import { defineField } from "sanity";

export const option = defineField({
  title: "Product option",
  name: "option",
  type: "object",
  icon: SunIcon,
  readOnly: true,
  fields: [
    defineField({
      name: "name",
      type: "string",
    }),
    defineField({
      name: "values",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    select: {
      name: "name",
    },
    prepare({ name }) {
      return {
        title: name,
      };
    },
  },
});
