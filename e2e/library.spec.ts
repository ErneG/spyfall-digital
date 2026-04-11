import { expect, test } from "@playwright/test";

import { ensureSignedIn } from "./helpers/auth";

test("library browse flow keeps the built-in catalog inspectable without auth", async ({
  page,
}) => {
  await page.goto("/library");

  await expect(
    page.getByRole("heading", { name: "Browse every location before the game starts." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sign in to save your own locations" }),
  ).toBeVisible();
  await expect(page.getByText("Airplane")).toBeVisible();

  await page.getByPlaceholder("Search locations, categories, or roles").fill("airplane");

  await expect(page.getByText("Airplane")).toBeVisible();
  await expect(page.getByText("Movie Studio")).not.toBeVisible();
});

test("authenticated library flow supports saved locations, collections, and collection-backed play", async ({
  page,
}) => {
  await ensureSignedIn(page);

  const suffix = `${Date.now()}`;
  const savedLocationName = `Harbor Safehouse ${suffix}`;
  const updatedLocationName = `${savedLocationName} Revised`;
  const collectionName = `Night Pack ${suffix}`;

  await page.goto("/library");
  await expect(
    page.getByRole("heading", { name: "Save custom locations with proper role editing." }),
  ).toBeVisible();

  await page.getByRole("button", { name: "New saved location" }).click();
  await page.getByLabel("Location name").fill(savedLocationName);
  await page.getByLabel("Role 1").fill("Lookout");
  await page.getByLabel("Role 2").fill("Fixer");
  await page.getByRole("button", { name: "Save location" }).click();

  await expect(page.getByText(savedLocationName, { exact: true })).toBeVisible();
  await page.getByText(savedLocationName, { exact: true }).click();
  await page.getByLabel("Location name").fill(updatedLocationName);
  await page.getByLabel("Role 2").fill("Driver");
  await page.getByRole("button", { name: "Save location" }).click();

  await page.reload();
  const updatedLocationCard = page.getByRole("button", { name: new RegExp(updatedLocationName) });
  await expect(updatedLocationCard).toBeVisible();
  await expect(updatedLocationCard).toContainText("Lookout");
  await expect(updatedLocationCard).toContainText("Driver");

  await page.getByRole("link", { name: "Open collections" }).click();
  await expect(page).toHaveURL("/library/collections");
  await page.getByRole("button", { name: "New" }).click();
  await page.getByPlaceholder("Collection name").fill(collectionName);
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page).toHaveURL(/\/library\/collections\/.+$/);
  await page.getByRole("button", { name: `Import ${updatedLocationName}` }).click();
  await expect(page.getByText(updatedLocationName, { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: `Remove ${updatedLocationName}` })).toBeVisible();

  await page.goto("/play/pass-and-play");
  await page.getByRole("button", { name: "Collection" }).click();
  await page.getByLabel("Collection").selectOption({ label: collectionName });
  await expect(page.getByText(updatedLocationName, { exact: true })).toBeVisible();
  await expect(page.getByText("1 locations ready for this round")).toBeVisible();

  await page.getByPlaceholder("Player 1").fill("Avery");
  await page.getByPlaceholder("Player 2").fill("Jordan");
  await page.getByPlaceholder("Player 3").fill("Casey");
  await page.getByRole("button", { name: "Start Game" }).click();

  await expect(page).toHaveURL(/\/play\/pass-and-play\/[A-Z0-9]+$/);
  await expect(page.getByText("Player 1 of 3")).toBeVisible();
});
