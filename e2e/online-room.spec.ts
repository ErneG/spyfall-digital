import { expect, test } from "@playwright/test";

test("online room host and guest can meet in the same lobby", async ({ browser }) => {
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  const guestPage = await guestContext.newPage();

  try {
    await hostPage.goto("/");
    await hostPage.getByRole("button", { name: /create room/i }).click();
    await hostPage.getByPlaceholder(/your name/i).fill("Avery");
    await hostPage.getByRole("button", { name: /^create$/i }).click();

    await expect(hostPage).toHaveURL(/\/room\/[A-Z0-9]{5}$/);
    await expect(
      hostPage.getByRole("heading", { name: /gather the room before the round starts/i }),
    ).toBeVisible();
    await expect(hostPage.getByText("Avery")).toBeVisible();

    const roomCodeMatch = hostPage.url().match(/\/room\/([A-Z0-9]{5})$/);
    expect(roomCodeMatch).not.toBeNull();
    const roomCode = roomCodeMatch?.[1];
    if (!roomCode) {
      throw new Error("Expected room code in host URL");
    }

    await guestPage.goto("/");
    await guestPage.getByRole("button", { name: /join room/i }).click();
    await guestPage.getByPlaceholder(/your name/i).fill("Blake");
    await guestPage.getByPlaceholder(/room code/i).fill(roomCode);
    await guestPage.getByRole("button", { name: /^join$/i }).click();

    await expect(guestPage).toHaveURL(new RegExp(`/room/${roomCode}$`));
    await expect(
      guestPage.getByRole("heading", { name: /gather the room before the round starts/i }),
    ).toBeVisible();
    await expect(guestPage.getByText("Blake")).toBeVisible();

    await expect(hostPage.getByText("Blake")).toBeVisible({ timeout: 7000 });
    await expect(guestPage.getByText("Avery")).toBeVisible({ timeout: 7000 });
  } finally {
    await hostContext.close();
    await guestContext.close();
  }
});
