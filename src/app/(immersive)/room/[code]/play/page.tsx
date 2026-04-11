import { OnlineRoomRuntimePageClient } from "@/features/online-room/runtime/online-room-runtime-page-client";

interface OnlineRoomRuntimePageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function OnlineRoomRuntimePage({ params }: OnlineRoomRuntimePageProps) {
  const { code } = await params;

  return <OnlineRoomRuntimePageClient code={code} />;
}
