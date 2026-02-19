import { BlockElementIcon, ImageIcon } from "@sanity/icons";
import { defineArrayMember, defineField } from "sanity";

export const callToAction = defineField({
  name: "callToAction",
  title: "Call to action",
  type: "object",
  icon: BlockElementIcon,
  description:
    "Side-by-side layout pairing product or image content with a headline, text, and link",
  fieldsets: [
    {
      name: "copy",
      title: "Copy",
    },
  ],
  fields: [
    defineField({
      name: "layout",
      type: "string",
      description: "Choose whether the image appears on the left or right side",
      initialValue: "left",
      options: {
        direction: "horizontal",
        layout: "radio",
        list: [
          {
            title: "Content / Copy",
            value: "left",
          },
          {
            title: "Copy / Content",
            value: "right",
          },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      type: "string",
      description: "The headline text for this call to action",
      validation: (Rule) => Rule.required(),
      fieldset: "copy",
    }),
    defineField({
      name: "portableText",
      type: "text",
      description: "Supporting text displayed below the headline",
      rows: 2,
      fieldset: "copy",
    }),
    defineField({
      name: "link",
      type: "array",
      description: "Optional link to a page or external URL",
      of: [{ type: "linkInternal" }, { type: "linkExternal" }],
      validation: (Rule) => Rule.max(1),
      fieldset: "copy",
    }),
    defineField({
      name: "content",
      type: "array",
      description:
        "The visual content — an image or product — displayed alongside the copy",
      validation: (Rule) => Rule.required().max(1),
      of: [
        defineArrayMember({
          icon: ImageIcon,
          type: "image",
          options: { hotspot: true },
        }),
        defineArrayMember({
          name: "productWithVariant",
          type: "productWithVariant",
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        subtitle: "Call to action",
        title,
        media: BlockElementIcon,
      };
    },
  },
});
