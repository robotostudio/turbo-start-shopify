import { defineQuery } from "next-sanity";

const imageFields = /* groq */ `
  "id": asset._ref,
  "preview": asset->metadata.lqip,
  "alt": coalesce(
    alt,
    asset->altText,
    caption,
    asset->originalFilename,
    "untitled"
  ),
  hotspot {
    x,
    y
  },
  crop {
    bottom,
    left,
    right,
    top
  }
` as const;
// Base fragments for reusable query parts
const imageFragment = /* groq */ `
  image {
    ${imageFields}
  }
` as const;

/**
 * Shopify keeps archived and deleted items in Sanity, so a reference to one still
 * resolves — but `/products/[handle]` only renders products matching this same
 * predicate (`queryProductByHandle`), and `/collections/[handle]` 404s once Shopify
 * stops serving the collection. Every link surface has to gate its dereference on
 * these, or it renders a link straight into a `notFound()`.
 *
 * Generic parameters and `as const` throughout this file, never `(ref: string) =>
 * string`. `sanityFetch` resolves its result type by matching the query's string
 * *literal* type against the `SanityQueries` keys typegen generates; a fragment
 * typed as plain `string` widens every query embedding it to a `${string}` pattern,
 * the lookup misses, and `ClientReturn` falls back to `any`. Typegen and lint both
 * still pass — the only symptom is an `any` far away at the call site. A template
 * literal folds to a literal type on its own when every hole is already literal,
 * but a *call* in a hole widens it, so any fragment interpolating one of these
 * helpers needs its own `as const`.
 */
const visibleProduct = <const R extends string>(ref: R) =>
  /* groq */ `${ref}->store.status == "active" && ${ref}->store.isDeleted != true` as const;

const visibleCollection = <const R extends string>(ref: R) =>
  /* groq */ `${ref}->store.isDeleted != true` as const;

/**
 * `customUrl` resolves to a path the same way in eight places — navbar, footer,
 * promo banner, buttons, image-link cards, the FAQ accordion link and `customLink`
 * marks — so the guard belongs here rather than at each of them. `at` is the dotted
 * path to the link object: "url." for buttons and links, "link." for the promo
 * banner, "" inside a `customLink{...}` spread where the fields sit at the root.
 * `fallback` is the expression used when no link type matches; both parameters are
 * required, because defaulting one would need an assertion typegen cannot resolve.
 *
 * Each catalog arm wraps its own inner `select()` rather than gating the outer
 * branch. The outer branch still matches, so a hidden target yields a null `href`
 * and never falls through to `fallback` — a null field on an array item that keeps
 * its place, which is what every consumer already handles for a dangling weak
 * reference. `buttons[]`, footer `links[]` and `markDefs[]` keep their length.
 *
 * The catalog clauses sit inside the second arm of the coalesce, never above it.
 * `internal` accepts `page`, `blog` and `blogIndex` as well as the catalog, and an
 * editorial document has no `store` at all, so a guard hoisted over the coalesce
 * reads `store.isDeleted` as null on every one of them and takes the editorial half
 * of the navbar down with it.
 *
 * That arm branches on the target's `_type`. Coalescing straight onto
 * `store.slug.current` sent an `internal` reference to a *product* off to
 * `/collections/<product-handle>`, which 404s whatever the flags say, and gated it
 * on the collection predicate so an archived product still emitted a live href.
 *
 * The predicates are spelled out rather than calling `visibleProduct` /
 * `visibleCollection`: typegen's extractor only substitutes *literal* arguments
 * into a helper, and `visibleProduct(`${at}product`)` leaves it unable to bind
 * `at`. Keep them in step with those two helpers.
 */
const customUrlHrefFragment = <const A extends string, const F extends string>(
  at: A,
  fallback: F
) =>
  /* groq */ `select(
      ${at}type == "internal" => coalesce(
        ${at}internal->slug.current,
        select(
          ${at}internal->_type == "product" && ${at}internal->store.status == "active" && ${at}internal->store.isDeleted != true =>
            "/products/" + ${at}internal->store.slug.current,
          ${at}internal->_type == "collection" && ${at}internal->store.isDeleted != true =>
            "/collections/" + ${at}internal->store.slug.current
        )
      ),
      ${at}type == "external" => ${at}external,
      ${at}type == "email" => "mailto:" + ${at}email,
      ${at}type == "product" => select(
        ${at}product->store.status == "active" && ${at}product->store.isDeleted != true =>
          "/products/" + ${at}product->store.slug.current
      ),
      ${fallback}
    )` as const;

