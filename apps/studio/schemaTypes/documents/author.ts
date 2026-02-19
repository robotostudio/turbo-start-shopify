import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { imageWithAltField } from "@/schemaTypes/common";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: UserIcon,
  description:
    "A content creator profile displayed alongside blog posts and articles",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Name",
      description: "The full name of the person who wrote the content",
      validation: (Rule) => Rule.required().error("Author name is required"),
    }),
    defineField({
      name: "position",
      type: "string",
      title: "Position",
      description:
        "The job title or role of this person, like 'Editor' or 'Writer'",
    }),
    imageWithAltField({
      title: "Image",
      description:
        "A photo of the author that will appear next to their articles",
    }),
    defineField({
      name: "bio",
      type: "text",
      title: "Bio",
      description:
        "A short paragraph about the author's background and expertise",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: "name",
      position: "position",
      media: "image",
    },
    prepare: ({ title, position, media }) => ({
      title: title || "Unnamed Author",
      subtitle: position || "No position",
      media,
    }),
  },
});
