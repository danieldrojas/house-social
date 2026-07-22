import { NextResponse } from "next/server";
import { ensureBootstrap } from "@/lib/bootstrap";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasAuthSecret = Boolean(
    process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  );
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const databaseLooksPostgres =
    process.env.DATABASE_URL?.startsWith("postgres") ?? false;

  let dbOk = false;
  let dbError: string | null = null;
  let userCount: number | null = null;
  let seeded = false;

  if (hasDatabaseUrl) {
    try {
      const boot = await ensureBootstrap();
      seeded = boot.seeded;
      if (!boot.ok && "error" in boot) {
        dbError = boot.error ?? "bootstrap failed";
      } else {
        userCount = await prisma.user.count();
        dbOk = true;
      }
    } catch (e) {
      dbError = e instanceof Error ? e.message : "Database connection failed";
    }
  }

  const ok = hasAuthSecret && hasDatabaseUrl && databaseLooksPostgres && dbOk;

  return NextResponse.json(
    {
      ok,
      authSecret: hasAuthSecret ? "set" : "MISSING",
      databaseUrl: hasDatabaseUrl
        ? databaseLooksPostgres
          ? "set (postgres)"
          : "set but not postgres"
        : "MISSING",
      database: dbOk ? "connected" : "FAILED",
      userCount,
      seeded,
      dbError,
      tip: !ok
        ? "Vercel → Settings → Environment Variables: set AUTH_SECRET and DATABASE_URL (postgres://...), then Redeploy."
        : "Config looks good. demo@housesocial.test / password123 or Sign up.",
    },
    { status: ok ? 200 : 503 },
  );
}
