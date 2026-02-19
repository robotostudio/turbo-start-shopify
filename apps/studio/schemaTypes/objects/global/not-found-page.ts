import { defineField } from "sanity";

export const notFoundPage = defineField({
  name: "notFoundPage",
  title: "404 page",
  type: "object",
  description: "Content shown when visitors land on a page that does not exist",
  group: "notFoundPage",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "The heading visitors see when they reach a missing page",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      type: "text",
      description: "A brief message explaining the page was not found",
      rows: 2,
    }),
    defineField({
      name: "collection",
      type: "reference",
      description: "Collection products displayed on this page",
      weak: true,
      to: [
        {
          name: "collection",
          type: "collection",
        },
      ],
    }),
    defineField({
      name: "colorTheme",
      type: "reference",
      description: "Color theme applied to the 404 page",
      to: [{ type: "colorTheme" }],
    }),
  ],
});
