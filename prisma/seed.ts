import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { DEFAULT_LOCATIONS } from "../src/entities/library/default-locations";
import { PrismaClient } from "../src/generated/prisma/client";
import { getServerEnv } from "../src/shared/config/env";

import { syncDefaultLocations } from "./seed-lib";

const adapter = new PrismaPg({ connectionString: getServerEnv().DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function logSeedProgress(message: string) {
  process.stdout.write(`${message}\n`);
}

async function main() {
  logSeedProgress("Seeding locations and roles...");

  await syncDefaultLocations(prisma, DEFAULT_LOCATIONS);

  logSeedProgress(`Seeded ${DEFAULT_LOCATIONS.length} locations.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
