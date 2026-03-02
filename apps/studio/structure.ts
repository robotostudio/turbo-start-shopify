import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import {
  BookMarked,
  CogIcon,
  FileText,
  HomeIcon,
  type LucideIcon,
  Megaphone,
  MessageCircle,
  PanelBottom,
  PanelTop,
  Settings2,
  ShoppingBag,
  TrendingUpDown,
  User,
} from "lucide-react";
import type {
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";

import { createSlugBasedStructure } from "@/components/nested-pages-structure";
import type { SingletonType } from "@/schemaTypes/index";

function singleton(
  S: StructureBuilder,
  type: SingletonType,
  title: string,
  icon?: LucideIcon
) {
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(type).documentId(type).title(title));
}

function list(
  S: StructureBuilder,
  type: string,
  title: string,
  icon?: LucideIcon
) {
  return S.documentTypeListItem(type).title(title).icon(icon);
}

export const structure = (
  S: StructureBuilder,
  context: StructureResolverContext
) =>
  S.list()
    .title("Content")
    .items([
      singleton(S, "homePage", "Home Page", HomeIcon),
      S.divider(),

      // Content
      createSlugBasedStructure(S, "page"),
      S.listItem()
        .title("Blog")
        .icon(BookMarked)
        .child(
          S.list()
            .title("Blog")
            .items([
              singleton(S, "blogIndex", "Blog Settings", BookMarked),
              orderableDocumentListDeskItem({
                type: "blog",
                S,
                context,
                icon: FileText,
                title: "Blog Posts",
              }),
            ])
        ),
      list(S, "faq", "FAQs", MessageCircle),
      list(S, "author", "Authors", User),
      S.divider(),

      // Commerce
      S.listItem()
        .title("Commerce")
        .icon(ShoppingBag)
        .child(
          S.list()
            .title("Commerce")
            .items([
              list(S, "product", "Products", ShoppingBag),
              S.listItem()
                .title("Collections")
                .icon(BookMarked)
                .child(
                  S.list()
                    .title("Collections")
                    .items([
                      singleton(
                        S,
                        "collectionsIndex",
                        "Collections Settings",
                        BookMarked
                      ),
                      list(S, "collection", "All Collections", BookMarked),
                    ])
                ),
              list(S, "productVariant", "Product Variants", FileText),
              list(S, "colorTheme", "Color Themes", Settings2),
            ])
        ),
      S.divider(),

      // Configuration
      S.listItem()
        .title("Site Configuration")
        .icon(Settings2)
        .child(
          S.list()
            .title("Site Configuration")
            .items([
              singleton(S, "promoBanner", "Promo Banner", Megaphone),
              singleton(S, "navbar", "Navigation", PanelTop),
              singleton(S, "footer", "Footer", PanelBottom),
              singleton(S, "settings", "Global Settings", CogIcon),
              list(S, "redirect", "Redirects", TrendingUpDown),
            ])
        ),
    ]);
