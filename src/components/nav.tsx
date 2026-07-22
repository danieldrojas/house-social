import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui";

export async function Nav() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#faf7f2]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href={session ? "/feed" : "/"} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-900 text-sm text-white">
            ⌂
          </span>
          <span className="font-semibold tracking-tight text-stone-900">
            House Social
          </span>
        </Link>

        {session ? (
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/feed"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Feed
            </Link>
            <Link
              href="/explore"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Explore
            </Link>
            <Link href="/houses/new">
              <Button className="!py-1.5">New house</Button>
            </Link>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" className="!py-1.5">
                Log out
              </Button>
            </form>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
