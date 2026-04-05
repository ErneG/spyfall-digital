import type { LocationTranslations } from "../types";

export const lvLocations: LocationTranslations = {
  // ─── Transports ─────────────────────────────────────────
  Airplane: {
    name: "Lidmašīna",
    roles: [
      "Pilots",
      "Otrais pilots",
      "Stjuarte",
      "Pasažieris",
      "Gaisa maršals",
      "Pirmās klases pasažieris",
    ],
  },
  "Ocean Liner": {
    name: "Okeāna laineris",
    roles: ["Kapteinis", "Pasažieris", "Bārmenis", "Mūziķis", "Bagāts pāris", "Viesmīlis"],
  },
  "Passenger Train": {
    name: "Pasažieru vilciens",
    roles: [
      "Konduktors",
      "Pasažieris",
      "Mašīnists",
      "Kurinātājs",
      "Restorāna pavārs",
      "Robežsargs",
    ],
  },
  "Pirate Ship": {
    name: "Pirātu kuģis",
    roles: ["Kapteinis", "Pirmais palīgs", "Novērotājs", "Gūsteknis", "Pavārs", "Kanonīrs"],
  },
  Submarine: {
    name: "Zemūdene",
    roles: ["Kapteinis", "Navigators", "Sonāra operators", "Jūrnieks", "Pavārs", "Inženieris"],
  },
  "Sightseeing Bus": {
    name: "Apskates autobuss",
    roles: [
      "Tūrists",
      "Autobusa vadītājs",
      "Gids",
      "Kabatzaglis",
      "Fotogrāfs",
      "Suvenīru pārdevējs",
    ],
  },
  Subway: {
    name: "Metro",
    roles: [
      "Pasažieris",
      "Ielu mūziķis",
      "Kabatzaglis",
      "Transporta inspektors",
      "Vadītājs",
      "Tūrists",
    ],
  },

  // ─── Izklaide ───────────────────────────────────────────
  "Broadway Theater": {
    name: "Brodvejas teātris",
    roles: [
      "Aktieris",
      "Režisors",
      "Skatuves strādnieks",
      "Skatītājs",
      "Kostīmu mākslinieks",
      "Kontrolieris",
    ],
  },
  "Circus Tent": {
    name: "Cirka telts",
    roles: ["Šovvadītājs", "Klauns", "Akrobāts", "Lauvu savaldītājs", "Burvis", "Skatītājs"],
  },
  "Movie Studio": {
    name: "Kinostudija",
    roles: [
      "Režisors",
      "Aktieris",
      "Operators",
      "Kostīmu mākslinieks",
      "Kaskadieris",
      "Producents",
    ],
  },
  "Amusement Park": {
    name: "Atrakciju parks",
    roles: [
      "Atrakciju operators",
      "Talismans",
      "Ēdienu pārdevējs",
      "Apmeklētājs",
      "Apsargs",
      "Biļešu pārdevējs",
    ],
  },
  "Art Museum": {
    name: "Mākslas muzejs",
    roles: ["Kurators", "Mākslinieks", "Apsargs", "Apmeklētājs", "Mākslas zaglis", "Restaurators"],
  },
  "Gaming Convention": {
    name: "Spēļu konvents",
    roles: ["Kosplejs", "Spēlētājs", "Pārdevējs", "Izstrādātājs", "Žurnālists", "Apsargs"],
  },
  Stadium: {
    name: "Stadions",
    roles: ["Sportists", "Treneris", "Tiesnesis", "Skatītājs", "Apsargs", "Pārdevējs"],
  },

  // ─── Naktsdzīve un pasākumi ─────────────────────────────
  Casino: {
    name: "Kazino",
    roles: ["Dīleris", "Azartspēlētājs", "Izlaidējs", "Bārmenis", "Zāles pārzinis", "Apsardze"],
  },
  "Corporate Party": {
    name: "Korporatīvā ballīte",
    roles: [
      "Izpilddirektors",
      "Vadītājs",
      "Praktikants",
      "Izklaidētājs",
      "Sekretāre",
      "Grāmatvedis",
    ],
  },
  "Night Club": {
    name: "Naktsklubs",
    roles: ["Dīdžejs", "Izlaidējs", "Bārmenis", "Dejotāja", "Pastāvīgais klients", "VIP viesis"],
  },
  "Jazz Club": {
    name: "Džeza klubs",
    roles: [
      "Saksofonists",
      "Dziedātāja",
      "Bārmenis",
      "Izlaidējs",
      "Pastāvīgais klients",
      "Bundzinieks",
    ],
  },
  "Rock Concert": {
    name: "Rokkoncerts",
    roles: ["Ģitārists", "Bundzinieks", "Dziedātājs", "Tehniķis", "Fane", "Skaņu inženieris"],
  },
  "Cat Show": {
    name: "Kaķu izstāde",
    roles: ["Tiesnesis", "Kaķu īpašnieks", "Veterinārārsts", "Skatītājs", "Kopējs", "Apsardze"],
  },
  Wedding: {
    name: "Kāzas",
    roles: ["Līgava", "Līgavainis", "Priesteris", "Liecinieks", "Kāzu organizators", "Fotogrāfs"],
  },

  // ─── Ēdināšana ──────────────────────────────────────────
  Restaurant: {
    name: "Restorāns",
    roles: ["Šefpavārs", "Viesmīlis", "Klients", "Mūziķis", "Ēdienu kritiķis", "Hostese"],
  },
  "Sushi Restaurant": {
    name: "Suši restorāns",
    roles: [
      "Suši šefpavārs",
      "Klients",
      "Viesmīlis",
      "Vadītājs",
      "Zivju piegādātājs",
      "Ēdienu kritiķis",
    ],
  },
  Hotel: {
    name: "Viesnīca",
    roles: ["Durvju sargs", "Vadītājs", "Nesējs", "Viesis", "Istabene", "Šefpavārs"],
  },
  "Day Spa": {
    name: "Dienas spa",
    roles: [
      "Masieris",
      "Klients",
      "Manikīriste",
      "Reģistratūras darbinieks",
      "Dermatologs",
      "Jogas instruktors",
    ],
  },
  Vineyard: {
    name: "Vīna dārzs",
    roles: [
      "Vīndaris",
      "Vīnogu lasītājs",
      "Gids",
      "Vīna degustētājs",
      "Vīna dārza īpašnieks",
      "Somelē",
    ],
  },
  "Candy Factory": {
    name: "Konfekšu fabrika",
    roles: [
      "Rūpnīcas strādnieks",
      "Inspektors",
      "Rūķītis",
      "Mašīnu operators",
      "Degustētājs",
      "Īpašnieks",
    ],
  },

  // ─── Valdība un likums ──────────────────────────────────
  Embassy: {
    name: "Vēstniecība",
    roles: ["Vēstnieks", "Diplomāts", "Apsargs", "Sekretārs", "Tūrists", "Bēglis"],
  },
  "Police Station": {
    name: "Policijas iecirknis",
    roles: [
      "Detektīvs",
      "Patruļpolicists",
      "Noziedznieks",
      "Kriminālistikas eksperts",
      "Arhivārs",
      "Advokāts",
    ],
  },
  "The United Nations": {
    name: "Apvienoto Nāciju Organizācija",
    roles: ["Diplomāts", "Tulks", "Ģenerālsekretārs", "Apsargs", "Žurnālists", "Tūrists"],
  },
  Jail: {
    name: "Cietums",
    roles: ["Ieslodzītais", "Apsargs", "Priekšnieks", "Advokāts", "Ziņotājs", "Apmeklētājs"],
  },

  // ─── Militārais un kaujas ───────────────────────────────
  "Military Base": {
    name: "Militārā bāze",
    roles: ["Pulkvedis", "Ierindnieks", "Mediķis", "Snaiperis", "Virsnieks", "Tanku komandieris"],
  },
  "Crusader Army": {
    name: "Krustneša armija",
    roles: [
      "Bruņinieks",
      "Ieroču nesējs",
      "Strēlnieks",
      "Mūks",
      "Gūsteknis",
      "Aplenkuma inženieris",
    ],
  },
  "World War II Battle": {
    name: "Otrā pasaules kara kauja",
    roles: ["Ģenerālis", "Mediķis", "Karavīrs", "Spiegs", "Tanku komandieris", "Radio operators"],
  },

  // ─── Izglītība un zinātne ───────────────────────────────
  School: {
    name: "Skola",
    roles: ["Skolotājs", "Skolēns", "Direktors", "Sētnieks", "Ēdnīcas darbiniece", "Apsargs"],
  },
  University: {
    name: "Universitāte",
    roles: ["Profesors", "Students", "Dekāns", "Pētnieks", "Sētnieks", "Psihologs"],
  },
  Library: {
    name: "Bibliotēka",
    roles: [
      "Bibliotekārs",
      "Students",
      "Vecais vīrs",
      "Bezpajumtnieks",
      "Grāmatu kluba biedrs",
      "Rakstnieks",
    ],
  },
  "Space Station": {
    name: "Kosmosa stacija",
    roles: ["Komandieris", "Zinātnieks", "Inženieris", "Pilots", "Ārsts", "Citplanētietis"],
  },
  "Polar Station": {
    name: "Polārstacija",
    roles: [
      "Ekspedīcijas vadītājs",
      "Biologs",
      "Ģeologs",
      "Meteorologs",
      "Radiooperators",
      "Mediķis",
    ],
  },

  // ─── Veselības aprūpe ───────────────────────────────────
  Hospital: {
    name: "Slimnīca",
    roles: ["Ārsts", "Medmāsa", "Pacients", "Ķirurgs", "Rezidents", "Apmeklētājs"],
  },
  "Retirement Home": {
    name: "Pansionāts",
    roles: ["Medmāsa", "Iemītnieks", "Apmeklētājs", "Aktivitāšu vadītājs", "Šefpavārs", "Sētnieks"],
  },

  // ─── Ārā un daba ────────────────────────────────────────
  Beach: {
    name: "Pludmale",
    roles: [
      "Glābējs",
      "Peldētājs",
      "Saldējuma pārdevējs",
      "Sērfotājs",
      "Tūrists",
      "Pludmales volejbolists",
    ],
  },
  Zoo: {
    name: "Zooloģiskais dārzs",
    roles: [
      "Zoodārza uzraugs",
      "Veterinārārsts",
      "Apmeklētājs",
      "Gids",
      "Dzīvnieku treneris",
      "Suvenīru veikala pārdevējs",
    ],
  },
  Cemetery: {
    name: "Kapsēta",
    roles: ["Kapracis", "Sērotājs", "Priesteris", "Florists", "Radinieks", "Spoku mednieks"],
  },
  "Harbor Docks": {
    name: "Ostas piestātne",
    roles: [
      "Ostas strādnieks",
      "Kuģa kapteinis",
      "Muitas inspektors",
      "Zvejnieks",
      "Kontrabandists",
      "Ostas kapteinis",
    ],
  },
  "Coal Mine": {
    name: "Ogļu raktuve",
    roles: [
      "Raktuvnieks",
      "Ģeologs",
      "Drošības inspektors",
      "Brigadieris",
      "Kanārijputna turētājs",
      "Spridzināšanas eksperts",
    ],
  },

  // ─── Darbavieta ─────────────────────────────────────────
  Bank: {
    name: "Banka",
    roles: ["Kasieris", "Vadītājs", "Apsargs", "Inkasators", "Klients", "Laupītājs"],
  },
  Supermarket: {
    name: "Lielveikals",
    roles: ["Kasieris", "Miesnieks", "Klients", "Sētnieks", "Plauktu kārtotājs", "Vadītājs"],
  },
  "Service Station": {
    name: "Autoserviss",
    roles: [
      "Mehāniķis",
      "Klients",
      "Vadītājs",
      "Automazgātājs",
      "Evakuatora vadītājs",
      "Degvielas uzpildītājs",
    ],
  },
  "Gas Station": {
    name: "Degvielas uzpildes stacija",
    roles: ["Operators", "Klients", "Mehāniķis", "Kasieris", "Automazgātājs", "Vadītājs"],
  },
  "Construction Site": {
    name: "Būvlaukums",
    roles: [
      "Brigadieris",
      "Celtņa operators",
      "Elektriķis",
      "Drošības inspektors",
      "Arhitekts",
      "Strādnieks",
    ],
  },
  "Ice Hockey Stadium": {
    name: "Hokeja stadions",
    roles: ["Hokejists", "Treneris", "Tiesnesis", "Skatītājs", "Vārtsargs", "Komentētājs"],
  },
  "Race Track": {
    name: "Sacīkšu trase",
    roles: ["Braucējs", "Mehāniķis", "Skatītājs", "Bukmekers", "Reportieris", "Trases amatpersona"],
  },
  Cathedral: {
    name: "Katedrāle",
    roles: [
      "Priesteris",
      "Mūķene",
      "Tūrists",
      "Kora dziedātājs",
      "Draudzes loceklis",
      "Ērģelnieks",
    ],
  },
};
