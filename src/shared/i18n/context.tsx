"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";

import { enCategories } from "./categories/en";
import { lvCategories } from "./categories/lv";
import { enLocations } from "./locations/en";
import { lvLocations } from "./locations/lv";
import { en } from "./translations/en";
import { lv } from "./translations/lv";

import type { CategoryTranslations, Locale, Translations, LocationTranslations } from "./types";

const STORAGE_KEY = "spyfall-locale";

const translationMap: Record<Locale, Translations> = { en, lv };
const locationMap: Record<Locale, LocationTranslations> = { en: enLocations, lv: lvLocations };
const categoryMap: Record<Locale, CategoryTranslations> = { en: enCategories, lv: lvCategories };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  isLoaded: boolean;
  translateLocation: (englishName: string) => string;
  translateRole: (englishRole: string) => string;
  translateCategory: (englishCategory: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "en";
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "lv" ? "lv" : "en";
  });

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem(STORAGE_KEY, newLocale);
    setLocaleState(newLocale);
  }, []);

  const t = translationMap[locale];
  const locations = locationMap[locale];
  const categories = categoryMap[locale];

  const translateCategory = useCallback(
    (englishCategory: string): string => categories[englishCategory] ?? englishCategory,
    [categories],
  );

  const translateLocation = useCallback(
    (englishName: string): string => locations[englishName]?.name ?? englishName,
    [locations],
  );

  // Build a flat role lookup for the current locale
  const roleMap = useMemo(() => {
    const map = new Map<string, string>();
    const enLocs = locationMap.en;
    const currentLocs = locations;
    for (const key of Object.keys(enLocs)) {
      const enEntry = enLocs[key];
      const currentEntry = currentLocs[key];
      if (!enEntry || !currentEntry) {
        continue;
      }
      for (let i = 0; i < enEntry.roles.length; i++) {
        const enRole = enEntry.roles[i];
        const currentRole = currentEntry.roles[i];
        if (enRole && currentRole) {
          map.set(enRole, currentRole);
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
    () => ({
      locale,
      setLocale,
      t,
      isLoaded: true,
      translateLocation,
      translateRole,
      translateCategory,
    }),
    [locale, setLocale, t, translateLocation, translateRole, translateCategory],
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return context;
}
