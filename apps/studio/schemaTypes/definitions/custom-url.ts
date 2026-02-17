import { defineField, defineType } from "sanity";

import { createRadioListLayout, isValidUrl } from "@/utils/helper";

const allLinkableTypes = [
  { type: "blog" },
  { type: "blogIndex" },
  { type: "page" },
  { type: "product" },
  { type: "collection" },
];

export const customUrl = defineType({
  name: "customUrl",
  title: "URL",
  type: "object",
  description:
    "A link to an internal page, external URL, email address, or product",
  fields: [
    defineField({
      name: "type",
      title: "Link Type",
      type: "string",
      description: "Choose what kind of link this is",
      options: createRadioListLayout(
        ["internal", "external", "email", "product"],
        { direction: "horizontal" }
      ),
      initialValue: "external",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "openInNewTab",
      title: "Open in new tab",
      type: "boolean",
      description: "Open the destination in a new browser tab",
      initialValue: false,
    }),
    // --- External URL ---
    defineField({
      name: "external",
      title: "URL",
      type: "string",
      description: "Full URL (https://...) or relative path (/about)",
      hidden: ({ parent }) => parent?.type !== "external",
      validation: (Rule) =>
        Rule.custom((value, { parent }) => {
          const type = (parent as { type?: string })?.type;
          if (type === "external") {
            if (!value) return "URL is required";
            if (!isValidUrl(value)) return "Invalid URL";
          }
          return true;
        }),
    }),
    // --- Internal Reference ---
    defineField({
      name: "internal",
      title: "Page",
      type: "reference",
      description: "Select an internal page",
      options: { disableNew: true },
      hidden: ({ parent }) => parent?.type !== "internal",
      to: allLinkableTypes,
      validation: (Rule) =>
        Rule.custom((value, { parent }) => {
          const type = (parent as { type?: string })?.type;
          if (type === "internal" && !value?._ref) {
            return "Select an internal page";
          }
          return true;
        }),
    }),
    // --- Email ---
    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
      description: "Email address for mailto: link",
      hidden: ({ parent }) => parent?.type !== "email",
      validation: (Rule) =>
        Rule.custom((value, { parent }) => {
          const type = (parent as { type?: string })?.type;
          if (type === "email" && !value) {
            return "Email address is required";
          }
          return true;
        }),
    }),
    // --- Product ---
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      description: "Select a product to link to",
      to: [{ type: "product" }],
      options: { disableNew: true },
      hidden: ({ parent }) => parent?.type !== "product",
      validation: (Rule) =>
        Rule.custom((value, { parent }) => {
          const type = (parent as { type?: string })?.type;
          if (type === "product" && !value?._ref) {
            return "Select a product";
          }
          return true;
        }),
    }),
    // --- Hidden href (internal use) ---
    defineField({
      name: "href",
      type: "string",
      initialValue: "#",
      hidden: true,
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      urlType: "type",
      externalUrl: "external",
      internalUrl: "internal.slug.current",
      email: "email",
      productTitle: "product.store.title",
      openInNewTab: "openInNewTab",
    },
    prepare({
      urlType,
      externalUrl,
      internalUrl,
      email,
      productTitle,
      openInNewTab,
    }) {
      const newTab = openInNewTab ? " ↗" : "";
      const labels: Record<string, string> = {
        internal: `Internal: ${internalUrl ?? "unset"}`,
        external: `External: ${externalUrl ?? "unset"}`,
        email: `Email: ${email ?? "unset"}`,
        product: `Product: ${productTitle ?? "unset"}`,
      };
      return {
        title: `${urlType ?? "unknown"} link`,
        subtitle: `${labels[urlType ?? ""] ?? ""}${newTab}`,
      };
    },
  },
});
