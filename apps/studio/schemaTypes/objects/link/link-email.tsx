import { EnvelopeIcon } from "@sanity/icons";
import { defineField } from "sanity";

export const linkEmail = defineField({
  title: "Email link",
  name: "linkEmail",
  type: "object",
  description: "Link that opens an email client with a mailto: address",
  icon: EnvelopeIcon,
  components: {
    annotation: (props) => (
      <span>
        <EnvelopeIcon
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
      name: "email",
      type: "email",
    }),
  ],
  preview: {
    select: {
      title: "email",
    },
  },
});
