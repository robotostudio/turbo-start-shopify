import { SunIcon } from "@sanity/icons";
import { defineField } from "sanity";

export const option = defineField({
  title: "Product option",
  name: "option",
  type: "object",
  icon: SunIcon,
  readOnly: true,
  description: "Product option from Shopify such as color, size, or material",
  fields: [
    defineField({
      name: "name",
      type: "string",
      description: "The option name from Shopify, such as Color or Size",
    }),
    defineField({
      name: "values",
      type: "array",
      of: [{ type: "string" }],
      description: "The available values for this option from Shopify",
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
