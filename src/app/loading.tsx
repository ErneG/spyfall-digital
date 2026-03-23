"use client";

import { useTranslation } from "@/shared/i18n/context";

export default function Loading() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      </div>
    </div>
  );
}
