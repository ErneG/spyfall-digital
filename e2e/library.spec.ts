import { expect, test } from "@playwright/test";

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