const customLinkFragment = /* groq */ `
  ...customLink{
    openInNewTab,
    "href": ${customUrlHrefFragment("", '"#"')},
  }
` as const;

const markDefsFragment = /* groq */ `
  markDefs[]{
    ...,
    ${customLinkFragment},
    _type == "linkInternal" => {
      "href": reference->slug.current,
    },
    _type == "linkExternal" => {
      "href": url,
      "openInNewTab": newWindow,
    },
    _type == "linkEmail" => {
      "href": "mailto:" + email,
    },
  }
` as const;

const productWithVariantFragment = /* groq */ `
  productWithVariant{
    "product": select(${visibleProduct("product")} => product->{
      _id,
      "slug": store.slug.current,
      store{
        title,
        priceRange,
        previewImageUrl,
        gid
      }
    }),
    variant->{
      _id,
      store{
        title,
        price,
        previewImageUrl,
        gid
      }
    }
  }
` as const;

const productHotspotsFragment = /* groq */ `
  productHotspots[]{
    _key,
    x,
    y,
    ${productWithVariantFragment}
  }
` as const;

// ── Portable Text members ──
//
// One fragment per member the registered `richText` type permits
// (apps/studio/schemaTypes/definitions/rich-text.ts).

const blockMemberFragment = /* groq */ `
  _type == "block" => {
    ...,
    ${markDefsFragment}
  }
` as const;

const imageMemberFragment = /* groq */ `
  _type == "image" => {
    ${imageFields},
    "caption": caption
  }
` as const;

const imageWithProductHotspotsMemberFragment = /* groq */ `
  _type == "imageWithProductHotspots" => {
    _type,
    _key,
    image{${imageFields}},
    showHotspots,
    ${productHotspotsFragment}
  }
` as const;

const accordionMemberFragment = /* groq */ `
  _type == "accordion" => {
    _type,
    _key,
    groups[]{
      _key,
      title,
      body[]{
        ...,
        ${blockMemberFragment}
      }
    }
  }
` as const;

const calloutMemberFragment = /* groq */ `
  _type == "callout" => {
    _type,
    _key,
    text
  }
` as const;

const instagramMemberFragment = /* groq */ `
  _type == "instagram" => {
    _type,
    _key,
    url
  }
` as const;

/**
 * An unhandled member still comes back from the bare `...` spread as raw stored
 * data, so a missing branch fails silently: the query returns something, and
 * the component gets a `_ref` it cannot render. Shared so the blog's `richText`
 * and the product's `body` cannot drift apart again.
 */
const portableTextMembersFragment = /* groq */ `
  ...,
  ${blockMemberFragment},
  ${imageMemberFragment},
  ${imageWithProductHotspotsMemberFragment},
  ${accordionMemberFragment},
  ${calloutMemberFragment},
  ${instagramMemberFragment}
` as const;

const richTextFragment = /* groq */ `
  richText[]{
    ${portableTextMembersFragment}
  }
` as const;

const blogAuthorFragment = /* groq */ `
  authors[0]->{
    _id,
    name,
    position,
    ${imageFragment}
  }
` as const;

const blogCardFragment = /* groq */ `
  _type,
  _id,
  title,
  description,
  "slug":slug.current,
  ${imageFragment},
  publishedAt,
  "category": category->{ _id, title, "slug": slug.current },
  ${blogAuthorFragment}
` as const;

const buttonsFragment = /* groq */ `
  buttons[]{
    text,
    variant,
    _key,
    _type,
    "openInNewTab": url.openInNewTab,
    "href": ${customUrlHrefFragment("url.", "url.href")},
  }
` as const;

// Page builder block fragments
const collectionBannerBlock = /* groq */ `
  _type == "collectionBanner" => {
    ...,
    ${imageFragment},
    ${buttonsFragment}
  }
` as const;

const ctaBlock = /* groq */ `
  _type == "cta" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
  }
` as const;
const imageLinkCardsBlock = /* groq */ `
  _type == "imageLinkCards" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
    "cards": array::compact(cards[]{
      ...,
      "openInNewTab": url.openInNewTab,
      "href": ${customUrlHrefFragment("url.", "url.href")},
      ${imageFragment},
    })
  }
` as const;

