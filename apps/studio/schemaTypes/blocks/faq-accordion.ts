import { MessageCircle } from "lucide-react";
import { defineField, defineType } from "sanity";

export const faqAccordion = defineType({
  name: "faqAccordion",
  type: "object",
  icon: MessageCircle,
  description:
    "Expandable question-and-answer section that lets visitors find answers without scrolling through walls of text",
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      title: "Eyebrow",
      description: "Deprecated — no longer displayed on the frontend",
      hidden: true,
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "The large text that is the primary focus of the block",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      type: "string",
      title: "Subtitle",
      description: "Deprecated — no longer displayed on the frontend",
      hidden: true,
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "object",
      description: "Optional link for additional content or actions",
      fields: [
        defineField({
          name: "title",
          type: "string",
          title: "Link Title",
          description: "The text to display for the link",
        }),
        defineField({
          name: "description",
          type: "string",
          title: "Link Description",
          description: "A brief description of where the link leads to",
        }),
        defineField({
          name: "url",
          type: "customUrl",
          title: "URL",
          description: "The destination URL for the link",
        }),
      ],
    }),
    defineField({
      name: "faqs",
      type: "array",
      title: "FAQs",
      description: "Select the FAQ items to display in this accordion",
      of: [
        {
          type: "reference",
          to: [{ type: "faq" }],
          options: { disableNew: true },
        },
      ],
      validation: (Rule) => [Rule.required(), Rule.unique()],
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title ?? "Untitled",
      subtitle: "FAQ Accordion",
      media: MessageCircle,
    }),
  },
});
