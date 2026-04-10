import { RoomPageClient } from "@/features/online-room/room-page-client";

export default async function RoomPage(props: PageProps<"/room/[code]">) {
  const { code } = await props.params;

  return <RoomPageClient code={code} />;
}
