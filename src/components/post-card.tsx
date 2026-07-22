import Link from "next/link";
import { formatRelativeTime, houseTypeLabel } from "@/lib/utils";
import { Card } from "@/components/ui";
import { LikeButton } from "@/components/like-button";

type PostCardProps = {
  post: {
    id: string;
    caption: string | null;
    imageUrl: string;
    createdAt: Date | string;
    author: { name: string };
    house: { id: string; name: string; type: string; town: string | null };
    _count: { likes: number; comments: number };
    likedByMe?: boolean;
  };
  showHouse?: boolean;
};

export function PostCard({ post, showHouse = true }: PostCardProps) {
  return (
    <Card className="overflow-hidden">
      {showHouse && (
        <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3">
          <div>
            <Link
              href={`/houses/${post.house.id}`}
              className="font-semibold text-stone-900 hover:underline"
            >
              {post.house.name}
            </Link>
            <p className="text-xs text-stone-500">
              {houseTypeLabel(post.house.type)}
              {post.house.town ? ` · ${post.house.town}` : ""} ·{" "}
              {post.author.name}
            </p>
          </div>
          <span className="text-xs text-stone-400">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>
      )}
      <Link href={`/posts/${post.id}`} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.imageUrl}
          alt={post.caption ?? "House post"}
          className="max-h-[520px] w-full object-cover bg-stone-100"
        />
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <LikeButton
            postId={post.id}
            liked={!!post.likedByMe}
            count={post._count.likes}
          />
          <Link
            href={`/posts/${post.id}`}
            className="text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            {post._count.comments} comments
          </Link>
        </div>
        {post.caption && (
          <p className="text-sm text-stone-800 whitespace-pre-wrap">
            <span className="font-semibold">{post.author.name}</span>{" "}
            {post.caption}
          </p>
        )}
      </div>
    </Card>
  );
}
