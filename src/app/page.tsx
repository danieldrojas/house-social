import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  return (
    <div className="page-shell">
      <section className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white px-6 py-14 shadow-sm sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-100/80 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-100/70 blur-2xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-800/80">
            Friends beta
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Follow houses, not listings
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            Showcase your home, a reno project, or a dream space. Friends can
            follow, like, and comment — town optional, no street address.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <Button className="px-6 py-2.5 text-base">Create account</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="px-6 py-2.5 text-base">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "My home",
            body: "A living page for your place — rooms, plants, weekends.",
          },
          {
            title: "Projects",
            body: "Before/after, progress shots, and what you learned.",
          },
          {
            title: "Dream / inspo",
            body: "Collect vibes you love and grow a following around them.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <h2 className="font-semibold text-stone-900">{item.title}</h2>
            <p className="mt-2 text-sm text-stone-600">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
