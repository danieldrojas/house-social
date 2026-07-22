import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { loginAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  return (
    <div className="page-shell flex justify-center">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-stone-500">
          Log in to follow houses and share updates.
        </p>
        <div className="mt-6">
          <AuthForm action={loginAction} mode="login" />
        </div>
        <p className="mt-6 text-center text-sm text-stone-500">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-stone-900 underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
