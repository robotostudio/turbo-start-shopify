import { author } from "@/schemaTypes/documents/author";
import { blog } from "@/schemaTypes/documents/blog";
import { blogIndex } from "@/schemaTypes/documents/blog-index";
import { collectionsIndex } from "@/schemaTypes/documents/collections-index";
import { faq } from "@/schemaTypes/documents/faq";
import { footer } from "@/schemaTypes/documents/footer";
import { homePage } from "@/schemaTypes/documents/home-page";
import { navbar } from "@/schemaTypes/documents/navbar";
import { page } from "@/schemaTypes/documents/page";
import { promoBanner } from "@/schemaTypes/documents/promo-banner";
import { redirect } from "@/schemaTypes/documents/redirect";
import { settings } from "@/schemaTypes/documents/settings";
import { collection } from "./collection";
import { colorTheme } from "./color-theme";
import { product } from "./product";
import { productVariant } from "./product-variant";

export const singletons = [
  homePage,
  blogIndex,
  collectionsIndex,
  settings,
  footer,
  navbar,
  promoBanner,
];

export const documents = [
  blog,
  page,
  faq,
  author,
  product,
  collection,
  colorTheme,
  productVariant,
  ...singletons,
  redirect,
];
