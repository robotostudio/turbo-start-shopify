import { defineField } from "sanity";

export const menuLinks = defineField({
  name: "menuLinks",
  title: "Menu Links",
  type: "array",
  description:
    "Navigation menu items combining collection groups, internal pages, and external links",
  of: [
    defineField({
      name: "collectionGroup",
      type: "collectionGroup",
    }),
    defineField({
      name: "linkInternal",
      type: "linkInternal",
    }),
    defineField({
      name: "linkExternal",
      type: "linkExternal",
    }),
  ],
});
