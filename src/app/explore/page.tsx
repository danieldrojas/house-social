import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { HouseCard } from "@/components/house-card";
import { PostCard } from "@/components/post-card";

export default async function ExplorePage() {
  const user = await requireUser();

  const [houses, posts] = await Promise.all([
    prisma.house.findMany({
      orderBy: [{ follows: { _count: "desc" } }, { createdAt: "desc" }],
      take: 24,
      include: {
        creator: { select: { name: true } },
        _count: { select: { follows: true, posts: true } },
      },
    }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
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
    }),
  ]);

  return (
    <div className="page-shell">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Explore</h1>
        <p className="text-sm text-stone-500">
          Discover houses by followers and fresh posts
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Houses
        </h2>
        {houses.length === 0 ? (
          <p className="text-sm text-stone-500">
            No houses yet — be the first to create one.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {houses.map((house) => (
              <HouseCard key={house.id} house={house} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Recent posts
        </h2>
        {posts.length === 0 ? (
          <p className="text-sm text-stone-500">No posts yet.</p>
        ) : (
          <div className="mx-auto max-w-xl space-y-5">
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
      </section>
    </div>
  );
}
