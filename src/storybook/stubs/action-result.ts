export const STORYBOOK_STUB_ERROR = "Storybook action stub";

export function storybookFailResult<T = never>() {
  return {
    success: false as const,
    error: STORYBOOK_STUB_ERROR,
  } satisfies { success: false; error: string } | { success: false; error: string; data?: T };
}
