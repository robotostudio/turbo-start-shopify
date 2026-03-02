import { Megaphone } from "lucide-react";
import { defineField, defineType } from "sanity";

export const promoBanner = defineType({
  name: "promoBanner",
  type: "document",
  title: "Promo Banner",
  description:
    "Promotional announcement banner displayed at the top of the site",
  icon: Megaphone,
  fields: [
    defineField({
      name: "enabled",
      type: "boolean",
      title: "Enabled",
      description: "Toggle the promo banner visibility on the site",
      initialValue: false,
    }),
    defineField({
      name: "text",
      type: "string",
      title: "Text",
      description: "The promotional message displayed in the banner",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "link",
      type: "customUrl",
      title: "Link",
      description: "Optional link for the banner text",
    }),
  ],
  preview: {
    select: {
      title: "text",
      enabled: "enabled",
    },
    prepare: ({ title, enabled }) => ({
      title: title || "Promo Banner",
      subtitle: enabled ? "Enabled" : "Disabled",
      media: Megaphone,
    }),
  },
});
