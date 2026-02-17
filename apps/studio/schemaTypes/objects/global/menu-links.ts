import { defineField } from "sanity";

export const menuLinks = defineField({
  name: "menuLinks",
  title: "Menu Links",
  type: "array",
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
