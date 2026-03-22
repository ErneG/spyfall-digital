import { prisma } from "@/lib/prisma";

// GET /api/rooms/[code]/events — SSE stream for room state updates
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      const poll = async () => {
        while (!closed) {
          try {
            const room = await prisma.room.findUnique({
              where: { code: code.toUpperCase() },
              include: {
                players: {
                  orderBy: { createdAt: "asc" },
                  select: { id: true, name: true, isHost: true, isOnline: true, moderatorRole: true },
                },
                games: {
                  orderBy: { startedAt: "desc" },
                  take: 1,
                  select: { id: true, state: true, startedAt: true, timerRunning: true },
                },
                selectedLocations: { select: { locationId: true } },
                _count: { select: { customLocations: { where: { selected: true } } } },
              },
            });

            if (!room) {
              send({ error: "Room not found" });
              closed = true;
              controller.close();
              return;
            }

            const latestGame = room.games[0] ?? null;
            const totalLocations = await prisma.location.count();

            send({
              state: room.state,
              players: room.players,
              timeLimit: room.timeLimit,
              spyCount: room.spyCount,
              autoStartTimer: room.autoStartTimer,
              hideSpyCount: room.hideSpyCount,
              moderatorMode: room.moderatorMode,
              moderatorLocationId: room.moderatorLocationId,
              selectedLocationCount: room.selectedLocations.length + room._count.customLocations,
              totalLocationCount: totalLocations,
              currentGameId: latestGame?.id ?? null,
              gameStartedAt: latestGame?.startedAt ?? null,
              timerRunning: latestGame?.timerRunning ?? true,
            });
          } catch {
            // DB error — skip
          }

          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      };

      void poll();
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