const heroBlock = /* groq */ `
  _type == "hero" => {
    ...,
    ${imageFragment},
    ${buttonsFragment},
    ${richTextFragment}
  }
` as const;

const faqFragment = /* groq */ `
  "faqs": array::compact(faqs[]->{
    title,
    _id,
    _type,
    ${richTextFragment}
  })
` as const;

const faqAccordionBlock = /* groq */ `
  _type == "faqAccordion" => {
    ...,
    ${faqFragment},
    link{
      ...,
      "openInNewTab": url.openInNewTab,
      "href": ${customUrlHrefFragment("url.", "url.href")}
    }
  }
` as const;

const faqCategoriesBlock = /* groq */ `
  _type == "faqCategories" => {
    ...,
    categories[]{
      _key,
      title,
      ${faqFragment}
    }
  }
` as const;

const subscribeNewsletterBlock = /* groq */ `
  _type == "subscribeNewsletter" => {
    ...,
    "subTitle": subTitle[]{
      ...,
      ${markDefsFragment}
    },
    "helperText": helperText[]{
      ...,
      ${markDefsFragment}
    },
    ${imageFragment}
  }
` as const;

const exploreCategoriesBlock = /* groq */ `
  _type == "exploreCategories" => {
    ...,
    ${buttonsFragment},
    "collections": *[_type == "collection" && defined(store.slug.current) && store.isDeleted != true][0...4]{
      _id,
      "title": store.title,
      "slug": store.slug.current,
      "imageUrl": store.imageUrl,
    }
  }
` as const;

const featureCardsIconBlock = /* groq */ `
  _type == "featureCardsIcon" => {
    ...,
    ${richTextFragment},
    "cards": array::compact(cards[]{
      ...,
      ${richTextFragment},
    })
  }
` as const;

const editorialTwoUpBlock = /* groq */ `
  _type == "editorialTwoUp" => {
    ...,
    // The clause replaces defined(collection) rather than joining it. A weak
    // reference whose target is gone reads store.isDeleted as null, null != true
    // is true, and the deref then yields null — which is what defined(collection)
    // was there to produce, and what the block already renders as an unlinked
    // card. The card keeps the title and image the last sync wrote: a stale name
    // is a smaller lie than a link that 404s, and dropping the item would leave
    // one column in a layout the schema validates as exactly two.
    "items": array::compact(items[]{
      ...,
      swatchColor,
      "collectionTitle": collection->store.title,
      "collectionImage": collection->store.imageUrl,
      "collectionHref": select(
        ${visibleCollection("collection")} => "/collections/" + collection->store.slug.current,
        null
      ),
    })
  }
` as const;

const layersShowcaseBlock = /* groq */ `
  _type == "layersShowcase" => {
    ...,
    heading,
    description,
    "productHandle": select(${visibleProduct("product")} => product->store.slug.current),
    "productTitle": select(${visibleProduct("product")} => product->store.title),
  }
` as const;

const featuredProductsBlock = /* groq */ `
  _type == "featuredProducts" => {
    ...,
    heading,
    "productHandles": array::compact(products[${visibleProduct("@")}]->store.slug.current)
  }
` as const;

const pageBuilderFragment = /* groq */ `
  pageBuilder[]{
    ...,
    _type,
    ${collectionBannerBlock},
    ${ctaBlock},
    ${editorialTwoUpBlock},
    ${exploreCategoriesBlock},
    ${heroBlock},
    ${faqAccordionBlock},
    ${faqCategoriesBlock},
    ${featureCardsIconBlock},
    ${featuredProductsBlock},
    ${layersShowcaseBlock},
    ${subscribeNewsletterBlock},
    ${imageLinkCardsBlock}
  }
` as const;

/**
 * Query to extract a single image from a page document
 * This is used as a type reference only and not for actual data fetching
 * Helps with TypeScript inference for image objects
 */
export const queryImageType = defineQuery(`
  *[_type == "page" && defined(image)][0]{
    ${imageFragment}
  }.image
`);

export const queryHomePageData =
  defineQuery(`*[_type == "homePage" && _id == "homePage"][0]{
    ...,
    _id,
    _type,
    "slug": slug.current,
    title,
    description,
    ${pageBuilderFragment}
  }`);

export const querySlugPageData = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    ...,
    "slug": slug.current,
    ${pageBuilderFragment}
  }
  `);

export const querySlugPagePaths = defineQuery(`
  *[_type == "page" && defined(slug.current)].slug.current
