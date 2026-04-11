import { expect, type Page } from "@playwright/test";

const TEST_ACCOUNT = {
  email: "playwright-library@spyfall.test",
  name: "Playwright Library",
  password: "playwright-password",
} as const;

async function isSignedIn(page: Page): Promise<boolean> {
  return page
    .getByRole("button", { name: "Account menu" })
    .isVisible()
    .catch(() => false);
}

async function openAuthDialog(page: Page) {
  const signInButton = page.getByRole("button", { name: "Sign in" });
  await expect(signInButton).toBeVisible();
  await signInButton.click();
  await expect(page.getByRole("tab", { name: "Sign In" })).toBeVisible();
}

async function signIn(page: Page) {
  await page.locator("#signin-email").fill(TEST_ACCOUNT.email);
  await page.locator("#signin-password").fill(TEST_ACCOUNT.password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

async function signUp(page: Page) {
  await page.getByRole("tab", { name: "Sign Up" }).click();
  await page.locator("#signup-name").fill(TEST_ACCOUNT.name);
  await page.locator("#signup-email").fill(TEST_ACCOUNT.email);
  await page.locator("#signup-password").fill(TEST_ACCOUNT.password);
  await page.getByRole("button", { name: "Create Account" }).click();
}

export async function ensureSignedIn(page: Page) {
  await page.goto("/library");

  if (await isSignedIn(page)) {
    return TEST_ACCOUNT;
  }

  await openAuthDialog(page);
  await signIn(page);

  const accountMenu = page.getByRole("button", { name: "Account menu" });

  try {
    await expect(accountMenu).toBeVisible({ timeout: 4_000 });
    return TEST_ACCOUNT;
  } catch {
    await signUp(page);
    await expect(accountMenu).toBeVisible({ timeout: 4_000 });
    return TEST_ACCOUNT;
  }
}
