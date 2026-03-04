import { LayoutGrid } from "lucide-react";
import { defineField, defineType } from "sanity";

import { buttonsField } from "@/schemaTypes/common";

export const exploreCategories = defineType({
  name: "exploreCategories",
  title: "Explore Categories",
  icon: LayoutGrid,
  type: "object",
  description:
    "A grid of collection categories with a heading and optional call-to-action",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "The main heading text (e.g. 'Explore Categories')",
      validation: (Rule) => Rule.required(),
    }),
    buttonsField,
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title || "Explore Categories",
      subtitle: "Explore Categories",
      media: LayoutGrid,
    }),
  },
});
