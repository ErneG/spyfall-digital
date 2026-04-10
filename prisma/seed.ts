import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { DEFAULT_LOCATIONS } from "../src/domains/location/data";
import { PrismaClient } from "../src/generated/prisma/client";
import { getServerEnv } from "../src/shared/config/env";

const adapter = new PrismaPg({ connectionString: getServerEnv().DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function logSeedProgress(message: string) {
  process.stdout.write(`${message}\n`);
}

async function main() {
  logSeedProgress("Seeding locations and roles...");

  for (const loc of DEFAULT_LOCATIONS) {
    await prisma.location.upsert({
      where: { name: loc.name },
      update: { category: loc.category },
      create: {
        name: loc.name,
        category: loc.category,
        roles: {
          create: loc.roles.map((role) => ({ name: role })),
        },
      },
    });
  }

  logSeedProgress(`Seeded ${DEFAULT_LOCATIONS.length} locations.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
