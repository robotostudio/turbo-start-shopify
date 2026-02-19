import { LinkIcon } from "@sanity/icons";
import { defineField } from "sanity";

import { PAGE_REFERENCES } from "@/utils/constants";

export const linkInternal = defineField({
  title: "Internal Link",
  name: "linkInternal",
  type: "object",
  description: "Link to an internal page within the site",
  icon: LinkIcon,
  components: {
    annotation: (props) => (
      <span>
        <LinkIcon
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
      name: "reference",
      type: "reference",
      description: "The page or document this link points to",
      weak: true,
      validation: (Rule) => Rule.required(),
      to: PAGE_REFERENCES,
    }),
  ],
});
