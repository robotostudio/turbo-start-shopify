import { StackCompactIcon } from "@sanity/icons";
import pluralize from "pluralize-esm";
import { defineField } from "sanity";

export const accordion = defineField({
  name: "accordion",
  title: "Accordion",
  type: "object",
  icon: StackCompactIcon,
  description: "A set of expandable panels that reveal content when clicked",
  fields: [
    defineField({
      name: "groups",
      type: "array",
      description: "The expandable panels that make up this accordion",
      of: [{ type: "accordionGroup" }],
    }),
  ],
  preview: {
    select: {
      groups: "groups",
    },
    prepare({ groups }) {
      return {
        subtitle: "Accordion",
        title:
          groups?.length > 0
            ? pluralize("group", groups.length, true)
            : "No groups",
      };
    },
  },
});
