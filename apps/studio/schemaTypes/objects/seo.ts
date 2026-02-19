import { defineField } from "sanity";

export const seo = defineField({
  name: "seo",
  title: "SEO",
  type: "object",
  description:
    "Search engine optimization fields to control how this content appears in Google and social media",
  group: "seo",
  options: {
    collapsed: false,
    collapsible: true,
  },
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "Page title shown in search engine results and browser tabs",
      validation: (Rule) =>
        Rule.max(50).warning(
          "Longer titles may be truncated by search engines"
        ),
    }),
    defineField({
      name: "description",
      type: "text",
      description:
        "Short summary shown below the title in search engine results",
      rows: 2,
      validation: (Rule) =>
        Rule.max(150).warning(
          "Longer descriptions may be truncated by search engines"
        ),
    }),
    defineField({
      name: "image",
      type: "image",
      description:
        "Preview image displayed when this page is shared on social media",
    }),
  ],
});
