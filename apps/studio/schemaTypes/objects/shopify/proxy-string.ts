import { defineField } from "sanity";

import ProxyStringInput from "../../../components/inputs/proxy-string";

export const proxyString = defineField({
  name: "proxyString",
  title: "Title",
  type: "string",
  description:
    "Read-only display of a value synced from another field in the document",
  components: {
    input: ProxyStringInput,
  },
});
