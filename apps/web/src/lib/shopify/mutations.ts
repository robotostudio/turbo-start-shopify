const CART_FRAGMENT = /* graphql */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              image {
                url
                altText
                width
                height
              }
              product {
                handle
                title
              }
              selectedOptions {
                name
                value
              }
              price {
                amount
                currencyCode
              }
            }
          }
          cost {
            amountPerQuantity {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    cost {
      totalAmount {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
  }
`;

export const CART_CREATE_MUTATION = /* graphql */ `
  ${CART_FRAGMENT}
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFields
      }
    }
  }
`;

export const CART_QUERY = /* graphql */ `
  ${CART_FRAGMENT}
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`;

export const CART_LINES_ADD_MUTATION = /* graphql */ `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = /* graphql */ `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = /* graphql */ `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
    }
  }
`;
