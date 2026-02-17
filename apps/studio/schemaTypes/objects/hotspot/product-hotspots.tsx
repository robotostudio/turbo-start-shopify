import { defineArrayMember, defineField } from "sanity";

import ProductTooltip from "../../../components/hotspots/ProductTooltip";

export const productHotspots = defineField({
  name: "productHotspots",
  title: "Hotspots",
  type: "array",
  of: [defineArrayMember({ type: "spot" })],
  options: {
    imageHotspot: {
      imagePath: "image",
      tooltip: ProductTooltip,
      pathRoot: "parent",
    },
  },
});
