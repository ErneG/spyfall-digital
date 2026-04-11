export function getOnlineRoomLobbyRoute(code: string): string {
  return `/room/${code.toUpperCase()}`;
}

export function getOnlineRoomRuntimeRoute(code: string): string {
  return `${getOnlineRoomLobbyRoute(code)}/play`;
}
