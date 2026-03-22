import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_LOCATIONS } from "../src/domains/location/data";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding locations and roles...");

  for (const loc of DEFAULT_LOCATIONS) {
    await prisma.location.upsert({
      where: { name: loc.name },
      update: {},
      create: {
        name: loc.name,
        edition: loc.edition,
        roles: {
          create: loc.roles.map((role) => ({ name: role })),
        },
      },
    });
  }

  console.log(`Seeded ${DEFAULT_LOCATIONS.length} locations.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
