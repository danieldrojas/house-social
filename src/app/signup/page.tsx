import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { signupAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  return (
    <div className="page-shell flex justify-center">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Join House Social</h1>
        <p className="mt-1 text-sm text-stone-500">
          Create a house page and invite your friends to follow along.
        </p>
        <div className="mt-6">
          <AuthForm action={signupAction} mode="signup" />
        </div>
        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-stone-900 underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
