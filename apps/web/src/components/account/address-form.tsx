"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useActionState, useEffect, useId } from "react";

import { type AccountFormState, saveAddress } from "@/app/account/actions";
import type { CustomerAddress } from "@/lib/customer-account/types";
import { FormStatus } from "./form-status";

const INITIAL: AccountFormState = { status: "idle" };

type Field = {
  name: keyof CustomerAddress;
  label: string;
  autoComplete: string;
  required?: boolean;
  wide?: boolean;
};

const FIELDS: Field[] = [
  { name: "firstName", label: "First name", autoComplete: "given-name" },
  { name: "lastName", label: "Last name", autoComplete: "family-name" },
  {
    name: "company",
    label: "Company",
    autoComplete: "organization",
    wide: true,
  },
  {
    name: "address1",
    label: "Address line 1",
    autoComplete: "address-line1",
    required: true,
    wide: true,
  },
  {
    name: "address2",
    label: "Address line 2",
    autoComplete: "address-line2",
    wide: true,
  },
  {
    name: "city",
    label: "City",
    autoComplete: "address-level2",
    required: true,
  },
  {
    name: "zoneCode",
    label: "County / state code",
    autoComplete: "address-level1",
  },
  { name: "zip", label: "Postcode", autoComplete: "postal-code" },
  {
    name: "territoryCode",
    label: "Country code (e.g. GB)",
    autoComplete: "country",
    required: true,
  },
  {
    name: "phoneNumber",
    label: "Phone (with country code)",
    autoComplete: "tel",
    wide: true,
  },
];

/** Adds an address, or edits `address` when given one. */
export function AddressForm({
  address,
  isDefault = false,
  onDone,
}: Readonly<{
  address?: CustomerAddress;
  isDefault?: boolean;
  onDone?: () => void;
}>) {
  const [state, action, pending] = useActionState(saveAddress, INITIAL);
  const idPrefix = useId();
  const submitLabel = address ? "Save address" : "Add address";

  useEffect(() => {
    if (state.status === "success") onDone?.();
  }, [state, onDone]);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {address && <input name="id" type="hidden" value={address.id} />}
      {FIELDS.map((field) => {
        const id = `${idPrefix}-${field.name}`;
        const value = address?.[field.name];
        return (
          <div
            className={field.wide ? "grid gap-2 sm:col-span-2" : "grid gap-2"}
            key={field.name}
          >
            <Label htmlFor={id}>{field.label}</Label>
            <Input
              autoComplete={field.autoComplete}
              defaultValue={typeof value === "string" ? value : ""}
              id={id}
              name={field.name}
              required={field.required}
            />
          </div>
        );
      })}
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          className="size-4 accent-primary"
          defaultChecked={isDefault}
          name="defaultAddress"
          type="checkbox"
        />
        Use as my default address
      </label>
      <div className="flex items-center gap-4 sm:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Saving…" : submitLabel}
        </Button>
        {onDone && (
          <Button onClick={onDone} type="button" variant="ghost">
            Cancel
          </Button>
        )}
        <FormStatus state={state} />
      </div>
    </form>
  );
}
