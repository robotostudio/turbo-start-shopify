import { Button } from "@workspace/ui/components/button";

/** A form, not a link: sign-out is a POST so other sites cannot trigger it. */
export function SignOutButton() {
  return (
    <form action="/account/logout" method="post">
      <Button size="sm" type="submit" variant="outline">
        Sign out
      </Button>
    </form>
  );
}
