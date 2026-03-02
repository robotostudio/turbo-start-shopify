import { ImageIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { buttonsField, imageWithAltField } from "@/schemaTypes/common";

export const collectionBanner = defineType({
  name: "collectionBanner",
  title: "Collection Banner",
  icon: ImageIcon,
  type: "object",
  description:
    "A full-width banner with background image, heading, and call-to-action buttons",
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      title: "Eyebrow",
      description: "Small text displayed above the heading",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "The main heading text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description: "Supporting text below the heading",
      rows: 3,
    }),
    imageWithAltField({
      description: "Background image for the banner",
    }),
    buttonsField,
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
    },
    prepare: ({ title, media }) => ({
      title: title || "Collection Banner",
      subtitle: "Collection Banner",
      media: media ?? ImageIcon,
    }),
  },
});
