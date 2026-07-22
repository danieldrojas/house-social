"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { saveImageFile } from "@/lib/uploads";

const houseSchema = z.object({
  name: z.string().min(2).max(80),
  type: z.enum(["HOME", "PROJECT", "DREAM"]),
  town: z.string().max(80).optional(),
  bio: z.string().max(500).optional(),
  tags: z.string().max(200).optional(),
});

export type ActionState = {
  error?: string;
};

export async function createHouseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = houseSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    town: formData.get("town") || undefined,
    bio: formData.get("bio") || undefined,
    tags: formData.get("tags") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid house details" };
  }

  let coverUrl: string | undefined;
  const cover = formData.get("cover") as File | null;
  if (cover && cover.size > 0) {
    try {
      coverUrl = await saveImageFile(cover);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Cover upload failed" };
    }
  }

  const house = await prisma.house.create({
    data: {
      name: parsed.data.name.trim(),
      type: parsed.data.type,
      town: parsed.data.town?.trim() || null,
      bio: parsed.data.bio?.trim() || null,
      tags: parsed.data.tags?.trim() || null,
      coverUrl: coverUrl ?? null,
      creatorId: user.id!,
      follows: {
        create: { userId: user.id! },
      },
    },
  });

  revalidatePath("/feed");
  revalidatePath("/explore");
  redirect(`/houses/${house.id}`);
}

export async function toggleFollowAction(houseId: string) {
  const user = await requireUser();

  const existing = await prisma.follow.findUnique({
    where: {
      userId_houseId: { userId: user.id!, houseId },
    },
  });

  if (existing) {
    await prisma.follow.delete({
      where: { userId_houseId: { userId: user.id!, houseId } },
    });
  } else {
    await prisma.follow.create({
      data: { userId: user.id!, houseId },
    });
  }

  revalidatePath(`/houses/${houseId}`);
  revalidatePath("/feed");
  revalidatePath("/explore");
}
