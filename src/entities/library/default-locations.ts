/**
 * Default Spyfall locations and roles — based on the original board game.
 * Organized into 10 thematic categories.
 */

export { LOCATION_CATEGORIES, type LocationCategory } from "@/shared/config/location-catalog";

export interface DefaultLocation {
  category: string;
  name: string;
  roles: string[];
}

const BARTENDER = "Bartender";
const CUSTOMER = "Customer";
const EDUCATION_AND_SCIENCE = "Education & Science";
const FOOD_AND_DINING = "Food & Dining";
const GOVERNMENT_AND_LAW = "Government & Law";
const NIGHTLIFE_AND_EVENTS = "Nightlife & Events";
const OUTDOORS_AND_NATURE = "Outdoors & Nature";
const SECURITY_GUARD = "Security Guard";
const STUDENT = "Student";
const TOURIST = "Tourist";
const VISITOR = "Visitor";

export const DEFAULT_LOCATIONS: DefaultLocation[] = [
  // ─── Transportation ─────────────────────────────────────
  {
    name: "Airplane",
    category: "Transportation",
    roles: [
      "Pilot",
      "Co-pilot",
      "Flight Attendant",
      "Passenger",
      "Air Marshal",
      "First Class Passenger",
    ],
  },
  {
    name: "Ocean Liner",
    category: "Transportation",
    roles: ["Captain", "Passenger", BARTENDER, "Musician", "Rich Couple", "Waiter"],
  },
  {
    name: "Passenger Train",
    category: "Transportation",
    roles: ["Conductor", "Passenger", "Engineer", "Stoker", "Restaurant Chef", "Border Agent"],
  },
  {
    name: "Pirate Ship",
    category: "Transportation",
    roles: ["Captain", "First Mate", "Lookout", "Prisoner", "Cook", "Cannoneer"],
  },
  {
    name: "Submarine",
    category: "Transportation",
    roles: ["Captain", "Navigator", "Sonar Operator", "Sailor", "Cook", "Engineer"],
  },
  {
    name: "Sightseeing Bus",
    category: "Transportation",
    roles: [TOURIST, "Bus Driver", "Tour Guide", "Pickpocket", "Photographer", "Souvenir Seller"],
  },
  {
    name: "Subway",
    category: "Transportation",
    roles: ["Commuter", "Busker", "Pickpocket", "Transit Officer", "Driver", TOURIST],
  },

  // ─── Entertainment ──────────────────────────────────────
  {
    name: "Broadway Theater",
    category: "Entertainment",
    roles: ["Actor", "Director", "Stagehand", "Audience Member", "Costume Designer", "Usher"],
  },
  {
    name: "Circus Tent",
    category: "Entertainment",
    roles: ["Ringmaster", "Clown", "Acrobat", "Lion Tamer", "Magician", "Audience Member"],
  },
  {
    name: "Movie Studio",
    category: "Entertainment",
    roles: ["Director", "Actor", "Cameraman", "Costume Designer", "Stunt Double", "Producer"],
  },
  {
    name: "Amusement Park",
    category: "Entertainment",
    roles: ["Ride Operator", "Mascot", "Food Vendor", VISITOR, SECURITY_GUARD, "Ticket Seller"],
  },
  {
    name: "Art Museum",
    category: "Entertainment",
    roles: ["Curator", "Artist", SECURITY_GUARD, VISITOR, "Art Thief", "Restoration Expert"],
  },
  {
    name: "Gaming Convention",
    category: "Entertainment",
    roles: ["Cosplayer", "Gamer", "Vendor", "Developer", "Journalist", SECURITY_GUARD],
  },
  {
    name: "Stadium",
    category: "Entertainment",
    roles: ["Athlete", "Coach", "Referee", "Spectator", SECURITY_GUARD, "Vendor"],
  },

  // ─── Nightlife & Events ─────────────────────────────────
  {
    name: "Casino",
    category: NIGHTLIFE_AND_EVENTS,
    roles: ["Dealer", "Gambler", "Bouncer", BARTENDER, "Pit Boss", "Security"],
  },
  {
    name: "Corporate Party",
    category: NIGHTLIFE_AND_EVENTS,
    roles: ["CEO", "Manager", "Intern", "Entertainer", "Secretary", "Accountant"],
  },
  {
    name: "Night Club",
    category: NIGHTLIFE_AND_EVENTS,
    roles: ["DJ", "Bouncer", BARTENDER, "Dancer", "Regular", "VIP Guest"],
  },
  {
    name: "Jazz Club",
    category: NIGHTLIFE_AND_EVENTS,
    roles: ["Saxophonist", "Singer", BARTENDER, "Bouncer", "Patron", "Drummer"],
  },
  {
    name: "Rock Concert",
    category: NIGHTLIFE_AND_EVENTS,
    roles: ["Guitarist", "Drummer", "Singer", "Roadie", "Groupie", "Sound Engineer"],
  },
  {
    name: "Cat Show",
    category: NIGHTLIFE_AND_EVENTS,
    roles: ["Judge", "Cat Owner", "Veterinarian", "Spectator", "Groomer", "Security"],
  },
  {
    name: "Wedding",
    category: NIGHTLIFE_AND_EVENTS,
    roles: ["Bride", "Groom", "Priest", "Best Man", "Wedding Planner", "Photographer"],
  },

  // ─── Food & Dining ──────────────────────────────────────
  {
    name: "Restaurant",
    category: FOOD_AND_DINING,
    roles: ["Chef", "Waiter", CUSTOMER, "Musician", "Food Critic", "Hostess"],
  },
  {
    name: "Sushi Restaurant",
    category: FOOD_AND_DINING,
    roles: ["Sushi Chef", CUSTOMER, "Waiter", "Manager", "Fish Supplier", "Food Critic"],
  },
  {
    name: "Hotel",
    category: FOOD_AND_DINING,
    roles: ["Doorman", "Manager", "Bellboy", "Guest", "Maid", "Chef"],
  },
  {
    name: "Day Spa",
    category: FOOD_AND_DINING,
    roles: ["Masseuse", CUSTOMER, "Manicurist", "Receptionist", "Dermatologist", "Yoga Instructor"],
  },
  {
    name: "Vineyard",
    category: FOOD_AND_DINING,
    roles: [
      "Winemaker",
      "Grape Picker",
      "Tour Guide",
      "Wine Taster",
      "Vineyard Owner",
      "Sommelier",
    ],
  },
  {
    name: "Candy Factory",
    category: FOOD_AND_DINING,
    roles: ["Factory Worker", "Inspector", "Oompa-Loompa", "Machine Operator", "Taster", "Owner"],
  },

  // ─── Government & Law ───────────────────────────────────
  {
    name: "Embassy",
    category: GOVERNMENT_AND_LAW,
    roles: ["Ambassador", "Diplomat", SECURITY_GUARD, "Secretary", TOURIST, "Refugee"],
  },
  {
    name: "Police Station",
    category: GOVERNMENT_AND_LAW,
    roles: ["Detective", "Patrol Officer", "Criminal", "Forensic Scientist", "Archivist", "Lawyer"],
  },
  {
    name: "The United Nations",
    category: GOVERNMENT_AND_LAW,
    roles: ["Diplomat", "Translator", "Secretary General", SECURITY_GUARD, "Journalist", TOURIST],
  },
  {
    name: "Jail",
    category: GOVERNMENT_AND_LAW,
    roles: ["Prisoner", "Guard", "Warden", "Lawyer", "Snitch", VISITOR],
  },

  // ─── Military & Combat ──────────────────────────────────
  {
    name: "Military Base",
    category: "Military & Combat",
    roles: ["Colonel", "Private", "Medic", "Sniper", "Officer", "Tank Commander"],
  },
  {
    name: "Crusader Army",
    category: "Military & Combat",
    roles: ["Knight", "Squire", "Archer", "Monk", "Prisoner", "Siege Engineer"],
  },
  {
    name: "World War II Battle",
    category: "Military & Combat",
    roles: ["General", "Medic", "Soldier", "Spy", "Tank Commander", "Radio Operator"],
  },

  // ─── Education & Science ────────────────────────────────
  {
    name: "School",
    category: EDUCATION_AND_SCIENCE,
    roles: ["Teacher", STUDENT, "Principal", "Janitor", "Cafeteria Lady", SECURITY_GUARD],
  },
  {
    name: "University",
    category: EDUCATION_AND_SCIENCE,
    roles: ["Professor", STUDENT, "Dean", "Researcher", "Janitor", "Psychologist"],
  },
  {
    name: "Library",
    category: EDUCATION_AND_SCIENCE,
    roles: ["Librarian", STUDENT, "Old Man", "Homeless Person", "Book Club Member", "Author"],
  },
  {
    name: "Space Station",
    category: EDUCATION_AND_SCIENCE,
    roles: ["Commander", "Scientist", "Engineer", "Pilot", "Doctor", "Alien"],
  },
  {
    name: "Polar Station",
    category: EDUCATION_AND_SCIENCE,
    roles: ["Expedition Leader", "Biologist", "Geologist", "Meteorologist", "Radioman", "Medic"],
  },

  // ─── Healthcare ─────────────────────────────────────────
  {
    name: "Hospital",
    category: "Healthcare",
    roles: ["Doctor", "Nurse", "Patient", "Surgeon", "Intern", VISITOR],
  },
  {
    name: "Retirement Home",
    category: "Healthcare",
    roles: ["Nurse", "Resident", VISITOR, "Activities Director", "Chef", "Janitor"],
  },

  // ─── Outdoors & Nature ──────────────────────────────────
  {
    name: "Beach",
    category: OUTDOORS_AND_NATURE,
    roles: [
      "Lifeguard",
      "Swimmer",
      "Ice Cream Vendor",
      "Surfer",
      TOURIST,
      "Beach Volleyball Player",
    ],
  },
  {
    name: "Zoo",
    category: OUTDOORS_AND_NATURE,
    roles: [
      "Zookeeper",
      "Veterinarian",
      VISITOR,
      "Tour Guide",
      "Animal Trainer",
      "Gift Shop Clerk",
    ],
  },
  {
    name: "Cemetery",
    category: OUTDOORS_AND_NATURE,
    roles: ["Gravedigger", "Mourner", "Priest", "Florist", "Relative", "Ghost Hunter"],
  },
  {
    name: "Harbor Docks",
    category: OUTDOORS_AND_NATURE,
    roles: [
      "Longshoreman",
      "Ship Captain",
      "Customs Officer",
      "Fisherman",
      "Smuggler",
      "Harbor Master",
    ],
  },
  {
    name: "Coal Mine",
    category: OUTDOORS_AND_NATURE,
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
  {
    name: "Bank",
    category: "Workplace",
    roles: ["Teller", "Manager", SECURITY_GUARD, "Armored Car Driver", CUSTOMER, "Robber"],
  },
  {
    name: "Supermarket",
    category: "Workplace",
    roles: ["Cashier", "Butcher", CUSTOMER, "Janitor", "Shelf Stocker", "Manager"],
  },
  {
    name: "Service Station",
    category: "Workplace",
    roles: ["Mechanic", CUSTOMER, "Manager", "Car Washer", "Tow Truck Driver", "Gas Attendant"],
  },
  {
    name: "Gas Station",
    category: "Workplace",
    roles: ["Attendant", CUSTOMER, "Mechanic", "Cashier", "Car Washer", "Manager"],
  },
  {
    name: "Construction Site",
    category: "Workplace",
    roles: ["Foreman", "Crane Operator", "Electrician", "Safety Inspector", "Architect", "Laborer"],
  },
  {
    name: "Ice Hockey Stadium",
    category: "Workplace",
    roles: ["Hockey Player", "Coach", "Referee", "Spectator", "Goalie", "Commentator"],
  },
  {
    name: "Race Track",
    category: "Workplace",
    roles: ["Driver", "Mechanic", "Spectator", "Bookie", "Reporter", "Track Official"],
  },
  {
    name: "Cathedral",
    category: "Workplace",
    roles: ["Priest", "Nun", TOURIST, "Choir Singer", "Parishioner", "Organ Player"],
  },
];
