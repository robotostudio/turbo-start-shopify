import { TagIcon } from "@sanity/icons";
import { defineField } from "sanity";

export const linkProduct = defineField({
  title: "Product",
  name: "linkProduct",
  type: "object",
  description: "Link to a product with optional add-to-cart or buy-now action",
  icon: TagIcon,
  components: {
    annotation: (props) => (
      <span>
        <TagIcon
          style={{
            marginLeft: "0.05em",
            marginRight: "0.1em",
            width: "0.75em",
          }}
        />
        {props.renderDefault(props)}
      </span>
    ),
  },
  fields: [
    defineField({
      name: "productWithVariant",
      type: "productWithVariant",
      description: "The product and variant this link connects to",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "linkAction",
      type: "string",
      description:
        "What happens when a visitor clicks — navigate to product page, add to cart, or buy now",
      initialValue: "link",
      options: {
        layout: "radio",
        list: [
          {
            title: "Navigate to product",
            value: "link",
          },
          {
            title: "Add to cart",
            value: "addToCart",
          },
          {
            title: "Buy now",
            value: "buyNow",
          },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "quantity",
      type: "number",
      description: "Number of items to add when the link is clicked",
      initialValue: 1,
      hidden: ({ parent }) => parent.linkAction === "link",
      validation: (Rule) => Rule.required().min(1).max(10),
    }),
  ],
});
