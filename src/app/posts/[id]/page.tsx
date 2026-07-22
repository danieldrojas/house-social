import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime, houseTypeLabel } from "@/lib/utils";
import { LikeButton } from "@/components/like-button";
import { CommentForm } from "@/components/comment-form";
import { Card } from "@/components/ui";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      house: {
        select: { id: true, name: true, type: true, town: true },
      },
      _count: { select: { likes: true, comments: true } },
      likes: {
        where: { userId: user.id },
        select: { userId: true },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!post) notFound();

  return (
    <div className="page-shell max-w-xl">
      <Card className="overflow-hidden">
        <div className="border-b border-stone-100 px-4 py-3">
          <Link
            href={`/houses/${post.house.id}`}
            className="font-semibold hover:underline"
          >
            {post.house.name}
          </Link>
          <p className="text-xs text-stone-500">
            {houseTypeLabel(post.house.type)}
            {post.house.town ? ` · ${post.house.town}` : ""} ·{" "}
            {post.author.name} · {formatRelativeTime(post.createdAt)}
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.imageUrl}
          alt={post.caption ?? "Post"}
          className="w-full bg-stone-100 object-cover"
        />
        <div className="space-y-3 p-4">
          <LikeButton
            postId={post.id}
            liked={post.likes.length > 0}
            count={post._count.likes}
          />
          {post.caption && (
            <p className="text-sm whitespace-pre-wrap">
              <span className="font-semibold">{post.author.name}</span>{" "}
              {post.caption}
            </p>
          )}
        </div>
      </Card>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Comments ({post.comments.length})
        </h2>
        <div className="mb-4">
          <CommentForm postId={post.id} />
        </div>
        <div className="space-y-3">
          {post.comments.length === 0 ? (
            <p className="text-sm text-stone-500">No comments yet.</p>
          ) : (
            post.comments.map((c) => (
              <Card key={c.id} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">{c.user.name}</p>
                  <span className="text-xs text-stone-400">
                    {formatRelativeTime(c.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-stone-700 whitespace-pre-wrap">
                  {c.body}
                </p>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
