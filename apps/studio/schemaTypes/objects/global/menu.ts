import { defineField } from "sanity";

export const menu = defineField({
  name: "menu",
  title: "Menu",
  type: "object",
  description: "Site-wide navigation menu with configurable link structure",
  options: {
    collapsed: false,
    collapsible: true,
  },
  fields: [
    defineField({
      name: "links",
      type: "menuLinks",
      description: "The navigation links that make up this menu",
    }),
  ],
});
