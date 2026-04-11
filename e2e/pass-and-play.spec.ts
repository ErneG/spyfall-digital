import { expect, test } from "@playwright/test";

test("pass-and-play setup previews the source and starts a round", async ({ page }) => {
  await page.goto("/play/pass-and-play");

  await expect(
    page.getByRole("heading", { name: "Build the round before anyone starts peeking." }),
  ).toBeVisible();
  await expect(page.getByText("Airplane")).toBeVisible();
  await expect(page.getByRole("button", { name: "Collection" })).toBeDisabled();

  await page.getByPlaceholder("Player 1").fill("Avery");
  await page.getByPlaceholder("Player 2").fill("Jordan");
  await page.getByPlaceholder("Player 3").fill("Casey");
  await page.getByRole("button", { name: "Start Game" }).click();

  await expect(page).toHaveURL(/\/play\/pass-and-play\/[A-Z0-9]+$/);
  await expect(page.getByText("Player 1 of 3")).toBeVisible();
  await expect(page.getByRole("button", { name: /I’m Avery|I'm Avery/ })).toBeVisible();
});
