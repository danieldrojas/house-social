"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { saveImageFile } from "@/lib/uploads";

export type ActionState = {
  error?: string;
};

export async function createPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const houseId = String(formData.get("houseId") ?? "");
  const caption = String(formData.get("caption") ?? "").trim();

  if (!houseId) return { error: "Missing house." };

  const house = await prisma.house.findUnique({ where: { id: houseId } });
  if (!house) return { error: "House not found." };
  if (house.creatorId !== user.id) {
    return { error: "Only the house creator can post here (for now)." };
  }

  const image = formData.get("image") as File | null;
  if (!image || image.size === 0) {
    return { error: "Add a photo to your post." };
  }

  let imageUrl: string;
  try {
    imageUrl = await saveImageFile(image);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }

  if (caption.length > 1000) {
    return { error: "Caption is too long." };
  }

  const post = await prisma.post.create({
    data: {
      houseId,
      authorId: user.id!,
      caption: caption || null,
      imageUrl,
    },
  });

  revalidatePath(`/houses/${houseId}`);
  revalidatePath("/feed");
  revalidatePath("/explore");
  redirect(`/posts/${post.id}`);
}

export async function toggleLikeAction(postId: string) {
  const user = await requireUser();

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: user.id!, postId } },
  });

  if (existing) {
    await prisma.like.delete({
      where: { userId_postId: { userId: user.id!, postId } },
    });
  } else {
    await prisma.like.create({
      data: { userId: user.id!, postId },
    });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  revalidatePath(`/posts/${postId}`);
  if (post) {
    revalidatePath(`/houses/${post.houseId}`);
  }
  revalidatePath("/feed");
  revalidatePath("/explore");
}

const commentSchema = z.object({
  body: z.string().min(1).max(500),
});

export async function addCommentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const postId = String(formData.get("postId") ?? "");
  const parsed = commentSchema.safeParse({ body: formData.get("body") });

  if (!postId) return { error: "Missing post." };
  if (!parsed.success) return { error: "Comment must be 1–500 characters." };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Post not found." };

  await prisma.comment.create({
    data: {
      postId,
      userId: user.id!,
      body: parsed.data.body.trim(),
    },
  });

  revalidatePath(`/posts/${postId}`);
  revalidatePath(`/houses/${post.houseId}`);
  revalidatePath("/feed");
  return {};
}