`);

export const queryBlogIndexPageData = defineQuery(`
  *[_type == "blogIndex"][0]{
    ...,
    _id,
    _type,
    title,
    description,
    "displayFeaturedBlogs" : displayFeaturedBlogs == "yes",
    "featuredBlogsCount" : featuredBlogsCount,
    ${pageBuilderFragment},
    "slug": slug.current
  }
`);

export const queryBlogIndexPageBlogs = defineQuery(`
  *[_type == "blog" && (seoHideFromLists != true) && ($category == "" || category->slug.current == $category)] | order(orderRank asc) [$start...$end]{
    ${blogCardFragment}
  }
`);

export const queryAllBlogDataForSearch = defineQuery(`
  *[_type == "blog" && defined(slug.current) && (seoHideFromLists != true)]{
    ${blogCardFragment}
  }
`);

export const queryBlogIndexPageBlogsCount = defineQuery(`
  count(*[_type == "blog" && (seoHideFromLists != true) && ($category == "" || category->slug.current == $category)])
`);

export const queryBlogCategories = defineQuery(`
  *[_type == "category"] | order(orderRank asc){
    _id,
    title,
    "slug": slug.current
  }
`);
export const queryBlogSlugPageData = defineQuery(`
  *[_type == "blog" && slug.current == $slug][0]{
    ...,
    "slug": slug.current,
    "category": category->{ _id, title, "slug": slug.current },
    ${blogAuthorFragment},
    ${imageFragment},
    ${richTextFragment},
    ${pageBuilderFragment}
  }
`);

export const queryBlogPaths = defineQuery(`
  *[_type == "blog" && defined(slug.current)].slug.current
`);

const ogFieldsFragment = /* groq */ `
  _id,
  _type,
  "title": select(
    defined(ogTitle) => ogTitle,
    defined(seoTitle) => seoTitle,
    title
  ),
  "description": select(
    defined(ogDescription) => ogDescription,
    defined(seoDescription) => seoDescription,
    description
  ),
  "image": image.asset->url + "?w=1200&h=630&dpr=2&fit=crop",
  "seoImage": seoImage.asset->url + "?w=1200&h=630&dpr=2&fit=max",
  "logo": *[_type == "settings"][0].logo.asset->url + "?w=80&h=40&dpr=3&fit=max&q=100",
  "siteTitle": *[_type == "settings"][0].siteTitle,
  "date": coalesce(date, _createdAt)
` as const;

export const queryHomePageOGData = defineQuery(`
  *[_type == "homePage" && _id == $id][0]{
    ${ogFieldsFragment}
  }
  `);

export const querySlugPageOGData = defineQuery(`
  *[_type == "page" && _id == $id][0]{
    ${ogFieldsFragment}
  }
`);

export const queryBlogPageOGData = defineQuery(`
  *[_type == "blog" && _id == $id][0]{
    ${ogFieldsFragment}
  }
`);

export const queryGenericPageOGData = defineQuery(`
  *[ defined(slug.current) && _id == $id][0]{
    ${ogFieldsFragment}
  }
`);

export const queryProductOGData = defineQuery(`
  *[_type == "product" && _id == $id][0]{
    _id,
    _type,
    "title": select(
      defined(seo.title) => seo.title,
      store.title
    ),
    "description": select(
      defined(seo.description) => seo.description,
      store.descriptionHtml
    ),
    // Height only, so the full portrait survives for the card to letterbox.
    // A raw Shopify url is the original -- 3058x4096, 12.8MB here -- pulled
    // whole by the edge renderer every request. 1260 is 2x the card height.
    // Joined with & because Shopify CDN urls always carry a v= cache-buster.
    "image": select(
      defined(seo.image.asset) => seo.image.asset->url + "?w=1200&h=630&dpr=2&fit=crop",
      defined(store.previewImageUrl) => store.previewImageUrl + "&height=1260"
    ),
    "price": store.priceRange.minVariantPrice,
    "colors": store.options[]{ name, values },
    "variants": store.variants[]->store{ price, compareAtPrice },
    "seoImage": seo.image.asset->url + "?w=1200&h=630&dpr=2&fit=max",
    "logo": *[_type == "settings"][0].logo.asset->url + "?w=80&h=40&dpr=3&fit=max&q=100",
    "siteTitle": *[_type == "settings"][0].siteTitle,
    "date": coalesce(store.createdAt, _createdAt)
  }
