import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("password123", 10);

  const demo = await prisma.user.upsert({
    where: { email: "demo@housesocial.test" },
    update: {},
    create: {
      email: "demo@housesocial.test",
      name: "Demo Host",
      passwordHash,
      bio: "Sharing cozy spaces with friends.",
    },
  });

  const friend = await prisma.user.upsert({
    where: { email: "friend@housesocial.test" },
    update: {},
    create: {
      email: "friend@housesocial.test",
      name: "Friend Tester",
      passwordHash,
    },
  });

  const existing = await prisma.house.findFirst({
    where: { creatorId: demo.id, name: "Sunlit Bungalow" },
  });

  if (!existing) {
    const bungalow = await prisma.house.create({
      data: {
        name: "Sunlit Bungalow",
        type: "HOME",
        town: "Austin",
        bio: "A small 1920s bungalow full of plants and weekend projects.",
        tags: "plants,cozy,bungalow",
        creatorId: demo.id,
        follows: {
          create: [{ userId: demo.id }, { userId: friend.id }],
        },
      },
    });

    const dream = await prisma.house.create({
      data: {
        name: "Black Kitchen Goals",
        type: "DREAM",
        town: "Anywhere",
        bio: "Moodboard for a matte black kitchen with warm wood and brass.",
        tags: "kitchen,dream,moody",
        creatorId: demo.id,
        follows: {
          create: [{ userId: demo.id }],
        },
      },
    });

    // Placeholder gradient images as SVG data URLs stored as files would be ideal;
    // use solid public placeholder paths friends can replace by posting real photos.
    await prisma.post.createMany({
      data: [
        {
          houseId: bungalow.id,
          authorId: demo.id,
          caption:
            "Morning light in the living room. These plants are taking over — and I'm fine with it.",
          imageUrl:
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
        },
        {
          houseId: bungalow.id,
          authorId: demo.id,
          caption: "Weekend project: finally painted the built-ins soft olive.",
          imageUrl:
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
        },
        {
          houseId: dream.id,
          authorId: demo.id,
          caption: "Dream kitchen inspo — dark cabinets + warm wood island.",
          imageUrl:
            "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=1200&q=80",
        },
      ],
    });

    console.log("Seeded houses:", bungalow.name, "and", dream.name);
  }

  console.log("Demo logins:");
  console.log("  demo@housesocial.test / password123");
  console.log("  friend@housesocial.test / password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
