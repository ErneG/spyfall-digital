export default function RoomLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
        <p className="text-muted-foreground text-sm">Joining room...</p>
      </div>
    </div>
  );
}
