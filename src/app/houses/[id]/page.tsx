import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  houseTypeBadgeClass,
  houseTypeLabel,
  parseTags,
} from "@/lib/utils";
import { FollowButton } from "@/components/follow-button";
import { PostCard } from "@/components/post-card";
import { Button, Card } from "@/components/ui";

export default async function HousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const house = await prisma.house.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true } },
      _count: { select: { follows: true, posts: true } },
      follows: {
        where: { userId: user.id },
        select: { userId: true },
      },
      posts: {
        orderBy: { createdAt: "desc" },
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
        },
      },
    },
  });

  if (!house) notFound();

  const isOwner = house.creatorId === user.id;
  const following = house.follows.length > 0;
  const tags = parseTags(house.tags);

  return (
    <div className="page-shell">
      <Card className="overflow-hidden">
        <div className="relative h-48 bg-stone-100 sm:h-64">
          {house.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={house.coverUrl}
              alt={house.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-200 to-amber-100 text-6xl text-stone-400">
              ⌂
            </div>
          )}
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${houseTypeBadgeClass(house.type)}`}
                >
                  {houseTypeLabel(house.type)}
                </span>
                {house.town && (
                  <span className="text-sm text-stone-500">{house.town}</span>
                )}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {house.name}
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                by {house.creator.name} · {house._count.follows} followers ·{" "}
                {house._count.posts} posts
              </p>
            </div>
            <div className="flex gap-2">
              {isOwner ? (
                <Link href={`/houses/${house.id}/post`}>
                  <Button>New post</Button>
                </Link>
              ) : (
                <FollowButton houseId={house.id} following={following} />
              )}
            </div>
          </div>

          {house.bio && (
            <p className="text-stone-700 whitespace-pre-wrap">{house.bio}</p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      <section className="mx-auto mt-8 max-w-xl space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Posts
        </h2>
        {house.posts.length === 0 ? (
          <Card className="p-8 text-center text-sm text-stone-500">
            No posts yet.
            {isOwner && " Share the first update!"}
          </Card>
        ) : (
          house.posts.map((post) => (
            <PostCard
              key={post.id}
              showHouse={false}
              post={{
                ...post,
                likedByMe: post.likes.length > 0,
              }}
            />
          ))
        )}
      </section>
    </div>
  );
}
