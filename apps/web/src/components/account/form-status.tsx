import { cn } from "@workspace/ui/lib/utils";

import type { AccountFormState } from "@/app/account/actions";

export function FormStatus({ state }: Readonly<{ state: AccountFormState }>) {
  if (state.status === "idle" || !state.message) return null;
  return (
    <p
      className={cn(
        "text-sm",
        state.status === "error" ? "text-destructive" : "text-muted-foreground"
      )}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}
