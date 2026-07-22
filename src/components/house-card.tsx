import Link from "next/link";
import { houseTypeBadgeClass, houseTypeLabel } from "@/lib/utils";
import { Card } from "@/components/ui";

type HouseCardProps = {
  house: {
    id: string;
    name: string;
    type: string;
    town: string | null;
    bio: string | null;
    coverUrl: string | null;
    _count: { follows: number; posts: number };
    creator: { name: string };
  };
};

export function HouseCard({ house }: HouseCardProps) {
  return (
    <Link href={`/houses/${house.id}`} className="block group">
      <Card className="overflow-hidden transition hover:shadow-md">
        <div className="relative aspect-[4/3] bg-stone-100">
          {house.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={house.coverUrl}
              alt={house.name}
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-200 to-amber-100 text-4xl text-stone-500">
              ⌂
            </div>
          )}
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${houseTypeBadgeClass(house.type)}`}
          >
            {houseTypeLabel(house.type)}
          </span>
        </div>
        <div className="space-y-1 p-4">
          <h3 className="font-semibold text-stone-900 group-hover:underline">
            {house.name}
          </h3>
          <p className="text-sm text-stone-500">
            {house.town ? `${house.town} · ` : ""}
            by {house.creator.name}
          </p>
          {house.bio && (
            <p className="line-clamp-2 text-sm text-stone-600">{house.bio}</p>
          )}
          <p className="pt-1 text-xs font-medium text-stone-500">
            {house._count.follows} followers · {house._count.posts} posts
          </p>
        </div>
      </Card>
    </Link>
  );
}
