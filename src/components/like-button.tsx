"use client";

import { useTransition } from "react";
import { toggleLikeAction } from "@/app/actions/posts";
import { cn } from "@/lib/utils";

export function LikeButton({
  postId,
  liked,
  count,
}: {
  postId: string;
  liked: boolean;
  count: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleLikeAction(postId))}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium transition",
        liked
          ? "bg-rose-50 text-rose-600"
          : "text-stone-600 hover:bg-stone-100",
        pending && "opacity-60",
      )}
    >
      <span aria-hidden>{liked ? "♥" : "♡"}</span>
      {count}
    </button>
  );
}
