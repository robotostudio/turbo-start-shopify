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

const PRODUCT_FIELDS_FRAGMENT = /* graphql */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    vendor
    productType
    tags
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
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                  quantityAvailable
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

export const VARIANT_INVENTORY_QUERY = /* graphql */ `
  query VariantInventory($id: ID!) {
    node(id: $id) {
      ... on ProductVariant {
        id
        availableForSale
        quantityAvailable
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

export const FEATURED_PRODUCTS_QUERY = /* graphql */ `
  query FeaturedProducts($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      edges {
        node {
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
        }
      }
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
                  availableForSale
                  quantityAvailable
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
            availableForSale
          }
        }
      }
    }
  }
`;
