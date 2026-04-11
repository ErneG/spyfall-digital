import { expect, test, type Page } from "@playwright/test";

import { ensureSignedIn } from "./helpers/auth";

async function createLibraryCollection(page: Page) {
  await ensureSignedIn(page);

  const suffix = `${Date.now()}`;
  const savedLocationName = `Embassy Annex ${suffix}`;
  const collectionName = `Room Import ${suffix}`;

  await page.goto("/library");
  await page.getByRole("button", { name: "New saved location" }).click();
  await page.getByLabel("Location name").fill(savedLocationName);
  await page.getByLabel("Role 1").fill("Handler");
  await page.getByLabel("Role 2").fill("Courier");
  await page.getByRole("button", { name: "Save location" }).click();

  await expect(page.getByText(savedLocationName, { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Open collections" }).click();
  await expect(page).toHaveURL("/library/collections");
  const firstCollectionButton = page.getByRole("button", { name: "Create your first collection" });
  if (await firstCollectionButton.isVisible().catch(() => false)) {
    await firstCollectionButton.click();
  } else {
    await page.getByRole("button", { name: "New" }).click();
  }
  await expect(page.getByPlaceholder("Collection name")).toBeVisible();
  await page.getByPlaceholder("Collection name").fill(collectionName);
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page).toHaveURL(/\/library\/collections\/.+$/);
  await page.getByRole("button", { name: `Import ${savedLocationName}` }).click();
  await expect(page.getByRole("button", { name: `Remove ${savedLocationName}` })).toBeVisible();

  return { collectionName };
}

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

test("online room can start from a Library collection source and move players into runtime", async ({
  browser,
}) => {
  const hostContext = await browser.newContext();
  const guestOneContext = await browser.newContext();
  const guestTwoContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  const guestOnePage = await guestOneContext.newPage();
  const guestTwoPage = await guestTwoContext.newPage();

  try {
    const { collectionName } = await createLibraryCollection(hostPage);

    await hostPage.goto("/");
    await hostPage.getByRole("button", { name: /create room/i }).click();
    await hostPage.getByPlaceholder(/your name/i).fill("Avery");
    await hostPage.getByRole("button", { name: /^create$/i }).click();

    await expect(hostPage).toHaveURL(/\/room\/[A-Z0-9]{5}$/);

    const roomCodeMatch = hostPage.url().match(/\/room\/([A-Z0-9]{5})$/);
    expect(roomCodeMatch).not.toBeNull();
    const roomCode = roomCodeMatch?.[1];
    if (!roomCode) {
      throw new Error("Expected room code in host URL");
    }

    await hostPage.getByRole("button", { name: "Use Collection" }).click();
    await expect(hostPage.getByRole("dialog", { name: "Use a Library Collection" })).toBeVisible();
    const collectionCard = hostPage
      .getByText(collectionName, { exact: true })
      .locator("xpath=ancestor::div[.//button[normalize-space()='Use']][1]");
    await collectionCard.getByRole("button", { name: "Use" }).click();

    await expect(hostPage.getByText(/^1 \/ \d+ locations selected$/)).toBeVisible();

    for (const [page, name] of [
      [guestOnePage, "Blake"],
      [guestTwoPage, "Casey"],
    ] as const) {
      await page.goto("/");
      await page.getByRole("button", { name: /join room/i }).click();
      await page.getByPlaceholder(/your name/i).fill(name);
      await page.getByPlaceholder(/room code/i).fill(roomCode);
      await page.getByRole("button", { name: /^join$/i }).click();
      await expect(page).toHaveURL(new RegExp(`/room/${roomCode}$`));
    }

    await expect(hostPage.getByText("Blake")).toBeVisible({ timeout: 7000 });
    await expect(hostPage.getByText("Casey")).toBeVisible({ timeout: 7000 });

    await hostPage.getByRole("button", { name: "Start Game" }).click();

    await expect(hostPage).toHaveURL(new RegExp(`/room/${roomCode}/play$`));
    await expect(guestOnePage).toHaveURL(new RegExp(`/room/${roomCode}/play$`));
    await expect(guestTwoPage).toHaveURL(new RegExp(`/room/${roomCode}/play$`));

    await expect(hostPage.getByText(/tap to reveal/i)).toBeVisible();
    await expect(guestOnePage.getByText(/tap to reveal/i)).toBeVisible();
    await expect(guestTwoPage.getByText(/tap to reveal/i)).toBeVisible();
  } finally {
    await hostContext.close();
    await guestOneContext.close();
    await guestTwoContext.close();
  }
});
