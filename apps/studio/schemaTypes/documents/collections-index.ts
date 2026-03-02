import { defineField, defineType } from "sanity";

import {
  buttonsField,
  documentSlugField,
  imageWithAltField,
} from "@/schemaTypes/common";
import { GROUP, GROUPS } from "@/utils/constants";
import { ogFields } from "@/utils/og-fields";
import { seoFields } from "@/utils/seo-fields";

export const collectionsIndex = defineType({
  name: "collectionsIndex",
  type: "document",
  title: "Collections Listing Page",
  description:
    "This is the main page that shows all your collections. You can customize the hero banner, heading, and description.",
  groups: GROUPS,
  fields: [
    defineField({
      name: "title",
      type: "string",
      description:
        "The main heading that will appear at the top of your collections listing page",
      group: GROUP.CONTENT,
    }),
    defineField({
      name: "subtitle",
      type: "text",
      rows: 2,
      description:
        "A short summary below the heading describing the collections page",
      group: GROUP.CONTENT,
    }),
    defineField({
      name: "heroTitle",
      type: "string",
      title: "Hero Title",
      description: "Large overlay text displayed on the hero banner image",
      group: GROUP.CONTENT,
    }),
    imageWithAltField({
      name: "heroImage",
      title: "Hero Image",
      description:
        "Full-bleed background image for the hero banner at the top of the page",
      group: GROUP.CONTENT,
    }),
    { ...buttonsField, group: GROUP.CONTENT },
    documentSlugField("collectionsIndex", {
      group: GROUP.CONTENT,
    }),
    ...seoFields.filter(
      (field) => !["seoNoIndex", "seoHideFromLists"].includes(field.name)
    ),
    ...ogFields,
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
      slug: "slug.current",
    },
    prepare: ({ title, subtitle, slug }) => ({
      title: title || "Untitled Collections Index",
      subtitle: subtitle || slug || "Collections Index",
    }),
  },
});
