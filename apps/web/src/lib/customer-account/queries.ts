/**
 * Customer Account API operations. Validated against the 2026-04 schema.
 * The endpoint (and so the version) comes from Shopify's discovery document.
 */

const MONEY_FRAGMENT = /* graphql */ `
  fragment MoneyFields on MoneyV2 {
    amount
    currencyCode
  }
`;

const ADDRESS_FRAGMENT = /* graphql */ `
  fragment AddressFields on CustomerAddress {
    id
    firstName
    lastName
    company
    address1
    address2
    city
    zoneCode
    territoryCode
    zip
    phoneNumber
    formatted
  }
`;

const ORDER_SUMMARY_FRAGMENT = /* graphql */ `
  fragment OrderSummaryFields on Order {
    id
    name
    processedAt
    cancelledAt
    financialStatus
    fulfillmentStatus
    totalPrice {
      ...MoneyFields
    }
    lineItems(first: 3) {
      nodes {
        id
        name
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

export const CUSTOMER_OVERVIEW_QUERY = /* graphql */ `
  ${MONEY_FRAGMENT}
  ${ADDRESS_FRAGMENT}
  ${ORDER_SUMMARY_FRAGMENT}
  query CustomerOverview {
    customer {
      id
      firstName
      lastName
      displayName
      emailAddress {
        emailAddress
      }
      defaultAddress {
        ...AddressFields
      }
      orders(first: 3, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          ...OrderSummaryFields
        }
      }
    }
  }
`;

export const CUSTOMER_ORDERS_QUERY = /* graphql */ `
  ${MONEY_FRAGMENT}
  ${ORDER_SUMMARY_FRAGMENT}
  query CustomerOrders($first: Int!, $after: String) {
    customer {
      orders(
        first: $first
        after: $after
        sortKey: PROCESSED_AT
        reverse: true
      ) {
        nodes {
          ...OrderSummaryFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const CUSTOMER_ORDER_QUERY = /* graphql */ `
  ${MONEY_FRAGMENT}
  query CustomerOrder($id: ID!) {
    order(id: $id) {
      id
      name
      processedAt
      cancelledAt
      cancelReason
      financialStatus
      fulfillmentStatus
      statusPageUrl
      subtotal {
        ...MoneyFields
      }
      totalShipping {
        ...MoneyFields
      }
      totalTax {
        ...MoneyFields
      }
      totalPrice {
        ...MoneyFields
      }
      shippingAddress {
        name
        formatted
      }
      lineItems(first: 100) {
        nodes {
          id
          name
          variantTitle
          quantity
          sku
          image {
            url
            altText
            width
            height
          }
          price {
            ...MoneyFields
          }
          totalPrice {
            ...MoneyFields
          }
        }
      }
      fulfillments(first: 20, sortKey: CREATED_AT) {
        nodes {
          id
          createdAt
          status
          latestShipmentStatus
          trackingInformation {
            company
            number
            url
          }
          fulfillmentLineItems(first: 100) {
            nodes {
              id
              quantity
              lineItem {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`;

export const CUSTOMER_PROFILE_QUERY = /* graphql */ `
  ${ADDRESS_FRAGMENT}
  query CustomerProfile {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      defaultAddress {
        id
      }
      addresses(first: 50) {
        nodes {
          ...AddressFields
        }
      }
    }
  }
`;

const USER_ERRORS = /* graphql */ `
  userErrors {
    field
    message
    code
  }
`;

export const CUSTOMER_UPDATE_MUTATION = /* graphql */ `
  mutation CustomerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        id
      }
      ${USER_ERRORS}
    }
  }
`;

export const CUSTOMER_ADDRESS_CREATE_MUTATION = /* graphql */ `
  mutation CustomerAddressCreate(
    $address: CustomerAddressInput!
    $defaultAddress: Boolean
  ) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
      }
      ${USER_ERRORS}
    }
  }
`;

export const CUSTOMER_ADDRESS_UPDATE_MUTATION = /* graphql */ `
  mutation CustomerAddressUpdate(
    $addressId: ID!
    $address: CustomerAddressInput
    $defaultAddress: Boolean
  ) {
    customerAddressUpdate(
      addressId: $addressId
      address: $address
      defaultAddress: $defaultAddress
    ) {
      customerAddress {
        id
      }
      ${USER_ERRORS}
    }
  }
`;

export const CUSTOMER_ADDRESS_DELETE_MUTATION = /* graphql */ `
  mutation CustomerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      ${USER_ERRORS}
    }
  }
`;
