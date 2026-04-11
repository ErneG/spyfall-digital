import type { DefaultLocation } from "../src/entities/library/default-locations";
import type { PrismaClient } from "../src/generated/prisma/client";

type SeedPrisma = {
  location: Pick<PrismaClient["location"], "upsert">;
};

export async function syncDefaultLocations(prisma: SeedPrisma, locations: DefaultLocation[]) {
  for (const location of locations) {
    const roleCreates = location.roles.map((role) => ({ name: role }));

    await prisma.location.upsert({
      where: { name: location.name },
      update: {
        category: location.category,
        roles: {
          deleteMany: {},
          create: roleCreates,
        },
      },
      create: {
        name: location.name,
        category: location.category,
        roles: {
          create: roleCreates,
        },
      },
    });
  }
}
