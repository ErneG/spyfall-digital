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
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="px-2 font-mono text-xs text-slate-600 hover:bg-slate-900/5 hover:text-slate-950"
    >
      {locale === "en" ? "LV" : "EN"}
    </Button>
  );
}
