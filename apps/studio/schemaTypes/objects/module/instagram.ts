import { UserIcon } from "@sanity/icons";
import { defineField } from "sanity";

export const instagram = defineField({
  name: "instagram",
  title: "Instagram",
  type: "object",
  icon: UserIcon,
  description: "An embedded Instagram post displayed in editorial content",
  fields: [
    defineField({
      name: "url",
      title: "URL",
      type: "string",
      description: "The full URL of the Instagram post to embed",
      validation: (Rule) =>
        Rule.custom((url) => {
          const pattern =
            /(https?:\/\/(?:www\.)?instagram\.com\/p\/([^/?#&]+)).*/g;
          const isValid = url?.match(pattern);
          return isValid ? true : "Not a valid Instagram post URL";
        }),
    }),
  ],
  preview: {
    select: {
      url: "url",
    },
    prepare(selection) {
      const { url } = selection;
      return {
        subtitle: "Instagram",
        title: url,
        media: UserIcon,
      };
    },
  },
});
