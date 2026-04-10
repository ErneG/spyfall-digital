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
    roles: ["Captain", "Passenger", "Bartender", "Musician", "Rich Couple", "Waiter"],
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
    roles: ["Tourist", "Bus Driver", "Tour Guide", "Pickpocket", "Photographer", "Souvenir Seller"],
  },
  {
    name: "Subway",
    category: "Transportation",
    roles: ["Commuter", "Busker", "Pickpocket", "Transit Officer", "Driver", "Tourist"],
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
    roles: ["Ride Operator", "Mascot", "Food Vendor", "Visitor", "Security Guard", "Ticket Seller"],
  },
  {
    name: "Art Museum",
    category: "Entertainment",
    roles: ["Curator", "Artist", "Security Guard", "Visitor", "Art Thief", "Restoration Expert"],
  },
  {
    name: "Gaming Convention",
    category: "Entertainment",
    roles: ["Cosplayer", "Gamer", "Vendor", "Developer", "Journalist", "Security Guard"],
  },
  {
    name: "Stadium",
    category: "Entertainment",
    roles: ["Athlete", "Coach", "Referee", "Spectator", "Security Guard", "Vendor"],
  },

  // ─── Nightlife & Events ─────────────────────────────────
  {
    name: "Casino",
    category: "Nightlife & Events",
    roles: ["Dealer", "Gambler", "Bouncer", "Bartender", "Pit Boss", "Security"],
  },
  {
    name: "Corporate Party",
    category: "Nightlife & Events",
    roles: ["CEO", "Manager", "Intern", "Entertainer", "Secretary", "Accountant"],
  },
  {
    name: "Night Club",
    category: "Nightlife & Events",
    roles: ["DJ", "Bouncer", "Bartender", "Dancer", "Regular", "VIP Guest"],
  },
  {
    name: "Jazz Club",
    category: "Nightlife & Events",
    roles: ["Saxophonist", "Singer", "Bartender", "Bouncer", "Patron", "Drummer"],
  },
  {
    name: "Rock Concert",
    category: "Nightlife & Events",
    roles: ["Guitarist", "Drummer", "Singer", "Roadie", "Groupie", "Sound Engineer"],
  },
  {
    name: "Cat Show",
    category: "Nightlife & Events",
    roles: ["Judge", "Cat Owner", "Veterinarian", "Spectator", "Groomer", "Security"],
  },
  {
    name: "Wedding",
    category: "Nightlife & Events",
    roles: ["Bride", "Groom", "Priest", "Best Man", "Wedding Planner", "Photographer"],
  },

  // ─── Food & Dining ──────────────────────────────────────
  {
    name: "Restaurant",
    category: "Food & Dining",
    roles: ["Chef", "Waiter", "Customer", "Musician", "Food Critic", "Hostess"],
  },
  {
    name: "Sushi Restaurant",
    category: "Food & Dining",
    roles: ["Sushi Chef", "Customer", "Waiter", "Manager", "Fish Supplier", "Food Critic"],
  },
  {
    name: "Hotel",
    category: "Food & Dining",
    roles: ["Doorman", "Manager", "Bellboy", "Guest", "Maid", "Chef"],
  },
  {
    name: "Day Spa",
    category: "Food & Dining",
    roles: [
      "Masseuse",
      "Customer",
      "Manicurist",
      "Receptionist",
      "Dermatologist",
      "Yoga Instructor",
    ],
  },
  {
    name: "Vineyard",
    category: "Food & Dining",
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
    category: "Food & Dining",
    roles: ["Factory Worker", "Inspector", "Oompa-Loompa", "Machine Operator", "Taster", "Owner"],
  },

  // ─── Government & Law ───────────────────────────────────
  {
    name: "Embassy",
    category: "Government & Law",
    roles: ["Ambassador", "Diplomat", "Security Guard", "Secretary", "Tourist", "Refugee"],
  },
  {
    name: "Police Station",
    category: "Government & Law",
    roles: ["Detective", "Patrol Officer", "Criminal", "Forensic Scientist", "Archivist", "Lawyer"],
  },
  {
    name: "The United Nations",
    category: "Government & Law",
    roles: [
      "Diplomat",
      "Translator",
      "Secretary General",
      "Security Guard",
      "Journalist",
      "Tourist",
    ],
  },
  {
    name: "Jail",
    category: "Government & Law",
    roles: ["Prisoner", "Guard", "Warden", "Lawyer", "Snitch", "Visitor"],
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
    category: "Education & Science",
    roles: ["Teacher", "Student", "Principal", "Janitor", "Cafeteria Lady", "Security Guard"],
  },
  {
    name: "University",
    category: "Education & Science",
    roles: ["Professor", "Student", "Dean", "Researcher", "Janitor", "Psychologist"],
  },
  {
    name: "Library",
    category: "Education & Science",
    roles: ["Librarian", "Student", "Old Man", "Homeless Person", "Book Club Member", "Author"],
  },
  {
    name: "Space Station",
    category: "Education & Science",
    roles: ["Commander", "Scientist", "Engineer", "Pilot", "Doctor", "Alien"],
  },
  {
    name: "Polar Station",
    category: "Education & Science",
    roles: ["Expedition Leader", "Biologist", "Geologist", "Meteorologist", "Radioman", "Medic"],
  },

  // ─── Healthcare ─────────────────────────────────────────
  {
    name: "Hospital",
    category: "Healthcare",
    roles: ["Doctor", "Nurse", "Patient", "Surgeon", "Intern", "Visitor"],
  },
  {
    name: "Retirement Home",
    category: "Healthcare",
    roles: ["Nurse", "Resident", "Visitor", "Activities Director", "Chef", "Janitor"],
  },

  // ─── Outdoors & Nature ──────────────────────────────────
  {
    name: "Beach",
    category: "Outdoors & Nature",
    roles: [
      "Lifeguard",
      "Swimmer",
      "Ice Cream Vendor",
      "Surfer",
      "Tourist",
      "Beach Volleyball Player",
    ],
  },
  {
    name: "Zoo",
    category: "Outdoors & Nature",
    roles: [
      "Zookeeper",
      "Veterinarian",
      "Visitor",
      "Tour Guide",
      "Animal Trainer",
      "Gift Shop Clerk",
    ],
  },
  {
    name: "Cemetery",
    category: "Outdoors & Nature",
    roles: ["Gravedigger", "Mourner", "Priest", "Florist", "Relative", "Ghost Hunter"],
  },
  {
    name: "Harbor Docks",
    category: "Outdoors & Nature",
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
    category: "Outdoors & Nature",
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
    roles: ["Teller", "Manager", "Security Guard", "Armored Car Driver", "Customer", "Robber"],
  },
  {
    name: "Supermarket",
    category: "Workplace",
    roles: ["Cashier", "Butcher", "Customer", "Janitor", "Shelf Stocker", "Manager"],
  },
  {
    name: "Service Station",
    category: "Workplace",
    roles: ["Mechanic", "Customer", "Manager", "Car Washer", "Tow Truck Driver", "Gas Attendant"],
  },
  {
    name: "Gas Station",
    category: "Workplace",
    roles: ["Attendant", "Customer", "Mechanic", "Cashier", "Car Washer", "Manager"],
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
    roles: ["Priest", "Nun", "Tourist", "Choir Singer", "Parishioner", "Organ Player"],
  },
];
