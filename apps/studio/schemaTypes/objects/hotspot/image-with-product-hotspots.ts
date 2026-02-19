import { ImageIcon } from "@sanity/icons";
import pluralize from "pluralize-esm";
import { defineField } from "sanity";

export const imageWithProductHotspots = defineField({
  icon: ImageIcon,
  name: "imageWithProductHotspots",
  title: "Image",
  type: "object",
  description:
    "An image with optional interactive product hotspots that reveal product details on hover",
  fields: [
    defineField({
      name: "image",
      description: "The base image where product hotspots will be placed",
      options: { hotspot: true },
      type: "image",
      validation: (Rule) => Rule.required(),
      // Hide original image when showHotspots is true and an image is set
      hidden: ({ value, parent }) => parent.showHotspots && value,
    }),
    defineField({
      name: "showHotspots",
      type: "boolean",
      description:
        "Toggle to enable interactive product hotspots on this image",
      initialValue: false,
    }),
    defineField({
      name: "productHotspots",
      type: "productHotspots",
      description: "The clickable product hotspots placed on this image",
      hidden: ({ parent }) => !parent.showHotspots,
    }),
  ],
  preview: {
    select: {
      fileName: "image.asset.originalFilename",
      hotspots: "productHotspots",
      image: "image",
      showHotspots: "showHotspots",
    },
    prepare({ fileName, hotspots, image, showHotspots }) {
      return {
        media: image,
        subtitle:
          showHotspots && hotspots.length > 0
            ? `${pluralize("hotspot", hotspots.length, true)}`
            : undefined,
        title: fileName,
      };
    },
  },
});
