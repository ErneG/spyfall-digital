import type { LocationTranslations } from "../types";

const SECURITY_GUARD = "Security Guard";

export const enLocations: LocationTranslations = {
  // ─── Transportation ─────────────────────────────────────
  Airplane: {
    name: "Airplane",
    roles: [
      "Pilot",
      "Co-pilot",
      "Flight Attendant",
      "Passenger",
      "Air Marshal",
      "First Class Passenger",
    ],
  },
  "Ocean Liner": {
    name: "Ocean Liner",
    roles: ["Captain", "Passenger", "Bartender", "Musician", "Rich Couple", "Waiter"],
  },
  "Passenger Train": {
    name: "Passenger Train",
    roles: ["Conductor", "Passenger", "Engineer", "Stoker", "Restaurant Chef", "Border Agent"],
  },
  "Pirate Ship": {
    name: "Pirate Ship",
    roles: ["Captain", "First Mate", "Lookout", "Prisoner", "Cook", "Cannoneer"],
  },
  Submarine: {
    name: "Submarine",
    roles: ["Captain", "Navigator", "Sonar Operator", "Sailor", "Cook", "Engineer"],
  },
  "Sightseeing Bus": {
    name: "Sightseeing Bus",
    roles: ["Tourist", "Bus Driver", "Tour Guide", "Pickpocket", "Photographer", "Souvenir Seller"],
  },
  Subway: {
    name: "Subway",
    roles: ["Commuter", "Busker", "Pickpocket", "Transit Officer", "Driver", "Tourist"],
  },

  // ─── Entertainment ──────────────────────────────────────
  "Broadway Theater": {
    name: "Broadway Theater",
    roles: ["Actor", "Director", "Stagehand", "Audience Member", "Costume Designer", "Usher"],
  },
  "Circus Tent": {
    name: "Circus Tent",
    roles: ["Ringmaster", "Clown", "Acrobat", "Lion Tamer", "Magician", "Audience Member"],
  },
  "Movie Studio": {
    name: "Movie Studio",
    roles: ["Director", "Actor", "Cameraman", "Costume Designer", "Stunt Double", "Producer"],
  },
  "Amusement Park": {
    name: "Amusement Park",
    roles: ["Ride Operator", "Mascot", "Food Vendor", "Visitor", SECURITY_GUARD, "Ticket Seller"],
  },
  "Art Museum": {
    name: "Art Museum",
    roles: ["Curator", "Artist", SECURITY_GUARD, "Visitor", "Art Thief", "Restoration Expert"],
  },
  "Gaming Convention": {
    name: "Gaming Convention",
    roles: ["Cosplayer", "Gamer", "Vendor", "Developer", "Journalist", SECURITY_GUARD],
  },
  Stadium: {
    name: "Stadium",
    roles: ["Athlete", "Coach", "Referee", "Spectator", SECURITY_GUARD, "Vendor"],
  },

  // ─── Nightlife & Events ─────────────────────────────────
  Casino: {
    name: "Casino",
    roles: ["Dealer", "Gambler", "Bouncer", "Bartender", "Pit Boss", "Security"],
  },
  "Corporate Party": {
    name: "Corporate Party",
    roles: ["CEO", "Manager", "Intern", "Entertainer", "Secretary", "Accountant"],
  },
  "Night Club": {
    name: "Night Club",
    roles: ["DJ", "Bouncer", "Bartender", "Dancer", "Regular", "VIP Guest"],
  },
  "Jazz Club": {
    name: "Jazz Club",
    roles: ["Saxophonist", "Singer", "Bartender", "Bouncer", "Patron", "Drummer"],
  },
  "Rock Concert": {
    name: "Rock Concert",
    roles: ["Guitarist", "Drummer", "Singer", "Roadie", "Groupie", "Sound Engineer"],
  },
  "Cat Show": {
    name: "Cat Show",
    roles: ["Judge", "Cat Owner", "Veterinarian", "Spectator", "Groomer", "Security"],
  },
  Wedding: {
    name: "Wedding",
    roles: ["Bride", "Groom", "Priest", "Best Man", "Wedding Planner", "Photographer"],
  },

  // ─── Food & Dining ──────────────────────────────────────
  Restaurant: {
    name: "Restaurant",
    roles: ["Chef", "Waiter", "Customer", "Musician", "Food Critic", "Hostess"],
  },
  "Sushi Restaurant": {
    name: "Sushi Restaurant",
    roles: ["Sushi Chef", "Customer", "Waiter", "Manager", "Fish Supplier", "Food Critic"],
  },
  Hotel: { name: "Hotel", roles: ["Doorman", "Manager", "Bellboy", "Guest", "Maid", "Chef"] },
  "Day Spa": {
    name: "Day Spa",
    roles: [
      "Masseuse",
      "Customer",
      "Manicurist",
      "Receptionist",
      "Dermatologist",
      "Yoga Instructor",
    ],
  },
  Vineyard: {
    name: "Vineyard",
    roles: [
      "Winemaker",
      "Grape Picker",
      "Tour Guide",
      "Wine Taster",
      "Vineyard Owner",
      "Sommelier",
    ],
  },
  "Candy Factory": {
    name: "Candy Factory",
    roles: ["Factory Worker", "Inspector", "Oompa-Loompa", "Machine Operator", "Taster", "Owner"],
  },

  // ─── Government & Law ───────────────────────────────────
  Embassy: {
    name: "Embassy",
    roles: ["Ambassador", "Diplomat", SECURITY_GUARD, "Secretary", "Tourist", "Refugee"],
  },
  "Police Station": {
    name: "Police Station",
    roles: ["Detective", "Patrol Officer", "Criminal", "Forensic Scientist", "Archivist", "Lawyer"],
  },
  "The United Nations": {
    name: "The United Nations",
    roles: [
      "Diplomat",
      "Translator",
      "Secretary General",
      "Security Guard",
      "Journalist",
      "Tourist",
    ],
  },
  Jail: { name: "Jail", roles: ["Prisoner", "Guard", "Warden", "Lawyer", "Snitch", "Visitor"] },

  // ─── Military & Combat ──────────────────────────────────
  "Military Base": {
    name: "Military Base",
    roles: ["Colonel", "Private", "Medic", "Sniper", "Officer", "Tank Commander"],
  },
  "Crusader Army": {
    name: "Crusader Army",
    roles: ["Knight", "Squire", "Archer", "Monk", "Prisoner", "Siege Engineer"],
  },
  "World War II Battle": {
    name: "World War II Battle",
    roles: ["General", "Medic", "Soldier", "Spy", "Tank Commander", "Radio Operator"],
  },

  // ─── Education & Science ────────────────────────────────
  School: {
    name: "School",
    roles: ["Teacher", "Student", "Principal", "Janitor", "Cafeteria Lady", SECURITY_GUARD],
  },
  University: {
    name: "University",
    roles: ["Professor", "Student", "Dean", "Researcher", "Janitor", "Psychologist"],
  },
  Library: {
    name: "Library",
    roles: ["Librarian", "Student", "Old Man", "Homeless Person", "Book Club Member", "Author"],
  },
  "Space Station": {
    name: "Space Station",
    roles: ["Commander", "Scientist", "Engineer", "Pilot", "Doctor", "Alien"],
  },
  "Polar Station": {
    name: "Polar Station",
    roles: ["Expedition Leader", "Biologist", "Geologist", "Meteorologist", "Radioman", "Medic"],
  },

  // ─── Healthcare ─────────────────────────────────────────
  Hospital: {
    name: "Hospital",
    roles: ["Doctor", "Nurse", "Patient", "Surgeon", "Intern", "Visitor"],
  },
  "Retirement Home": {
    name: "Retirement Home",
    roles: ["Nurse", "Resident", "Visitor", "Activities Director", "Chef", "Janitor"],
  },

  // ─── Outdoors & Nature ──────────────────────────────────
  Beach: {
    name: "Beach",
    roles: [
      "Lifeguard",
      "Swimmer",
      "Ice Cream Vendor",
      "Surfer",
      "Tourist",
      "Beach Volleyball Player",
    ],
  },
  Zoo: {
    name: "Zoo",
    roles: [
      "Zookeeper",
      "Veterinarian",
      "Visitor",
      "Tour Guide",
      "Animal Trainer",
      "Gift Shop Clerk",
    ],
  },
  Cemetery: {
    name: "Cemetery",
    roles: ["Gravedigger", "Mourner", "Priest", "Florist", "Relative", "Ghost Hunter"],
  },
  "Harbor Docks": {
    name: "Harbor Docks",
    roles: [
      "Longshoreman",
      "Ship Captain",
      "Customs Officer",
      "Fisherman",
      "Smuggler",
      "Harbor Master",
    ],
  },
  "Coal Mine": {
    name: "Coal Mine",
    roles: [
      "Miner",
      "Geologist",
      "Safety Inspector",
      "Foreman",
      "Canary Keeper",
      "Explosives Expert",
    ],
  },

  // ─── Workplace ──────────────────────────────────────────
  Bank: {
    name: "Bank",
    roles: ["Teller", "Manager", "Security Guard", "Armored Car Driver", "Customer", "Robber"],
  },
  Supermarket: {
    name: "Supermarket",
    roles: ["Cashier", "Butcher", "Customer", "Janitor", "Shelf Stocker", "Manager"],
  },
  "Service Station": {
    name: "Service Station",
    roles: ["Mechanic", "Customer", "Manager", "Car Washer", "Tow Truck Driver", "Gas Attendant"],
  },
  "Gas Station": {
    name: "Gas Station",
    roles: ["Attendant", "Customer", "Mechanic", "Cashier", "Car Washer", "Manager"],
  },
  "Construction Site": {
    name: "Construction Site",
    roles: ["Foreman", "Crane Operator", "Electrician", "Safety Inspector", "Architect", "Laborer"],
  },
  "Ice Hockey Stadium": {
    name: "Ice Hockey Stadium",
    roles: ["Hockey Player", "Coach", "Referee", "Spectator", "Goalie", "Commentator"],
  },
  "Race Track": {
    name: "Race Track",
    roles: ["Driver", "Mechanic", "Spectator", "Bookie", "Reporter", "Track Official"],
  },
  Cathedral: {
    name: "Cathedral",
    roles: ["Priest", "Nun", "Tourist", "Choir Singer", "Parishioner", "Organ Player"],
  },
};
