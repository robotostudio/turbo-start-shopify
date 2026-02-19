import { defineArrayMember, defineField } from "sanity";

import ProductTooltip from "../../../components/hotspots/product-tooltip";

export const productHotspots = defineField({
  name: "productHotspots",
  title: "Hotspots",
  type: "array",
  description:
    "Clickable points on an image that reveal product details when tapped or hovered",
  of: [defineArrayMember({ type: "spot" })],
  options: {
    imageHotspot: {
      imagePath: "image",
      tooltip: ProductTooltip,
      pathRoot: "parent",
    },
  },
});
