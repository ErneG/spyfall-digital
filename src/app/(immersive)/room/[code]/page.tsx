import { RoomPageClient } from "@/features/online-room/room-page-client";

interface RoomPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { code } = await params;

  return <RoomPageClient code={code} />;
}
