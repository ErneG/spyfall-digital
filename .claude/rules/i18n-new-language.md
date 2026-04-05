## Adding a New Language — Full Checklist

When adding a new locale (e.g., `de` for German), ALL of the following must be completed. Missing any step breaks the build or leaves untranslated UI.

### 1. Register the locale code

**File: `src/shared/i18n/types.ts`**

- Add the new code to the `Locale` union type:
  ```ts
  export type Locale = "en" | "lv" | "de";
  ```

### 2. Create all three translation files

Each file must export the same structure as its English counterpart:

| File to create                             | Export name                                                        | Must match structure of |
| ------------------------------------------ | ------------------------------------------------------------------ | ----------------------- |
| `src/shared/i18n/translations/{locale}.ts` | Named export (e.g., `de`) of type `Translations`                   | `translations/en.ts`    |
| `src/shared/i18n/locations/{locale}.ts`    | Named export (e.g., `deLocations`) of type `LocationTranslations`  | `locations/en.ts`       |
| `src/shared/i18n/categories/{locale}.ts`   | Named export (e.g., `deCategories`) of type `CategoryTranslations` | `categories/en.ts`      |

**Critical rules for location files:**

- Keys MUST be identical to `en.ts` (English location names are the keys)
- Role arrays MUST have the same length and order as English (role translation is positional, index-based)
- Category keys MUST match the `LOCATION_CATEGORIES` constant in `src/domains/location/data.ts`

### 3. Register in the i18n context

**File: `src/shared/i18n/context.tsx`**

- Import all three new files
- Add to ALL three maps — missing any one silently breaks:
  ```ts
  const translationMap: Record<Locale, Translations> = { en, lv, de };
  const locationMap: Record<Locale, LocationTranslations> = {
    en: enLocations,
    lv: lvLocations,
    de: deLocations,
  };
  const categoryMap: Record<Locale, CategoryTranslations> = {
    en: enCategories,
    lv: lvCategories,
    de: deCategories,
  };
  ```
- Update the locale detection in `useState` initializer to recognize the new code:
  ```ts
  // Before: return saved === "lv" ? "lv" : "en";
  // After:  return (saved === "lv" || saved === "de") ? saved : "en";
  ```
  Or refactor to: `return isLocale(saved) ? saved : "en";`

### 4. Verification

After adding a language, verify:

1. `pnpm exec tsc --noEmit` — `Record<Locale, ...>` will error if any map is missing the new key
2. Confirm location file has all 54 entries (same count as `en.ts`)
3. Confirm category file has all 10 entries (same keys as `LOCATION_CATEGORIES`)
4. Confirm the locale initializer in `context.tsx` recognizes the new code from localStorage

### Why this matters

- `translationMap`, `locationMap`, and `categoryMap` are typed as `Record<Locale, ...>` — TypeScript enforces that every locale has an entry. If you add a locale to the union but skip a map, the build fails.
- Location keys and role order are matched positionally — a mismatch causes wrong role translations at runtime with no type error.
- The localStorage initializer is a manual check — forgetting it means users who select the new language and refresh will fall back to English.
