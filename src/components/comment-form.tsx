"use client";

import { useActionState, useRef, useEffect } from "react";
import { addCommentAction, type ActionState } from "@/app/actions/posts";
import { Button, Input } from "@/components/ui";

export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(addCommentAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error && !pending) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={formAction} className="flex gap-2">
      <input type="hidden" name="postId" value={postId} />
      <Input
        name="body"
        required
        maxLength={500}
        placeholder="Add a comment…"
        className="flex-1"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "…" : "Post"}
      </Button>
      {state.error && (
        <p className="sr-only" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
