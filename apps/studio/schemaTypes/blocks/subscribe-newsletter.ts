import { Mail } from "lucide-react";
import { defineField, defineType } from "sanity";

import { customRichText } from "@/schemaTypes/definitions/rich-text";

export const subscribeNewsletter = defineType({
  name: "subscribeNewsletter",
  title: "Subscribe Newsletter",
  type: "object",
  icon: Mail,
  description:
    "Email signup section that encourages visitors to subscribe to your newsletter",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The headline text encouraging visitors to subscribe",
    }),
    customRichText(["block"], {
      name: "subTitle",
      title: "SubTitle",
    }),
    customRichText(["block"], {
      name: "helperText",
      title: "Helper Text",
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title ?? "Untitled",
      subtitle: "Subscribe Newsletter",
      media: Mail,
    }),
  },
});
