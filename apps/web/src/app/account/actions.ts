"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  type CustomerAccountQueryResult,
  customerAccountQuery,
} from "@/lib/customer-account/client";
import {
  CUSTOMER_ADDRESS_CREATE_MUTATION,
  CUSTOMER_ADDRESS_DELETE_MUTATION,
  CUSTOMER_ADDRESS_UPDATE_MUTATION,
  CUSTOMER_UPDATE_MUTATION,
} from "@/lib/customer-account/queries";
import { loginPath } from "@/lib/customer-account/session";
import type { CustomerUserError } from "@/lib/customer-account/types";

export type AccountFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const PROFILE_PATH = "/account/profile";

const optionalText = z
  .string()
  .trim()
  .max(255)
  .transform((value) => value || null);

const profileSchema = z.object({
  firstName: optionalText,
  lastName: optionalText,
});

const addressSchema = z.object({
  firstName: optionalText,
  lastName: optionalText,
  company: optionalText,
  address1: z.string().trim().min(1, "Address line 1 is required").max(255),
  address2: optionalText,
  city: z.string().trim().min(1, "City is required").max(255),
  zoneCode: optionalText,
  territoryCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Country must be a two-letter code, e.g. GB")
    .transform((value) => value.toUpperCase()),
  zip: optionalText,
  phoneNumber: optionalText,
});

const idSchema = z.string().startsWith("gid://shopify/");

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/**
 * Turns a Customer Account API result into form state. A rejected session
 * sends the customer to sign in and back to the profile page.
 */
function settle<T>(
  result: CustomerAccountQueryResult<T>,
  userErrors: (data: T) => CustomerUserError[] | undefined,
  successMessage: string
): AccountFormState {
  if (!result.ok) {
    if (result.kind === "unauthorized") redirect(loginPath(PROFILE_PATH));
    return { status: "error", message: "Something went wrong. Try again." };
  }
  const errors = userErrors(result.data) ?? [];
  if (errors.length > 0) {
    return {
      status: "error",
      message: errors.map((error) => error.message).join(" "),
    };
  }
  revalidatePath("/account", "layout");
  return { status: "success", message: successMessage };
}

export async function updateProfile(
  _previous: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const parsed = profileSchema.safeParse({
    firstName: text(formData, "firstName"),
    lastName: text(formData, "lastName"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }
  const result = await customerAccountQuery<{
    customerUpdate: { userErrors: CustomerUserError[] } | null;
  }>(CUSTOMER_UPDATE_MUTATION, { variables: { input: parsed.data } });
  return settle(
    result,
    (data) => data.customerUpdate?.userErrors,
    "Profile saved."
  );
}

/** Creates an address, or updates one when the form carries an `id`. */
export async function saveAddress(
  _previous: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const parsed = addressSchema.safeParse(
    Object.fromEntries(
      Object.keys(addressSchema.shape).map((key) => [key, text(formData, key)])
    )
  );
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }
  const defaultAddress = formData.get("defaultAddress") === "on";
  const id = text(formData, "id");

  if (id) {
    if (!idSchema.safeParse(id).success) {
      return { status: "error", message: "Unknown address." };
    }
    const result = await customerAccountQuery<{
      customerAddressUpdate: { userErrors: CustomerUserError[] } | null;
    }>(CUSTOMER_ADDRESS_UPDATE_MUTATION, {
      variables: { addressId: id, address: parsed.data, defaultAddress },
    });
    return settle(
      result,
      (data) => data.customerAddressUpdate?.userErrors,
      "Address saved."
    );
  }

  const result = await customerAccountQuery<{
    customerAddressCreate: { userErrors: CustomerUserError[] } | null;
  }>(CUSTOMER_ADDRESS_CREATE_MUTATION, {
    variables: { address: parsed.data, defaultAddress },
  });
  return settle(
    result,
    (data) => data.customerAddressCreate?.userErrors,
    "Address added."
  );
}

export async function deleteAddress(
  _previous: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const id = idSchema.safeParse(text(formData, "id"));
  if (!id.success) return { status: "error", message: "Unknown address." };
  const result = await customerAccountQuery<{
    customerAddressDelete: { userErrors: CustomerUserError[] } | null;
  }>(CUSTOMER_ADDRESS_DELETE_MUTATION, { variables: { addressId: id.data } });
  return settle(
    result,
    (data) => data.customerAddressDelete?.userErrors,
    "Address removed."
  );
}

export async function setDefaultAddress(
  _previous: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const id = idSchema.safeParse(text(formData, "id"));
  if (!id.success) return { status: "error", message: "Unknown address." };
  const result = await customerAccountQuery<{
    customerAddressUpdate: { userErrors: CustomerUserError[] } | null;
  }>(CUSTOMER_ADDRESS_UPDATE_MUTATION, {
    variables: { addressId: id.data, defaultAddress: true },
  });
  return settle(
    result,
    (data) => data.customerAddressUpdate?.userErrors,
    "Default address updated."
  );
}
