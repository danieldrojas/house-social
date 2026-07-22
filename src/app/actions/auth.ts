"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
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
  success?: boolean;
  redirectTo?: string;
};

function dbHint(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (/DATABASE_URL|Environment variable not found/i.test(msg)) {
    return "DATABASE_URL is missing on Vercel. Add it under Settings → Environment Variables, then Redeploy.";
  }
  if (/Can\'t reach database|P1001|connection|ECONNREFUSED|timeout/i.test(msg)) {
    return "Cannot reach the database. Check DATABASE_URL on Vercel (must start with postgres://).";
  }
  if (/P2021|does not exist|relation/i.test(msg)) {
    return "Database tables are missing. Redeploy after DATABASE_URL is set.";
  }
  return "Could not save your account. Check DATABASE_URL on Vercel and redeploy.";
}

export async function signupAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
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

    if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
      return {
        error:
          "Server is missing AUTH_SECRET. Add it in Vercel → Settings → Environment Variables, then Redeploy.",
      };
    }

    const email = parsed.data.email.toLowerCase().trim();
    await ensureBootstrap();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return {
        error: "An account with that email already exists. Try Log in.",
      };
    }

    const passwordHash = await hash(parsed.data.password, 10);
    await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        passwordHash,
      },
    });

    // Sign in without redirect() — useActionState + redirect() crashes the page
    try {
      await signIn("credentials", {
        email,
        password: parsed.data.password,
        redirect: false,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return {
          success: true,
          redirectTo: "/login",
          error:
            "Account created! Please log in with your email and password.",
        };
      }
      // Non-auth throw: still send them to login
      console.error("signup signIn", error);
      return {
        success: true,
        redirectTo: "/login",
        error: "Account created! Please log in.",
      };
    }

    return { success: true, redirectTo: "/feed" };
  } catch (error) {
    console.error("signup error", error);
    return { error: dbHint(error) };
  }
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
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

    if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
      return {
        error:
          "Server is missing AUTH_SECRET. Add it in Vercel → Settings → Environment Variables, then Redeploy.",
      };
    }

    await ensureBootstrap();

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true, redirectTo: "/feed" };
  } catch (error) {
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
    // Credentials provider returns null → AuthError; other failures:
    return {
      error:
        "Login failed. Check DATABASE_URL / AUTH_SECRET on Vercel, or try Sign up.",
    };
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
  return { success: true, redirectTo: "/" };
}
