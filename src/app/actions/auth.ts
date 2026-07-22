"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
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

  const email = parsed.data.email.toLowerCase().trim();

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "An account with that email already exists." };
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
    return {
      error:
        "Could not create account (database). Check DATABASE_URL on Vercel and redeploy.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/feed",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "Account may exist, but sign-in failed. Check AUTH_SECRET on Vercel, then try Log in.",
      };
    }
    throw error;
  }

  return {};
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

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/feed",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // CredentialsSignin = wrong password/user; Configuration = missing env on server
      const code = error.type || error.name;
      if (code === "Configuration" || String(error).includes("Configuration")) {
        return {
          error:
            "Server auth is misconfigured (AUTH_SECRET / DATABASE_URL). Fix env vars on Vercel and redeploy.",
        };
      }
      return {
        error:
          "Invalid email or password. Try demo@housesocial.test / password123, or Sign up.",
      };
    }
    console.error("login error", error);
    return { error: "Login failed. Please try again." };
  }

  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
  redirect("/");
}
