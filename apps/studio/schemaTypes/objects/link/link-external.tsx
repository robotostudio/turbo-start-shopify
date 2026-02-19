import { EarthGlobeIcon } from "@sanity/icons";
import { defineField } from "sanity";

export const linkExternal = defineField({
  title: "External Link",
  name: "linkExternal",
  type: "object",
  description: "Link to an external URL outside the site",
  icon: EarthGlobeIcon,
  components: {
    annotation: (props) => (
      <span>
        <EarthGlobeIcon
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
      name: "url",
      title: "URL",
      type: "url",
      description: "The full web address to link to",
      validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      title: "Open in a new window?",
      name: "newWindow",
      type: "boolean",
      description: "When enabled, the link opens in a new browser tab",
      initialValue: true,
    }),
  ],
});
