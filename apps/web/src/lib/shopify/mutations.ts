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

const CART_MUTATION_RESULT_FRAGMENT = /* graphql */ `
  userErrors {
    field
    message
    code
  }
  warnings {
    code
    message
    target
  }
`;

export const CART_CREATE_MUTATION = /* graphql */ `
  ${CART_FRAGMENT}
  mutation CartCreate(
    $lines: [CartLineInput!]!
    $buyerIdentity: CartBuyerIdentityInput
  ) {
    cartCreate(input: { lines: $lines, buyerIdentity: $buyerIdentity }) {
      cart {
        ...CartFields
      }
      ${CART_MUTATION_RESULT_FRAGMENT}
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
      ${CART_MUTATION_RESULT_FRAGMENT}
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
      ${CART_MUTATION_RESULT_FRAGMENT}
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
      ${CART_MUTATION_RESULT_FRAGMENT}
    }
  }
`;

/**
 * Attaches a signed-in customer to a cart, so checkout opens signed in. The
 * token is the Customer Account API access token.
 */
export const CART_BUYER_IDENTITY_UPDATE_MUTATION = /* graphql */ `
  mutation CartBuyerIdentityUpdate(
    $cartId: ID!
    $buyerIdentity: CartBuyerIdentityInput!
  ) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;
