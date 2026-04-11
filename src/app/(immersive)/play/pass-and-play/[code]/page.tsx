import { PassAndPlayRoomPageClient } from "@/features/pass-and-play/runtime/pass-and-play-room-page-client";

interface PassAndPlayRuntimePageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function PassAndPlayRuntimePage({ params }: PassAndPlayRuntimePageProps) {
  const { code } = await params;

  return <PassAndPlayRoomPageClient code={code} />;
}
