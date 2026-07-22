"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
import { ensureBootstrap } from "@/lib/bootstrap";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type ActionState = {
  error?: string;
  success?: string;
};

function dbHint(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (/DATABASE_URL|Environment variable not found/i.test(msg)) {
    return "DATABASE_URL is missing on Vercel. Add it under Settings → Environment Variables, then Redeploy.";
  }
  if (/Can\'t reach database|P1001|connection/i.test(msg)) {
    return "Cannot reach the database. Check DATABASE_URL on Vercel (must be a postgres:// link).";
  }
  if (/P2021|does not exist|relation/i.test(msg)) {
    return "Database tables are missing. Redeploy so `prisma db push` can run on build.";
  }
  return "Could not save your account. Check DATABASE_URL on Vercel and redeploy.";
}

export async function signupAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (!process.env.DATABASE_URL) {
    return {
      error:
        "Server is missing DATABASE_URL. Add it in Vercel → Settings → Environment Variables, then Redeploy.",
    };
  }

  const email = parsed.data.email.toLowerCase().trim();

  try {
    await ensureBootstrap();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "An account with that email already exists. Try Log in." };
    }

    const passwordHash = await hash(parsed.data.password, 10);
    await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        passwordHash,
      },
    });
  } catch (error) {
    console.error("signup db error", error);
    return { error: dbHint(error) };
  }

  try {
    // Avoid redirect-throw confusion with useActionState
    const result = await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });

    if (result && typeof result === "object" && "error" in result && result.error) {
      return {
        error:
          "Account created, but sign-in failed. Try Log in with the same email/password.",
      };
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return {
        error:
          "Account created, but sign-in failed. Try Log in. If it keeps failing, set AUTH_SECRET on Vercel and Redeploy.",
      };
    }
    console.error("signup signIn error", error);
    return {
      error:
        "Account may have been created. Try Log in. If that fails, check AUTH_SECRET on Vercel.",
    };
  }

  redirect("/feed");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (!process.env.DATABASE_URL) {
    return {
      error:
        "Server is missing DATABASE_URL. Add it in Vercel → Settings → Environment Variables, then Redeploy.",
    };
  }

  try {
    await ensureBootstrap();
  } catch (error) {
    console.error("login bootstrap error", error);
    return { error: dbHint(error) };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result && typeof result === "object" && "error" in result && result.error) {
      return {
        error:
          "Invalid email or password. Try demo@housesocial.test / password123, or Sign up.",
      };
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      if (String(error.type ?? error.name ?? error).includes("Configuration")) {
        return {
          error:
            "Server auth misconfigured. Set AUTH_SECRET on Vercel and Redeploy.",
        };
      }
      return {
        error:
          "Invalid email or password. Try demo@housesocial.test / password123, or Sign up.",
      };
    }
    console.error("login error", error);
    return { error: "Login failed. Please try again in a moment." };
  }

  redirect("/feed");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
  redirect("/");
}
