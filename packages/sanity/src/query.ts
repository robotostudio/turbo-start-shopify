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
`;
// Base fragments for reusable query parts
const imageFragment = /* groq */ `
  image {
    ${imageFields}
  }
`;

const customLinkFragment = /* groq */ `
  ...customLink{
    openInNewTab,
    "href": select(
      type == "internal" => internal->slug.current,
      type == "external" => external,
      type == "email" => "mailto:" + email,
      type == "product" => "/products/" + product->store.slug.current,
      "#"
    ),
  }
`;

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
`;

const richTextFragment = /* groq */ `
  richText[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}
    },
    _type == "image" => {
      ${imageFields},
      "caption": caption
    }
  }
`;

const blogAuthorFragment = /* groq */ `
  authors[0]->{
    _id,
    name,
    position,
    ${imageFragment}
  }
`;

const blogCardFragment = /* groq */ `
  _type,
  _id,
  title,
  description,
  "slug":slug.current,
  orderRank,
  ${imageFragment},
  publishedAt,
  ${blogAuthorFragment}
`;

const buttonsFragment = /* groq */ `
  buttons[]{
    text,
    variant,
    _key,
    _type,
    "openInNewTab": url.openInNewTab,
    "href": select(
      url.type == "internal" => coalesce(
        url.internal->slug.current,
        "/collections/" + url.internal->store.slug.current
      ),
      url.type == "external" => url.external,
      url.type == "email" => "mailto:" + url.email,
      url.type == "product" => "/products/" + url.product->store.slug.current,
      url.href
    ),
  }
`;

// Page builder block fragments
const collectionBannerBlock = /* groq */ `
  _type == "collectionBanner" => {
    ...,
    ${imageFragment},
    ${buttonsFragment}
  }
`;

const ctaBlock = /* groq */ `
  _type == "cta" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
  }
`;
const imageLinkCardsBlock = /* groq */ `
  _type == "imageLinkCards" => {
    ...,
    ${richTextFragment},
    ${buttonsFragment},
    "cards": array::compact(cards[]{
      ...,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => url.internal->slug.current,
        url.type == "external" => url.external,
        url.type == "email" => "mailto:" + url.email,
        url.type == "product" => "/products/" + url.product->store.slug.current,
        url.href
      ),
      ${imageFragment},
    })
  }
`;

const heroBlock = /* groq */ `
  _type == "hero" => {
    ...,
    ${imageFragment},
    ${buttonsFragment},
    ${richTextFragment}
  }
`;

const faqFragment = /* groq */ `
  "faqs": array::compact(faqs[]->{
    title,
    _id,
    _type,
    ${richTextFragment}
  })
`;

const faqAccordionBlock = /* groq */ `
  _type == "faqAccordion" => {
    ...,
    ${faqFragment},
    link{
      ...,
      "openInNewTab": url.openInNewTab,
      "href": select(
        url.type == "internal" => url.internal->slug.current,
        url.type == "external" => url.external,
        url.type == "email" => "mailto:" + url.email,
        url.type == "product" => "/products/" + url.product->store.slug.current,
        url.href
      )
    }
  }
`;

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
`;

const exploreCategoriesBlock = /* groq */ `
  _type == "exploreCategories" => {
    ...,
    ${buttonsFragment},
    "collections": *[_type == "collection" && defined(store.slug.current)][0...4]{
      _id,
      "title": store.title,
      "slug": store.slug.current,
      "imageUrl": store.imageUrl,
    }
  }
`;

const featureCardsIconBlock = /* groq */ `
  _type == "featureCardsIcon" => {
    ...,
    ${richTextFragment},
    "cards": array::compact(cards[]{
      ...,
      ${richTextFragment},
    })
  }
`;

const pageBuilderFragment = /* groq */ `
  pageBuilder[]{
    ...,
    _type,
    ${collectionBannerBlock},
    ${ctaBlock},
    ${exploreCategoriesBlock},
    ${heroBlock},
    ${faqAccordionBlock},
    ${featureCardsIconBlock},
    ${subscribeNewsletterBlock},
    ${imageLinkCardsBlock}
  }
`;

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
  *[_type == "blog" && (seoHideFromLists != true)] | order(orderRank asc) [$start...$end]{
    ${blogCardFragment}
  }
`);

export const queryAllBlogDataForSearch = defineQuery(`
  *[_type == "blog" && defined(slug.current) && (seoHideFromLists != true)]{
    ${blogCardFragment}
  }
`);

export const queryBlogIndexPageBlogsCount = defineQuery(`
  count(*[_type == "blog" && (seoHideFromLists != true)])
`);
export const queryBlogSlugPageData = defineQuery(`
  *[_type == "blog" && slug.current == $slug][0]{
    ...,
    "slug": slug.current,
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
  "image": image.asset->url + "?w=566&h=566&dpr=2&fit=max",
  "dominantColor": image.asset->metadata.palette.dominant.background,
  "seoImage": seoImage.asset->url + "?w=1200&h=630&dpr=2&fit=max", 
  "logo": *[_type == "settings"][0].logo.asset->url + "?w=80&h=40&dpr=3&fit=max&q=100",
  "date": coalesce(date, _createdAt)
`;

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
    "image": select(
      defined(seo.image.asset) => seo.image.asset->url + "?w=566&h=566&dpr=2&fit=max",
      defined(store.previewImageUrl) => store.previewImageUrl
    ),
    "dominantColor": seo.image.asset->metadata.palette.dominant.background,
    "seoImage": seo.image.asset->url + "?w=1200&h=630&dpr=2&fit=max",
    "logo": *[_type == "settings"][0].logo.asset->url + "?w=80&h=40&dpr=3&fit=max&q=100",
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
      defined(seo.image.asset) => seo.image.asset->url + "?w=566&h=566&dpr=2&fit=max",
      defined(hero.image.asset) => hero.image.asset->url + "?w=566&h=566&dpr=2&fit=max",
      defined(store.imageUrl) => store.imageUrl
    ),
    "dominantColor": coalesce(
      seo.image.asset->metadata.palette.dominant.background,
      hero.image.asset->metadata.palette.dominant.background
    ),
    "seoImage": seo.image.asset->url + "?w=1200&h=630&dpr=2&fit=max",
    "logo": *[_type == "settings"][0].logo.asset->url + "?w=80&h=40&dpr=3&fit=max&q=100",
    "date": coalesce(store.createdAt, _createdAt)
  }
