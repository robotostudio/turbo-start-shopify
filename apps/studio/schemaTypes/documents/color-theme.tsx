import { IceCreamIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import ColorTheme from "../../components/media/color-theme";

export const colorTheme = defineType({
  name: "colorTheme",
  title: "Color theme",
  type: "document",
  icon: IceCreamIcon,
  description:
    "Reusable color theme for products and collections with text and background colors",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description:
        "A name to identify this color theme, like 'Ocean Blue' or 'Sunset Orange'",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "text",
      type: "color",
      description: "The text color used with this theme",
      options: { disableAlpha: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "background",
      type: "color",
      description: "The background color used with this theme",
      options: { disableAlpha: true },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      backgroundColor: "background.hex",
      textColor: "text.hex",
      title: "title",
    },
    prepare({ backgroundColor, textColor, title }) {
      return {
        media: <ColorTheme background={backgroundColor} text={textColor} />,
        subtitle: `${textColor || "(No color)"} / ${backgroundColor || "(No color)"}`,
        title,
      };
    },
  },
});
