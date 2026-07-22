"use client";

import { useActionState, useState } from "react";
import {
  createHouseAction,
  type ActionState,
} from "@/app/actions/houses";
import { compressImageFile } from "@/lib/compress-image";
import { Button, Input, Label, Textarea } from "@/components/ui";

export function HouseForm() {
  const [state, formAction, pending] = useActionState(createHouseAction, {});
  const [preparing, setPreparing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const cover = fd.get("cover");

    if (cover instanceof File && cover.size > 0) {
      try {
        setPreparing(true);
        const compressed = await compressImageFile(cover);
        fd.set("cover", compressed);
      } catch {
        setLocalError("Could not process that image. Try a JPEG or PNG.");
        setPreparing(false);
        return;
      } finally {
        setPreparing(false);
      }
    }

    formAction(fd);
  }

  const busy = pending || preparing;
  const error = localError || state.error;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">House name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Sunlit Cottage"
          maxLength={80}
        />
      </div>

      <div>
        <Label htmlFor="type">What kind of page is this?</Label>
        <select
          id="type"
          name="type"
          required
          defaultValue="HOME"
          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-900/10"
        >
          <option value="HOME">My home — showcase where I live</option>
          <option value="PROJECT">Project — something I did / am doing</option>
          <option value="DREAM">Dream / inspo — a house vibe I love</option>
        </select>
      </div>

      <div>
        <Label htmlFor="town">Town (optional)</Label>
        <Input id="town" name="town" placeholder="Austin" maxLength={80} />
        <p className="mt-1 text-xs text-stone-500">
          No street address — just a town if you want.
        </p>
      </div>

      <div>
        <Label htmlFor="bio">About this house</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Cozy mid-century reno with a plant problem…"
          maxLength={500}
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (optional, comma-separated)</Label>
        <Input
          id="tags"
          name="tags"
          placeholder="kitchen, diy, plants, beforeafter"
          maxLength={200}
        />
      </div>

      <div>
        <Label htmlFor="cover">Cover photo (optional)</Label>
        <Input id="cover" name="cover" type="file" accept="image/*" />
        <p className="mt-1 text-xs text-stone-500">
          Photos are compressed automatically (JPEG/PNG/WebP work best).
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={busy}>
        {preparing ? "Preparing photo…" : pending ? "Creating…" : "Create house page"}
      </Button>
    </form>
  );
}
