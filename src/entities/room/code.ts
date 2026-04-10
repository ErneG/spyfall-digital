import { prisma } from "@/shared/lib/prisma";
import { generateRoomCode } from "@/shared/lib/room-code";

export async function generateUniqueRoomCode(): Promise<string | null> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateRoomCode();
    const existing = await prisma.room.findUnique({ where: { code } });
    if (!existing) {
      return code;
    }
  }

  return null;
}
