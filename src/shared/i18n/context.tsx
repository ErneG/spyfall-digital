"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { Locale, Translations, LocationTranslations } from "./types";
import { en } from "./translations/en";
import { lv } from "./translations/lv";
import { enLocations } from "./locations/en";
import { lvLocations } from "./locations/lv";

const STORAGE_KEY = "spyfall-locale";

const translationMap: Record<Locale, Translations> = { en, lv };
const locationMap: Record<Locale, LocationTranslations> = { en: enLocations, lv: lvLocations };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  isLoaded: boolean;
  translateLocation: (englishName: string) => string;
  translateRole: (englishRole: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "lv" ? "lv" : "en";
  });

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem(STORAGE_KEY, newLocale);
    setLocaleState(newLocale);
  }, []);

  const t = translationMap[locale];
  const locations = locationMap[locale];

  const translateLocation = useCallback(
    (englishName: string): string => locations[englishName]?.name ?? englishName,
    [locations],
  );

  // Build a flat role lookup for the current locale
  const roleMap = useMemo(() => {
    const map = new Map<string, string>();
    const enLocs = locationMap.en;
    const curLocs = locations;
    for (const key of Object.keys(enLocs)) {
      const enEntry = enLocs[key];
      const curEntry = curLocs[key];
      if (!enEntry || !curEntry) continue;
      for (let i = 0; i < enEntry.roles.length; i++) {
        const enRole = enEntry.roles[i];
        const curRole = curEntry.roles[i];
        if (enRole && curRole) {
          map.set(enRole, curRole);
        }
      }
    }
    return map;
  }, [locations]);

  const translateRole = useCallback(
    (englishRole: string): string => roleMap.get(englishRole) ?? englishRole,
    [roleMap],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, isLoaded: true, translateLocation, translateRole }),
    [locale, setLocale, t, translateLocation, translateRole],
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used within I18nProvider");
  return context;
}
