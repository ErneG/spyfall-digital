"use client";

import { useCallback } from "react";
import { Button } from "@/shared/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button onClick={handleRetry} variant="outline">
          Try again
        </Button>
      </div>
    </div>
  );
}
