import { prisma } from "@/shared/lib/prisma";

const SSE_CONTENT_TYPE = "text/event-stream";
const HEARTBEAT_INTERVAL = 15_000;
const POLL_INTERVAL = 1500;

async function fetchRoomState(code: string) {
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
    return null;
  }

  const latestGame: (typeof room.games)[number] | undefined = room.games[0];
  const totalLocations = await prisma.location.count();

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- games[0] can be undefined at runtime
  const gameFields = latestGame
    ? {
        currentGameId: latestGame.id,
        gameStartedAt: latestGame.startedAt,
        timerRunning: latestGame.timerRunning,
      }
    : { currentGameId: null, gameStartedAt: null, timerRunning: true };

  return {
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
    ...gameFields,
  };
}

// GET /api/rooms/[code]/events — SSE stream for room state updates
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const encoder = new TextEncoder();
  let isClosed = false;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        if (isClosed) {
          return;
        }
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          isClosed = true;
        }
      };

      const hb = setInterval(() => {
        if (isClosed) {
          clearInterval(hb);
          return;
        }
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          isClosed = true;
          clearInterval(hb);
        }
      }, HEARTBEAT_INTERVAL);
      heartbeat = hb;

      const poll = async () => {
        while (!isClosed) {
          try {
            const roomState = await fetchRoomState(code);
            if (!roomState) {
              send({ error: "Room not found" });
              isClosed = true;
              controller.close();
              return;
            }
            send(roomState);
          } catch {
            // DB error — skip this tick
          }
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        }
      };

      void poll();
    },
    cancel() {
      isClosed = true;
      if (heartbeat) {
        clearInterval(heartbeat);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": SSE_CONTENT_TYPE,
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
