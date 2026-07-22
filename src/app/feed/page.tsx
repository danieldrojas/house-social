import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/post-card";
import { Button, Card } from "@/components/ui";

export default async function FeedPage() {
  const user = await requireUser();

  const follows = await prisma.follow.findMany({
    where: { userId: user.id },
    select: { houseId: true },
  });
  const houseIds = follows.map((f) => f.houseId);

  const posts =
    houseIds.length === 0
      ? []
      : await prisma.post.findMany({
          where: { houseId: { in: houseIds } },
          orderBy: { createdAt: "desc" },
          take: 40,
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
        });

  return (
    <div className="page-shell max-w-xl">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your feed</h1>
          <p className="text-sm text-stone-500">
            Updates from houses you follow
          </p>
        </div>
        <Link href="/explore">
          <Button variant="secondary">Explore</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-lg font-medium text-stone-900">
            Your feed is quiet
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Follow some houses on Explore, or create your first house page.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/explore">
              <Button variant="secondary">Explore houses</Button>
            </Link>
            <Link href="/houses/new">
              <Button>Create a house</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                ...post,
                likedByMe: post.likes.length > 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
