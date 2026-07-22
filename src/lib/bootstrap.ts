import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

let bootstrapped = false;

/**
 * Ensures tables are usable and demo accounts exist when the DB is empty.
 * Safe to call on every request start (no-ops after first success in this instance).
 */
export async function ensureBootstrap() {
  if (bootstrapped) return { ok: true as const, seeded: false };

  try {
    const count = await prisma.user.count();
    if (count > 0) {
      bootstrapped = true;
      return { ok: true as const, seeded: false };
    }

    const passwordHash = await hash("password123", 10);

    const demo = await prisma.user.create({
      data: {
        email: "demo@housesocial.test",
        name: "Demo Host",
        passwordHash,
        bio: "Sharing cozy spaces with friends.",
      },
    });

    await prisma.user.create({
      data: {
        email: "friend@housesocial.test",
        name: "Friend Tester",
        passwordHash,
      },
    });

    const bungalow = await prisma.house.create({
      data: {
        name: "Sunlit Bungalow",
        type: "HOME",
        town: "Austin",
        bio: "A small 1920s bungalow full of plants and weekend projects.",
        tags: "plants,cozy,bungalow",
        creatorId: demo.id,
        follows: { create: { userId: demo.id } },
      },
    });

    await prisma.post.create({
      data: {
        houseId: bungalow.id,
        authorId: demo.id,
        caption: "Morning light in the living room. Welcome to House Social!",
        imageUrl:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      },
    });

    bootstrapped = true;
    return { ok: true as const, seeded: true };
  } catch (error) {
    console.error("bootstrap failed", error);
    return {
      ok: false as const,
      seeded: false,
      error: error instanceof Error ? error.message : "bootstrap failed",
    };
  }
}
