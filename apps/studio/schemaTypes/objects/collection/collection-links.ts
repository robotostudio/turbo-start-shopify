import { defineArrayMember, defineField } from "sanity";

export const collectionLinks = defineField({
  name: "collectionLinks",
  title: "Collection links",
  type: "array",
  description:
    "A curated list of up to 4 product collections to feature in navigation or landing pages",
  validation: (Rule) => Rule.unique().max(4),
  of: [
    defineArrayMember({
      name: "collection",
      type: "reference",
      weak: true,
      to: [{ type: "collection" }],
    }),
  ],
});
