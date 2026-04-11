"use server";

import { getAuthUser } from "@/shared/lib/auth-session";
import { prisma } from "@/shared/lib/prisma";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";

import {
  deleteNameInput,
  type DeleteNameInput,
  type NameHistoryItem,
  type ProfileOutput,
  updateProfileInput,
  type UpdateProfileInput,
} from "./schema";

const NOT_AUTHENTICATED_ERROR = "Not authenticated";

export async function getProfile(): Promise<ActionResult<ProfileOutput>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  try {
    const collectionCount = await prisma.locationCollection.count({
      where: { userId: user.id },
    });

    return ok({
      id: user.id,
      name: user.name,
      email: user.email,
      displayName: (user as Record<string, unknown>).displayName as string | null,
      image: user.image ?? null,
      collectionCount,
    });
  } catch (error) {
    console.error("getProfile failed:", error);
    return fail("Failed to load profile");
  }
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<ActionResult<{ displayName: string }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  const parsed = updateProfileInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { displayName: parsed.data.displayName },
    });

    return ok({ displayName: parsed.data.displayName });
  } catch (error) {
    console.error("updateProfile failed:", error);
    return fail("Failed to update profile");
  }
}

export async function getNameHistory(): Promise<ActionResult<NameHistoryItem[]>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  try {
    const names = await prisma.nameHistory.findMany({
      where: { userId: user.id },
      orderBy: { usedAt: "desc" },
      take: 20,
    });

    return ok(
      names.map((name) => ({
        id: name.id,
        name: name.name,
        usedAt: name.usedAt.toISOString(),
      })),
    );
  } catch (error) {
    console.error("getNameHistory failed:", error);
    return fail("Failed to load name history");
  }
}

export async function deleteNameFromHistory(
  input: DeleteNameInput,
): Promise<ActionResult<{ deleted: boolean }>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  const parsed = deleteNameInput.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    await prisma.nameHistory.delete({
      where: { userId_name: { userId: user.id, name: parsed.data.name } },
    });

    return ok({ deleted: true });
  } catch (error) {
    console.error("deleteNameFromHistory failed:", error);
    return fail("Failed to delete name");
  }
}

export async function getNameSuggestions(): Promise<ActionResult<string[]>> {
  const user = await getAuthUser();
  if (!user) {
    return fail(NOT_AUTHENTICATED_ERROR);
  }

  try {
    const names = await prisma.nameHistory.findMany({
      where: { userId: user.id },
      orderBy: { usedAt: "desc" },
      take: 5,
      select: { name: true },
    });

    return ok(names.map((name) => name.name));
  } catch (error) {
    console.error("getNameSuggestions failed:", error);
    return fail("Failed to load name suggestions");
  }
}
