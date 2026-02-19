import { ImageIcon } from "@sanity/icons";
import { defineField } from "sanity";

const VARIANTS = [
  { title: "Simple", value: undefined },
  { title: "Caption", value: "caption" },
  { title: "Call to action", value: "callToAction" },
  { title: "Product hotspots", value: "productHotspots" },
  { title: "Product tags", value: "productTags" },
];

export const imageFeature = defineField({
  name: "imageFeature",
  title: "Image Feature",
  type: "object",
  icon: ImageIcon,
  description:
    "A featured image with optional caption, hotspots, product tags, or call-to-action overlay",
  fields: [
    defineField({
      name: "image",
      type: "image",
      description: "The featured image to display",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "variant",
      type: "string",
      description: "Choose how extra content appears on this image",
      options: {
        direction: "horizontal",
        layout: "radio",
        list: VARIANTS,
      },
      initialValue: undefined,
    }),
    defineField({
      name: "caption",
      type: "text",
      description: "Descriptive text displayed below the image",
      rows: 2,
      hidden: ({ parent }) => parent.variant !== "caption",
    }),
    defineField({
      name: "callToAction",
      type: "imageCallToAction",
      description: "Title and link overlay shown on the image",
      hidden: ({ parent }) => parent.variant !== "callToAction",
    }),
    defineField({
      name: "productHotspots",
      title: "Hotspots",
      type: "productHotspots",
      description: "Interactive product markers placed on the image",
      hidden: ({ parent }) => parent.variant !== "productHotspots",
    }),
    defineField({
      name: "productTags",
      title: "Products",
      type: "array",
      description: "Products tagged and displayed alongside this image",
      hidden: ({ parent }) => parent.variant !== "productTags",
      of: [
        defineField({
          name: "productWithVariant",
          type: "productWithVariant",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      fileName: "image.asset.originalFilename",
      image: "image",
      variant: "variant",
    },
    prepare({ fileName, image, variant }) {
      const currentVariant = VARIANTS.find((v) => v.value === variant);

      return {
        media: image,
        subtitle: `Image${currentVariant ? ` [${currentVariant.title}]` : ""}`,
        title: fileName,
      };
    },
  },
});
