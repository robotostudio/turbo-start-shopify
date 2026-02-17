import { defineField } from "sanity";

export const menu = defineField({
  name: "menu",
  title: "Menu",
  type: "object",
  options: {
    collapsed: false,
    collapsible: true,
  },
  fields: [
    defineField({
      name: "links",
      type: "menuLinks",
    }),
  ],
});
