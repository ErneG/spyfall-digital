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

test("pass-and-play can finish a round, peek privately, and replay into round two", async ({
  page,
}) => {
  await page.goto("/play/pass-and-play");

  await page.getByPlaceholder("Player 1").fill("Avery");
  await page.getByPlaceholder("Player 2").fill("Jordan");
  await page.getByPlaceholder("Player 3").fill("Casey");
  await page.getByRole("button", { name: "Start Game" }).click();

  await expect(page).toHaveURL(/\/play\/pass-and-play\/[A-Z0-9]+$/);

  const players = ["Avery", "Jordan", "Casey"] as const;

  for (const [index, player] of players.entries()) {
    await expect(page.getByText(`Player ${index + 1} of ${players.length}`)).toBeVisible();
    await page.getByRole("button", { name: new RegExp(`I'm ${player}|I’m ${player}`) }).click();
    await page.getByRole("button", { name: new RegExp(player) }).click();

    const confirmButton =
      index === players.length - 1
        ? page.getByRole("button", { name: "Got it" })
        : page.getByRole("button", { name: "Got it, pass to next" });

    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
  }

  await expect(page.getByText("Everyone's ready!")).toBeVisible();
  await page.getByRole("button", { name: "Start Playing" }).click();

  await expect(page.getByRole("button", { name: "Peek at My Role" })).toBeVisible();
  await expect(page.getByRole("button", { name: "End Game" })).toBeVisible();

  await page.getByRole("button", { name: "Peek at My Role" }).click();
  await expect(page.getByRole("heading", { name: "Peek at Role" })).toBeVisible();
  await page.getByRole("button", { name: "Choose Player" }).click();
  await page.getByRole("button", { name: /^Jordan$/ }).click();
  await expect(page.getByRole("button", { name: "Got it" })).toBeVisible();
  await page.getByRole("button", { name: "Got it" }).click();
  await page.getByRole("button", { name: "Back" }).click();

  await expect(page.getByRole("button", { name: "End Game" })).toBeVisible();
  await page.getByRole("button", { name: "End Game" }).click();

  await expect(page.getByRole("heading", { name: "Game Over" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play Again" })).toBeVisible();
  await page.getByRole("button", { name: "Play Again" }).click();

  await expect(page.getByText("Player 1 of 3")).toBeVisible();
  await expect(page.getByRole("button", { name: /I’m Avery|I'm Avery/ })).toBeVisible();

  await page.getByRole("button", { name: /I’m Avery|I'm Avery/ }).click();
  await page.getByRole("button", { name: /Avery/ }).click();
  await page.getByRole("button", { name: "Got it, pass to next" }).click();
  await page.getByRole("button", { name: /I’m Jordan|I'm Jordan/ }).click();
  await page.getByRole("button", { name: /Jordan/ }).click();
  await page.getByRole("button", { name: "Got it, pass to next" }).click();
  await page.getByRole("button", { name: /I’m Casey|I'm Casey/ }).click();
  await page.getByRole("button", { name: /Casey/ }).click();
  await page.getByRole("button", { name: "Got it" }).click();
  await page.getByRole("button", { name: "Start Playing" }).click();

  await expect(page.getByText("Round 2")).toBeVisible();
});
