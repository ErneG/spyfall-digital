export const PASS_AND_PLAY_SETUP_ROUTE = "/play/pass-and-play";

export function getPassAndPlayRuntimeRoute(code: string): string {
  return `${PASS_AND_PLAY_SETUP_ROUTE}/${code.toUpperCase()}`;
}
