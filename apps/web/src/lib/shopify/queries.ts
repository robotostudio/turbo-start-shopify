const VARIANT_FRAGMENT = /* graphql */ `
  fragment VariantFields on ProductVariant {
    id
    title
    availableForSale
    sku
    quantityAvailable
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    selectedOptions {
      name
      value
    }
    image {
      url
      altText
      width
      height
    }
  }
`;

/**
 * Variant selection shared by every product-card query. `image` is what lets a
 * card swap its photo when a color swatch is picked.
 */
const CARD_VARIANT_FIELDS = /* graphql */ `
  id
  availableForSale
  quantityAvailable
  price {
    amount
    currencyCode
  }
  selectedOptions {
    name
    value
  }
  image {
    url
  }
`;

/**
 * Product gallery window for cards. Wide enough to locate the image following a
 * variant's image, which the card uses as the hover cross-fade partner.
 */
const CARD_GALLERY_SIZE = 20;

/**
 * Card image selection. Cards render with `fill` and alt from the product
 * title, so `url` is the only field any card path reads — worth keeping narrow
 * given the gallery window above multiplies it by 20 per product.
 */
const CARD_IMAGE_FIELDS = /* graphql */ `
  url
`;

const PRODUCT_FIELDS_FRAGMENT = /* graphql */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    updatedAt
    vendor
    productType
    tags
    collections(first: 20) {
      edges {
        node {
          handle
        }
      }
    }
    options {
      id
      name
      values
    }
    seo {
      title
      description
    }
    featuredImage {
      url
      altText
      width
      height
    }
    metafields(
      identifiers: [
        { namespace: "custom", key: "details" }
        { namespace: "custom", key: "fit_sizing" }
        { namespace: "custom", key: "materials" }
        { namespace: "custom", key: "shipping" }
      ]
    ) {
      key
      namespace
      value
      type
    }
  }
`;

export const PRODUCT_QUERY = /* graphql */ `
  ${VARIANT_FRAGMENT}
  ${PRODUCT_FIELDS_FRAGMENT}
  query Product($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
      variants(first: 250) {
        edges {
          node {
            ...VariantFields
          }
        }
      }
      images(first: 20) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

export const COLLECTION_QUERY = /* graphql */ `
  query Collection(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      products(
        first: $first
        after: $after
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        edges {
          node {
            id
            handle
            title
            vendor
            productType
            tags
            options {
              id
              name
              values
            }
            featuredImage {
              url
              altText
              width
              height
            }
            images(first: ${CARD_GALLERY_SIZE}) {
              edges {
                node {
          ${CARD_IMAGE_FIELDS}
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 100) {
              edges {
                node {
                  ${CARD_VARIANT_FIELDS}
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const RECOMMENDED_PRODUCTS_QUERY = /* graphql */ `
  ${VARIANT_FRAGMENT}
  query RecommendedProducts($productId: ID!) {
    productRecommendations(productId: $productId) {
      id
      handle
      title
      vendor
      productType
      featuredImage {
        url
        altText
        width
        height
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 1) {
        edges {
          node {
            ...VariantFields
          }
        }
      }
    }
  }
`;

/** Shared node selection for product-card data (used by featured queries). */
const PRODUCT_CARD_FIELDS = /* graphql */ `
  id
  handle
  title
  vendor
  tags
  availableForSale
  totalInventory
  options {
    id
    name
    values
  }
  variants(first: 100) {
    edges {
      node {
        ${CARD_VARIANT_FIELDS}
      }
    }
  }
  featuredImage {
    url
    altText
    width
    height
  }
  images(first: ${CARD_GALLERY_SIZE}) {
    edges {
      node {
          ${CARD_IMAGE_FIELDS}
      }
    }
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  compareAtPriceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
`;

export const FEATURED_PRODUCTS_QUERY = /* graphql */ `
  query FeaturedProducts($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      edges {
        node {
          ${PRODUCT_CARD_FIELDS}
        }
      }
    }
  }
`;

export const PRODUCTS_BY_HANDLES_QUERY = /* graphql */ `
  query ProductsByHandles($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          ${PRODUCT_CARD_FIELDS}
        }
      }
    }
  }
`;

export const RELATED_PRODUCTS_QUERY = /* graphql */ `
  query RelatedProducts($productId: ID!) {
    productRecommendations(productId: $productId) {
      ${PRODUCT_CARD_FIELDS}
    }
  }
`;

export const ALL_COLLECTIONS_QUERY = /* graphql */ `
  query AllCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

export const SEARCH_PRODUCTS_QUERY = /* graphql */ `
  query SearchProducts($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: PRODUCT) {
      edges {
        node {
          ... on Product {
            id
            handle
            title
            vendor
            productType
            tags
            options {
              id
              name
              values
            }
            featuredImage {
              url
              altText
              width
              height
            }
            images(first: ${CARD_GALLERY_SIZE}) {
              edges {
                node {
          ${CARD_IMAGE_FIELDS}
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 100) {
              edges {
                node {
                  ${CARD_VARIANT_FIELDS}
                }
              }
            }
          }
        }
      }
      totalCount
    }
  }
`;

export const PREDICTIVE_SEARCH_QUERY = /* graphql */ `
  query PredictiveSearch($query: String!, $limit: Int!) {
    predictiveSearch(
      query: $query
      limit: $limit
      limitScope: EACH
      types: [PRODUCT, COLLECTION, QUERY]
    ) {
      products {
        id
        handle
        title
        vendor
        productType
        tags
        options {
          id
          name
          values
        }
        featuredImage {
          url
          altText
          width
          height
        }
        images(first: ${CARD_GALLERY_SIZE}) {
          edges {
            node {
          ${CARD_IMAGE_FIELDS}
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 100) {
          edges {
            node {
              ${CARD_VARIANT_FIELDS}
            }
          }
        }
      }
      collections {
        id
        handle
        title
        image {
          url
          altText
          width
          height
        }
      }
      queries {
        text
      }
    }
  }
`;

export const BEST_SELLING_PRODUCTS_QUERY = /* graphql */ `
  query BestSellingProducts($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      edges {
        node {
          id
          handle
          title
          vendor
          productType
          tags
          options {
            id
            name
            values
          }
          featuredImage {
            url
            altText
            width
            height
          }
          images(first: ${CARD_GALLERY_SIZE}) {
            edges {
              node {
          ${CARD_IMAGE_FIELDS}
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 100) {
            edges {
              node {
                ${CARD_VARIANT_FIELDS}
              }
            }
          }
        }
      }
    }
  }
`;

export const PRODUCT_BY_ID_QUERY = /* graphql */ `
  query ProductById($id: ID!) {
    product(id: $id) {
      id
      handle
      title
      vendor
      featuredImage {
        url
        altText
        width
        height
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 1) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = /* graphql */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      vendor
      productType
      tags
      options {
        id
        name
        values
      }
      featuredImage {
        url
        altText
        width
        height
      }
      images(first: ${CARD_GALLERY_SIZE}) {
        edges {
          node {
          ${CARD_IMAGE_FIELDS}
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 100) {
        edges {
          node {
            ${CARD_VARIANT_FIELDS}
          }
        }
      }
    }
  }
`;
