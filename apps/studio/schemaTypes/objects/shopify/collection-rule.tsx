import { FilterIcon } from "@sanity/icons";
import { defineField } from "sanity";

export const collectionRule = defineField({
  title: "Collection rule",
  name: "collectionRule",
  type: "object",
  icon: FilterIcon,
  readOnly: true,
  description:
    "Automated rule from Shopify that determines which products belong to a collection",
  fields: [
    defineField({
      name: "column",
      type: "string",
      description: "The product attribute this rule filters on",
    }),
    defineField({
      name: "relation",
      type: "string",
      description: "How the attribute is compared to the condition",
    }),
    defineField({
      name: "condition",
      type: "string",
      description: "The value the attribute is compared against",
    }),
  ],
  preview: {
    select: {
      condition: "condition",
      name: "column",
      relation: "relation",
    },
    prepare({ condition, name, relation }) {
      return {
        subtitle: `${relation} ${condition}`,
        title: name,
      };
    },
  },
});
