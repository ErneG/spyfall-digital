"use client";

import { AlertTriangle } from "lucide-react";
import { useCallback } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-semibold">{t.errors.somethingWentWrong}</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || t.errors.unexpectedError}
        </p>
        <Button onClick={handleRetry} variant="outline">
          {t.errors.tryAgain}
        </Button>
      </div>
    </div>
  );
}
