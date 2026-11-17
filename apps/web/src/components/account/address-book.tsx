"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { useActionState, useState } from "react";

import {
  type AccountFormState,
  deleteAddress,
  setDefaultAddress,
} from "@/app/account/actions";
import type { CustomerAddress } from "@/lib/customer-account/types";
import { AddressForm } from "./address-form";
import { FormStatus } from "./form-status";

const INITIAL: AccountFormState = { status: "idle" };

function AddressCard({
  address,
  isDefault,
}: Readonly<{
  address: CustomerAddress;
  isDefault: boolean;
}>) {
  const [editing, setEditing] = useState(false);
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteAddress,
    INITIAL
  );
  const [defaultState, defaultAction, settingDefault] = useActionState(
    setDefaultAddress,
    INITIAL
  );

  if (editing) {
    return (
      <li className="rounded-lg border p-4 sm:col-span-2">
        <AddressForm
          address={address}
          isDefault={isDefault}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <address className="text-sm not-italic leading-relaxed">
          {address.formatted.map((line) => (
            <span className="block" key={line}>
              {line}
            </span>
          ))}
        </address>
        {isDefault && <Badge variant="secondary">Default</Badge>}
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        <Button onClick={() => setEditing(true)} size="sm" variant="outline">
          Edit
        </Button>
        {!isDefault && (
          <form action={defaultAction}>
            <input name="id" type="hidden" value={address.id} />
            <Button
              disabled={settingDefault}
              size="sm"
              type="submit"
              variant="ghost"
            >
              Make default
            </Button>
          </form>
        )}
        <form action={deleteAction}>
          <input name="id" type="hidden" value={address.id} />
          <Button disabled={deleting} size="sm" type="submit" variant="ghost">
            {deleting ? "Removing…" : "Remove"}
          </Button>
        </form>
      </div>
      <FormStatus state={deleteState} />
      <FormStatus state={defaultState} />
    </li>
  );
}

export function AddressBook({
  addresses,
  defaultAddressId,
}: Readonly<{
  addresses: CustomerAddress[];
  defaultAddressId: string | null;
}>) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="grid gap-6">
      {addresses.length === 0 && !adding && (
        <p className="text-muted-foreground text-sm">
          No saved addresses yet. Addresses you add here are offered at
          checkout.
        </p>
      )}
      {addresses.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              address={address}
              isDefault={address.id === defaultAddressId}
              key={address.id}
            />
          ))}
        </ul>
      )}
      {adding ? (
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 font-medium">New address</h3>
          <AddressForm
            isDefault={addresses.length === 0}
            onDone={() => setAdding(false)}
          />
        </div>
      ) : (
        <div>
          <Button onClick={() => setAdding(true)} variant="outline">
            Add address
          </Button>
        </div>
      )}
    </div>
  );
}
