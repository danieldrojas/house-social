"use client";

import { useActionState, useState } from "react";
import { createPostAction, type ActionState } from "@/app/actions/posts";
import { compressImageFile } from "@/lib/compress-image";
import { Button, Input, Label, Textarea } from "@/components/ui";

export function PostForm({ houseId }: { houseId: string }) {
  const [state, formAction, pending] = useActionState(createPostAction, {});
  const [preparing, setPreparing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const image = fd.get("image");

    if (!(image instanceof File) || image.size === 0) {
      setLocalError("Add a photo to your post.");
      return;
    }

    try {
      setPreparing(true);
      const compressed = await compressImageFile(image);
      fd.set("image", compressed);
    } catch {
      setLocalError("Could not process that image. Try a JPEG or PNG.");
      setPreparing(false);
      return;
    } finally {
      setPreparing(false);
    }

    formAction(fd);
  }

  const busy = pending || preparing;
  const error = localError || state.error;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="houseId" value={houseId} />
      <div>
        <Label htmlFor="image">Photo</Label>
        <Input id="image" name="image" type="file" accept="image/*" required />
        <p className="mt-1 text-xs text-stone-500">
          Large phone photos are compressed before upload.
        </p>
      </div>
      <div>
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          name="caption"
          placeholder="What did you do? What do you love about this space?"
          maxLength={1000}
        />
      </div>
      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={busy}>
        {preparing ? "Preparing photo…" : pending ? "Posting…" : "Share post"}
      </Button>
    </form>
  );
}
