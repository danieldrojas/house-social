"use client";

import { useTransition } from "react";
import { toggleFollowAction } from "@/app/actions/houses";
import { Button } from "@/components/ui";

export function FollowButton({
  houseId,
  following,
}: {
  houseId: string;
  following: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={following ? "secondary" : "primary"}
      disabled={pending}
      onClick={() => startTransition(() => toggleFollowAction(houseId))}
    >
      {pending ? "…" : following ? "Following" : "Follow"}
    </Button>
  );
}