`);

export const queryCollectionOGData = defineQuery(`
  *[_type == "collection" && _id == $id][0]{
    _id,
    _type,
    "title": select(
      defined(seo.title) => seo.title,
      store.title
    ),
    "description": select(
      defined(seo.description) => seo.description,
      store.descriptionHtml
    ),
    "image": select(
      defined(seo.image.asset) => seo.image.asset->url + "?w=1200&h=630&dpr=2&fit=crop",
      defined(hero.image.asset) => hero.image.asset->url + "?w=1200&h=630&dpr=2&fit=crop",
      defined(store.imageUrl) => store.imageUrl + "&height=1260"
    ),
    "seoImage": seo.image.asset->url + "?w=1200&h=630&dpr=2&fit=max",
    "logo": *[_type == "settings"][0].logo.asset->url + "?w=80&h=40&dpr=3&fit=max&q=100",
    "siteTitle": *[_type == "settings"][0].siteTitle,
    "date": coalesce(store.createdAt, _createdAt)
  }
`);

export const queryPromoBannerData = defineQuery(`
  *[_type == "promoBanner" && _id == "promoBanner"][0]{
    _id,
    enabled,
    text,
    "openInNewTab": link.openInNewTab,
    "href": ${customUrlHrefFragment("link.", "link.href")},
  }
`);

export const queryFooterData = defineQuery(`
  *[_type == "footer" && _id == "footer"][0]{
    _id,
    columns[]{
      _key,
      title,
      links[]{
        _key,
        name,
        "openInNewTab": url.openInNewTab,
        "href": ${customUrlHrefFragment("url.", "url.href")},
      }
    }
  }
`);

export const queryNavbarData = defineQuery(`
  *[_type == "navbar" && _id == "navbar"][0]{
    _id,
    columns[]{
      _key,
      _type == "navbarColumn" => {
        "type": "column",
        title,
        links[]{
          _key,
          name,
          icon,
          description,
          "openInNewTab": url.openInNewTab,
          "href": ${customUrlHrefFragment("url.", "url.href")}
        }
      },
      _type == "navbarLink" => {
        "type": "link",
        name,
        description,
        "openInNewTab": url.openInNewTab,
        "href": ${customUrlHrefFragment("url.", "url.href")}
      },
      _type == "collectionGroup" => {
        "type": "collectionGroup",
        title,
        "collectionLinks": array::compact(collectionLinks[${visibleCollection("@")}]->{
          _id,
          "slug": store.slug.current,
          store{
            title,
            imageUrl
          }
        }),
        "collectionProducts": select(${visibleCollection("collectionProducts")} => collectionProducts->{
          _id,
          "slug": store.slug.current,
          store{
            title
          }
        })
      }
    },
    ${buttonsFragment},
  }
`);

// Each key is a document `_type`, which `SANITY_SITEMAP_SOURCES` in
// apps/web/src/app/sitemap.ts is typed against — adding a source there without
// a matching projection here is a typecheck failure rather than a page that is
// silently missing from the sitemap.
//
// Shopify-backed keys split their two description sources rather than
// coalescing them: `seo.description` is plain text an editor typed, while
// `descriptionHtml` is merchant HTML. llms.txt strips tags from the second, and
// putting the first through that stripper would eat any angle-bracketed text.
// `title` and `description` are unused by the sitemap and exist for
// apps/web/src/app/llms.txt/route.ts, which reads this same query: the llms.txt
// spec requires `- [name](url)` links, and a bare URL is not a link. Both
// surfaces share one query so their URL sets cannot drift apart.
export const querySitemapData = defineQuery(`{
  "page": *[_type == "page" && defined(slug.current) && seoNoIndex != true]{
    "path": slug.current,
    "lastModified": _updatedAt,
    "title": coalesce(seoTitle, title),
    "description": coalesce(seoDescription, description)
  },
  "blog": *[_type == "blog" && defined(slug.current) && seoNoIndex != true]{
    "path": slug.current,
    "lastModified": _updatedAt,
    "title": coalesce(seoTitle, title),
    "description": coalesce(seoDescription, description)
  },
  "blogIndex": *[_type == "blogIndex"]{
    // Literal, not the stored slug: this singleton saves it bare ("blog", no
    // leading slash) and the sitemap joins path straight onto the origin, so
    // the stored value emits "https://siteblog".
    "path": "/blog",
    "lastModified": _updatedAt,
    "title": coalesce(seoTitle, title),
    "description": coalesce(seoDescription, description)
  },
  "product": *[_type == "product" && defined(store.slug.current) && store.status == "active" && store.isDeleted != true]{
    "path": store.slug.current,
    "lastModified": _updatedAt,
    "title": coalesce(seo.title, store.title),
    "description": seo.description,
    "descriptionHtml": store.descriptionHtml
  },
  "collection": *[_type == "collection" && defined(store.slug.current) && store.isDeleted != true]{
    "path": store.slug.current,
    "lastModified": _updatedAt,
    "title": coalesce(seo.title, store.title),
    "description": seo.description,
    "descriptionHtml": store.descriptionHtml
  }
}`);
export const queryGlobalSeoSettings = defineQuery(`
  *[_type == "settings"][0]{
    _id,
    _type,
    siteTitle,
    logo {
      ${imageFields}
    },
    favicon {
      "svg": svg.asset->url,
      "ico": ico.asset->url
    },
    "ogImage": ogImage.asset->url + "?w=1200&h=630&dpr=2&fit=max",
    siteDescription,
    socialLinks{
      linkedin,
      facebook,
      twitter,
      instagram,
      youtube
    }
  }
