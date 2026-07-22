import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/post-form";
import { Card } from "@/components/ui";

export default async function NewPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const house = await prisma.house.findUnique({ where: { id } });
  if (!house) notFound();
  if (house.creatorId !== user.id) {
    redirect(`/houses/${id}`);
  }

  return (
    <div className="page-shell flex justify-center">
      <Card className="w-full max-w-lg p-6 sm:p-8">
        <p className="text-sm text-stone-500">
          <Link href={`/houses/${house.id}`} className="hover:underline">
            ← {house.name}
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          New post
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Share a photo of what you&apos;re doing or what you love.
        </p>
        <div className="mt-6">
          <PostForm houseId={house.id} />
        </div>
      </Card>
    </div>
  );
}
