export type Locale = "en" | "lv";

export interface Translations {
  home: {
    title: string;
    subtitle: string;
    createRoom: string;
    createRoomDesc: string;
    joinRoom: string;
    joinRoomDesc: string;
    passAndPlay: string;
    passAndPlayDesc: string;
    yourName: string;
    roomCode: string;
    create: string;
    creating: string;
    join: string;
    joining: string;
    startGame: string;
    starting: string;
    addPlayer: string;
    playerN: string; // "Player {n}"
    footer: string;
    footerInspired: string;
  };
  room: {
    roomCode: string;
    connected: string;
    reconnecting: string;
    leaveRoom: string;
    copied: string;
  };
  config: {
    gameSettings: string;
    timer: string;
    spies: string;
    spy: string;
    spiesPlural: string;
    locations: string;
    locationsSelected: string; // "{n} of {total} locations selected"
    edit: string;
    autoStartTimer: string;
    hideSpyCount: string;
    moderatorMode: string;
  };
  players: {
    title: string; // "Players ({n})"
    you: string;
    host: string;
    waitingForPlayers: string;
    needMinPlayers: string;
    waitingForHost: string;
  };
  game: {
    youAreTheSpy: string;
    spyHint: string;
    yourRole: string;
    tapToReveal: string;
    tapToHide: string;
    endGame: string;
    ending: string;
    vote: string;
    gameOver: string;
    locationWas: string;
    spyWas: string;
    spiesWere: string;
    youWereSpy: string;
    yourRoleWas: string;
    playAgain: string;
    waitingForNewRound: string;
    leaveRoom: string;
    leaveGame: string;
  };
  voting: {
    whoIsSpy: string;
    selectSuspect: string;
    voteSubmitted: string;
    cancel: string;
  };
  locationGrid: {
    title: string; // "Locations ({n})"
    tapToGuess: string;
    guessTitle: string;
    guessConfirm: string;
    guessWarning: string;
    confirmGuess: string;
    guessing: string;
  };
  passAndPlay: {
    startingWith: string;
    handDeviceTo: string;
    imReady: string; // "I'm {name}"
    tapToReveal: string;
    revealMyRole: string;
    retry: string;
    fetchError: string;
    gotIt: string;
    gotItNext: string;
    everyonesReady: string;
    allPlayersReady: string;
    startPlaying: string;
    playerNofM: string; // "Player {n} of {m}"
    peekAtRole: string;
    spyGuessLocation: string;
    spyGuessTitle: string;
    spyGuessSubtitle: string;
    spyTapToGuess: string; // "{name}, tap a location to guess"
    voteNofM: string; // "Vote {n} of {m}"
    cancelVoting: string;
    whoAreYou: string;
    whoDoYouThink: string;
    backToGame: string;
    hide: string;
  };
  common: {
    back: string;
    cancel: string;
    loading: string;
    save: string;
    spy: string;
  };
  errors: {
    enterName: string;
    enterRoomCode: string;
    allNamesRequired: string;
    uniqueNames: string;
    somethingWentWrong: string;
    unexpectedError: string;
    tryAgain: string;
    failedToLoadGame: string;
    loadingGame: string;
  };
  locationSettings: {
    title: string;
    description: string;
    filter: string;
    edition1: string;
    edition2: string;
    all: string;
    none: string;
    customLocations: string;
    add: string;
  };
}

export interface LocationEntry {
  name: string;
  roles: string[];
}

export type LocationTranslations = Record<string, LocationEntry>;