`);

export const querySettingsData = defineQuery(`
  *[_type == "settings"][0]{
    _id,
    _type,
    siteTitle,
    siteDescription,
    favicon {
      "svg": svg.asset->url,
      "ico": ico.asset->url
    },
    "ogImage": ogImage.asset->url + "?w=1200&h=630&dpr=2&fit=max",
    "logo": logo.asset->url + "?w=80&h=40&dpr=3&fit=max",
    "socialLinks": socialLinks,
    "contactEmail": contactEmail,
  }
`);

export const queryRedirects = defineQuery(`
  *[_type == "redirect" && status == "active" && defined(source.current) && defined(destination.current)]{
    "source":source.current,
    "destination":destination.current,
    "permanent" : permanent == "true"
  }
`);

export const queryRedirectBySource = defineQuery(`
  *[_type == "redirect" && status == "active" && source.current == $source && defined(destination.current)][0]{
    "source":source.current,
    "destination":destination.current,
    "permanent" : permanent == "true"
  }
`);

// ── Product fragments ──

const productBodyFragment = /* groq */ `
  body[]{
    ${portableTextMembersFragment}
  }
` as const;

export const queryProductByHandle = defineQuery(`
  *[_type == "product" && store.slug.current == $handle && store.status == "active" && store.isDeleted != true][0]{
    _id,
    _type,
    "slug": store.slug.current,
    "title": store.title,
    ${productBodyFragment},
    seo
  }
`);

export const queryProductPaths = defineQuery(`
  *[_type == "product" && defined(store.slug.current) && store.status == "active" && store.isDeleted != true].store.slug.current
`);

// ── Collection fragments ──

const collectionModulesFragment = /* groq */ `
  modules[]{
    ...,
    _type,
    _key,
    _type == "callout" => { text },
    _type == "callToAction" => {
      ...,
      ${richTextFragment},
      ${buttonsFragment}
    },
    _type == "image" => {
      ${imageFields}
    },
    _type == "imageWithProductHotspots" => {
      image{${imageFields}},
      showHotspots,
      ${productHotspotsFragment}
    },
    _type == "instagram" => {
      url
    }
  }
` as const;

export const queryCollectionByHandle = defineQuery(`
  *[_type == "collection" && store.slug.current == $handle && store.isDeleted != true][0]{
    _id,
    _type,
    "title": store.title,
    showHero,
    hero{
      ...,
      ${imageFragment},
      ${buttonsFragment},
      ${richTextFragment}
    },
    ${collectionModulesFragment},
    seo
  }
`);

export const queryCollectionPaths = defineQuery(`
  *[_type == "collection" && defined(store.slug.current) && store.isDeleted != true].store.slug.current
`);

export const queryCollectionsIndexPageData = defineQuery(`
  *[_type == "collectionsIndex"][0]{
    ...,
    _id,
    _type,
    title,
    subtitle,
    ${buttonsFragment},
    "slug": slug.current
  }
`);

export const queryAllCollections = defineQuery(`
  *[_type == "collection" && defined(store.slug.current) && store.isDeleted != true]{
    _id,
    _createdAt,
    "title": store.title,
    "slug": store.slug.current,
    "imageUrl": store.imageUrl,
    "description": store.descriptionHtml,
    seo
  }
`);
