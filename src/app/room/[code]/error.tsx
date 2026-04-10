"use client";

import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { Button } from "@/shared/ui/button";

export default function RoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);
  const handleHome = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <AlertTriangle className="text-destructive h-10 w-10" />
        <h2 className="text-lg font-semibold">Room error</h2>
        <p className="text-muted-foreground text-sm">
          {error.message || "Could not load the room. It may no longer exist."}
        </p>
        <div className="flex gap-2">
          <Button onClick={handleRetry} variant="outline">
            Try again
          </Button>
          <Button onClick={handleHome}>Back to home</Button>
        </div>
      </div>
    </div>
  );
}
