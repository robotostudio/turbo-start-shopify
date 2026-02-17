import { defineArrayMember, defineField, defineType } from "sanity";
import { PackageIcon } from "@sanity/icons";
import { getExtension } from "@sanity/asset-utils";
import pluralize from "pluralize-esm";
import CollectionHiddenInput from "../../components/inputs/collection-hidden";
import ShopifyDocumentStatus from "../../components/media/shopify-document-status";
import { GROUP, GROUPS } from "@/utils/constants";

export const collection = defineType({
  name: "collection",
  title: "Collection",
  type: "document",
  icon: PackageIcon,
  groups: GROUPS,
  description: "Shopify collection with editorial content and custom theming",
  fields: [
    defineField({
      name: "hidden",
      type: "string",
      components: {
        field: CollectionHiddenInput,
      },
      hidden: ({ parent }) => {
        const isDeleted = parent?.store?.isDeleted;
        return !isDeleted;
      },
    }),
    defineField({
      name: "titleProxy",
      title: "Title",
      type: "proxyString",
      options: { field: "store.title" },
    }),
    defineField({
      name: "slugProxy",
      title: "Slug",
      type: "proxyString",
      options: { field: "store.slug.current" },
    }),
    defineField({
      name: "colorTheme",
      type: "reference",
      to: [{ type: "colorTheme" }],
      group: GROUP.THEME,
    }),
    defineField({
      name: "vector",
      title: "Vector artwork",
      type: "image",
      description: "Displayed in collection links using color theme",
      options: {
        accept: "image/svg+xml",
      },
      group: GROUP.THEME,
      validation: (Rule) =>
        Rule.custom((image) => {
          if (!image?.asset?._ref) {
            return true;
          }

          const format = getExtension(image.asset._ref);

          if (format !== "svg") {
            return "Image must be an SVG";
          }
          return true;
        }),
    }),
    defineField({
      name: "showHero",
      type: "boolean",
      description: "If disabled, page title will be displayed instead",
      group: GROUP.CONTENT,
    }),
    defineField({
      name: "hero",
      type: "hero",
      hidden: ({ document }) => !document?.showHero,
      group: GROUP.CONTENT,
    }),
    defineField({
      name: "modules",
      type: "array",
      description: "Editorial modules to associate with this collection",
      of: [
        defineArrayMember({ type: "callout" }),
        defineArrayMember({ type: "callToAction" }),
        defineArrayMember({ type: "image" }),
        defineArrayMember({ type: "instagram" }),
      ],
      group: GROUP.CONTENT,
    }),
    defineField({
      name: "store",
      title: "Shopify",
      type: "shopifyCollection",
      description: "Collection data from Shopify (read-only)",
      group: GROUP.COMMERCE,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: GROUP.SEO,
    }),
  ],
  orderings: [
    {
      name: "titleAsc",
      title: "Title (A-Z)",
      by: [{ field: "store.title", direction: "asc" }],
    },
    {
      name: "titleDesc",
      title: "Title (Z-A)",
      by: [{ field: "store.title", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      imageUrl: "store.imageUrl",
      isDeleted: "store.isDeleted",
      rules: "store.rules",
      title: "store.title",
    },
    prepare({ imageUrl, isDeleted, rules, title }) {
      const ruleCount = rules?.length || 0;

      return {
        media: (
          <ShopifyDocumentStatus
            isDeleted={isDeleted}
            type="collection"
            url={imageUrl}
            title={title}
          />
        ),
        subtitle:
          ruleCount > 0
            ? `Automated (${pluralize("rule", ruleCount, true)})`
            : "Manual",
        title,
      };
    },
  },
});
