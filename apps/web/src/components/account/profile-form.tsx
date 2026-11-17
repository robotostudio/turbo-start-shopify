"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useActionState } from "react";

import { type AccountFormState, updateProfile } from "@/app/account/actions";
import { FormStatus } from "./form-status";

const INITIAL: AccountFormState = { status: "idle" };

export function ProfileForm({
  firstName,
  lastName,
  email,
}: Readonly<{
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}>) {
  const [state, action, pending] = useActionState(updateProfile, INITIAL);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="firstName">First name</Label>
        <Input
          autoComplete="given-name"
          defaultValue={firstName ?? ""}
          id="firstName"
          name="firstName"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lastName">Last name</Label>
        <Input
          autoComplete="family-name"
          defaultValue={lastName ?? ""}
          id="lastName"
          name="lastName"
        />
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="email">Email</Label>
        <Input disabled id="email" value={email ?? ""} />
        <p className="text-muted-foreground text-xs">
          Your email is how you sign in, so it is managed by the store.
        </p>
      </div>
      <div className="flex items-center gap-4 sm:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Saving…" : "Save profile"}
        </Button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