`);

export const queryPromoBannerData = defineQuery(`
  *[_type == "promoBanner" && _id == "promoBanner"][0]{
    _id,
    enabled,
    text,
    "openInNewTab": link.openInNewTab,
    "href": select(
      link.type == "internal" => link.internal->slug.current,
      link.type == "external" => link.external,
      link.type == "email" => "mailto:" + link.email,
      link.type == "product" => "/products/" + link.product->store.slug.current,
      link.href
    ),
  }
`);

export const queryFooterData = defineQuery(`
  *[_type == "footer" && _id == "footer"][0]{
    _id,
    subtitle,
    backgroundImage {
      ${imageFields}
    },
    columns[]{
      _key,
      title,
      links[]{
        _key,
        name,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => url.internal->slug.current,
          url.type == "external" => url.external,
          url.type == "email" => "mailto:" + url.email,
          url.type == "product" => "/products/" + url.product->store.slug.current,
          url.href
        ),
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
          "href": select(
            url.type == "internal" => url.internal->slug.current,
            url.type == "external" => url.external,
            url.type == "email" => "mailto:" + url.email,
            url.type == "product" => "/products/" + url.product->store.slug.current,
            url.href
          )
        }
      },
      _type == "navbarLink" => {
        "type": "link",
        name,
        description,
        "openInNewTab": url.openInNewTab,
        "href": select(
          url.type == "internal" => url.internal->slug.current,
          url.type == "external" => url.external,
          url.type == "email" => "mailto:" + url.email,
          url.type == "product" => "/products/" + url.product->store.slug.current,
          url.href
        )
      },
      _type == "collectionGroup" => {
        "type": "collectionGroup",
        title,
        "collectionLinks": collectionLinks[]->{
          _id,
          "slug": store.slug.current,
          store{
            title,
            imageUrl
          }
        },
        "collectionProducts": collectionProducts->{
          _id,
          "slug": store.slug.current,
          store{
            title
          }
        }
      }
    },
    ${buttonsFragment},
  }
`);

export const querySitemapData = defineQuery(`{
  "slugPages": *[_type == "page" && defined(slug.current)]{
    "slug": slug.current,
    "lastModified": _updatedAt
  },
  "blogPages": *[_type == "blog" && defined(slug.current)]{
    "slug": slug.current,
    "lastModified": _updatedAt
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

// ── Product fragments ──

const productWithVariantFragment = /* groq */ `
  productWithVariant{
    product->{
      _id,
      "slug": store.slug.current,
      store{
        title,
        priceRange,
        previewImageUrl,
        gid
      }
    },
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
`;

const productHotspotsFragment = /* groq */ `
  productHotspots[]{
    _key,
    x,
    y,
    ${productWithVariantFragment}
  }
`;

const productBodyFragment = /* groq */ `
  body[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}
    },
    _type == "image" => {
      ${imageFields}
    },
    _type == "imageWithProductHotspots" => {
      _type,
      _key,
      image{${imageFields}},
      showHotspots,
      ${productHotspotsFragment}
    },
    _type == "accordion" => {
      _type,
      _key,
      groups[]{
        _key,
        title,
        body[]{
          ...,
          _type == "block" => {
            ...,
            ${markDefsFragment}
          }
        }
      }
    },
    _type == "callout" => {
      _type,
      _key,
      text
    }
  }
`;

export const queryProductByHandle = defineQuery(`
  *[_type == "product" && store.slug.current == $handle && store.status == "active"][0]{
    _id,
    _type,
    "slug": store.slug.current,
    "title": store.title,
    colorTheme->{
      _id,
      title,
      background,
      text
    },
    ${productBodyFragment},
    seo
  }
`);

export const queryProductPaths = defineQuery(`
  *[_type == "product" && defined(store.slug.current) && store.status == "active"].store.slug.current
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
      ${imageFields},
      ${productHotspotsFragment}
    }
  }
`;

export const queryCollectionByHandle = defineQuery(`
  *[_type == "collection" && store.slug.current == $handle][0]{
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
    colorTheme->{
      _id,
      title,
      background,
      text
    },
    seo
  }
`);

export const queryCollectionPaths = defineQuery(`
  *[_type == "collection" && defined(store.slug.current)].store.slug.current
`);

export const queryCollectionsIndexPageData = defineQuery(`
  *[_type == "collectionsIndex"][0]{
    ...,
    _id,
    _type,
    title,
    subtitle,
    heroTitle,
    heroImage {
      ${imageFields}
    },
    ${buttonsFragment},
    "slug": slug.current
  }
`);

export const queryAllCollections = defineQuery(`
  *[_type == "collection" && defined(store.slug.current)]{
    _id,
    _createdAt,
    "title": store.title,
    "slug": store.slug.current,
    "imageUrl": store.imageUrl,
    "description": store.descriptionHtml,
    seo
  }
`);
