"use client";

import { useCallback } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  const toggle = useCallback(() => {
    setLocale(locale === "en" ? "lv" : "en");
  }, [locale, setLocale]);

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="text-xs font-mono px-2">
      {locale === "en" ? "LV" : "EN"}
    </Button>
  );
}
