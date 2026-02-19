import { defineType } from "sanity";

import PlaceholderStringInput from "../../../components/inputs/placeholder-string";

export const placeholderString = defineType({
  name: "placeholderString",
  title: "Title",
  type: "string",
  description:
    "Display-only text field that shows synced Shopify data as a placeholder",
  components: {
    input: PlaceholderStringInput,
  },
});
