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
    async start(controller) {
      const send = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      // Poll database every 1.5s and send updates
      const poll = async () => {
        while (!closed) {
          try {
            const room = await prisma.room.findUnique({
              where: { code: code.toUpperCase() },
              include: {
                players: {
                  orderBy: { createdAt: "asc" },
                  select: { id: true, name: true, isHost: true, isOnline: true },
                },
                games: {
                  orderBy: { startedAt: "desc" },
                  take: 1,
                  select: { id: true, state: true, startedAt: true },
                },
              },
            });

            if (!room) {
              send({ error: "Room not found" });
              closed = true;
              controller.close();
              return;
            }

            const latestGame = room.games[0] ?? null;

            send({
              state: room.state,
              players: room.players,
              timeLimit: room.timeLimit,
              spyCount: room.spyCount,
              currentGameId: latestGame?.id ?? null,
              gameStartedAt: latestGame?.startedAt ?? null,
            });
          } catch {
            // DB error — skip this tick
          }

          await new Promise((r) => setTimeout(r, 1500));
        }
      };

      poll();
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
