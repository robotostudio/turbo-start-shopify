import { ImageIcon, LinkIcon } from "@sanity/icons";
import {
  type ConditionalProperty,
  defineArrayMember,
  defineField,
  defineType,
} from "sanity";

// --- Annotation: customLink wrapping customUrl ---
const customLinkAnnotation = {
  name: "customLink",
  type: "object",
  title: "Link",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "customLink",
      type: "customUrl",
    }),
  ],
};

// --- Block member (text with formatting) ---
const blockMember = defineArrayMember({
  name: "block",
  type: "block",
  styles: [
    { title: "Normal", value: "normal" },
    { title: "H2", value: "h2" },
    { title: "H3", value: "h3" },
    { title: "H4", value: "h4" },
    { title: "H5", value: "h5" },
    { title: "H6", value: "h6" },
  ],
  lists: [
    { title: "Numbered", value: "number" },
    { title: "Bullet", value: "bullet" },
  ],
  marks: {
    annotations: [customLinkAnnotation],
    decorators: [
      { title: "Strong", value: "strong" },
      { title: "Emphasis", value: "em" },
      { title: "Code", value: "code" },
    ],
  },
});

// --- Image member ---
const imageMember = defineArrayMember({
  name: "image",
  title: "Image",
  type: "image",
  icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({
      name: "caption",
      type: "string",
      title: "Caption",
      description: "Optional caption displayed below the image",
    }),
  ],
});

// --- Inline block members (from old portableText) ---
const inlineMembers = {
  accordion: defineArrayMember({ type: "accordion" }),
  callout: defineArrayMember({ type: "callout" }),
  grid: defineArrayMember({ type: "grid" }),
  images: defineArrayMember({ type: "images" }),
  imageWithProductHotspots: defineArrayMember({
    type: "imageWithProductHotspots",
    title: "Image with Hotspots",
  }),
  instagram: defineArrayMember({ type: "instagram" }),
  products: defineArrayMember({ type: "products" }),
};

// --- All available members ---
const allMembers = {
  block: blockMember,
  image: imageMember,
  ...inlineMembers,
} as const;

export type RichTextMemberType = keyof typeof allMembers;

// --- Registered type: full rich text (for product body, etc.) ---
export const richText = defineType({
  name: "richText",
  title: "Rich Text",
  type: "array",
  description:
    "Full-featured text editor with formatting, images, embeds, and interactive modules",
  of: Object.values(allMembers),
});

// --- Factory: create rich text with specific member types ---
export const customRichText = (
  types: RichTextMemberType[],
  options?: {
    name?: string;
    title?: string;
    group?: string[] | string;
    description?: string;
    hidden?: ConditionalProperty;
  }
) => {
  const { name, description, hidden } = options ?? {};
  const selected = types
    .filter((t) => t in allMembers)
    .map((t) => allMembers[t]);

  return defineField({
    ...options,
    name: name ?? "richText",
    type: "array",
    description: description ?? "",
    hidden,
    of: selected,
  });
};
