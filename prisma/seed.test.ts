import { describe, expect, it, vi } from "vitest";

import { syncDefaultLocations } from "./seed-lib";

import type { DefaultLocation } from "../src/entities/library/default-locations";

describe("syncDefaultLocations", () => {
  it("replaces roles when a seeded location already exists", async () => {
    const upsert = vi.fn().mockResolvedValue(undefined);
    const prisma = {
      location: {
        upsert,
      },
    };

    const locations: DefaultLocation[] = [
      {
        name: "Airplane",
        category: "Transportation",
        roles: ["Pilot", "Passenger"],
      },
    ];

    await syncDefaultLocations(prisma, locations);

    expect(upsert).toHaveBeenCalledWith({
      where: { name: "Airplane" },
      update: {
        category: "Transportation",
        roles: {
          deleteMany: {},
          create: [{ name: "Pilot" }, { name: "Passenger" }],
        },
      },
      create: {
        name: "Airplane",
        category: "Transportation",
        roles: {
          create: [{ name: "Pilot" }, { name: "Passenger" }],
        },
      },
    });
  });
});
