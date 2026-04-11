"use server";

import {
  applyRoomContentSource as domainApplyRoomContentSource,
  createPassAndPlayRoom as domainCreatePassAndPlayRoom,
  createRoom as domainCreateRoom,
  getRoomState as domainGetRoomState,
  joinRoom as domainJoinRoom,
  updateRoomConfig as domainUpdateRoomConfig,
} from "@/domains/room/actions";

export async function applyRoomContentSource(
  ...args: Parameters<typeof domainApplyRoomContentSource>
) {
  return domainApplyRoomContentSource(...args);
}

export async function createPassAndPlayRoom(
  ...args: Parameters<typeof domainCreatePassAndPlayRoom>
) {
  return domainCreatePassAndPlayRoom(...args);
}

export async function createRoom(...args: Parameters<typeof domainCreateRoom>) {
  return domainCreateRoom(...args);
}

export async function getRoomState(...args: Parameters<typeof domainGetRoomState>) {
  return domainGetRoomState(...args);
}

export async function joinRoom(...args: Parameters<typeof domainJoinRoom>) {
  return domainJoinRoom(...args);
}

export async function updateRoomConfig(...args: Parameters<typeof domainUpdateRoomConfig>) {
  return domainUpdateRoomConfig(...args);
}
