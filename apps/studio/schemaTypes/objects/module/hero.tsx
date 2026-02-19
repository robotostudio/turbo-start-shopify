import { defineArrayMember, defineField } from "sanity";

export const hero = defineField({
  name: "hero",
  title: "Hero",
  type: "object",
  description:
    "A prominent banner section with title, description, link, and product or image content",
  fields: [
    defineField({
      name: "title",
      type: "text",
      description: "The main headline text for the hero banner",
      rows: 3,
    }),
    defineField({
      name: "description",
      type: "text",
      description: "Supporting text displayed below the headline",
      rows: 3,
    }),
    defineField({
      name: "link",
      type: "array",
      description: "Optional link to a page or external URL",
      of: [{ type: "linkInternal" }, { type: "linkExternal" }],
      validation: (Rule) => Rule.max(1),
    }),
    defineField({
      name: "content",
      type: "array",
      description: "The visual content — a product or image with hotspots",
      validation: (Rule) => Rule.max(1),
      of: [
        defineArrayMember({
          name: "productWithVariant",
          type: "productWithVariant",
        }),
        defineArrayMember({
          name: "imageWithProductHotspots",
          type: "imageWithProductHotspots",
        }),
      ],
    }),
  ],
});
