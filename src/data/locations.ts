/**
 * Default Spyfall locations and roles — based on the original board game.
 * Edition 1: 28 locations, Edition 2: 22 locations.
 */

export interface LocationSeed {
  name: string;
  edition: number;
  roles: string[];
}

export const DEFAULT_LOCATIONS: LocationSeed[] = [
  // ─── Edition 1 ───────────────────────────────────────────
  { name: "Airplane", edition: 1, roles: ["Pilot", "Co-pilot", "Flight Attendant", "Passenger", "Air Marshal", "First Class Passenger"] },
  { name: "Bank", edition: 1, roles: ["Teller", "Manager", "Security Guard", "Armored Car Driver", "Customer", "Robber"] },
  { name: "Beach", edition: 1, roles: ["Lifeguard", "Swimmer", "Ice Cream Vendor", "Surfer", "Tourist", "Beach Volleyball Player"] },
  { name: "Broadway Theater", edition: 1, roles: ["Actor", "Director", "Stagehand", "Audience Member", "Costume Designer", "Usher"] },
  { name: "Casino", edition: 1, roles: ["Dealer", "Gambler", "Bouncer", "Bartender", "Pit Boss", "Security"] },
  { name: "Cathedral", edition: 1, roles: ["Priest", "Nun", "Tourist", "Choir Singer", "Parishioner", "Organ Player"] },
  { name: "Circus Tent", edition: 1, roles: ["Ringmaster", "Clown", "Acrobat", "Lion Tamer", "Magician", "Audience Member"] },
  { name: "Corporate Party", edition: 1, roles: ["CEO", "Manager", "Intern", "Entertainer", "Secretary", "Accountant"] },
  { name: "Crusader Army", edition: 1, roles: ["Knight", "Squire", "Archer", "Monk", "Prisoner", "Siege Engineer"] },
  { name: "Day Spa", edition: 1, roles: ["Masseuse", "Customer", "Manicurist", "Receptionist", "Dermatologist", "Yoga Instructor"] },
  { name: "Embassy", edition: 1, roles: ["Ambassador", "Diplomat", "Security Guard", "Secretary", "Tourist", "Refugee"] },
  { name: "Hospital", edition: 1, roles: ["Doctor", "Nurse", "Patient", "Surgeon", "Intern", "Visitor"] },
  { name: "Hotel", edition: 1, roles: ["Doorman", "Manager", "Bellboy", "Guest", "Maid", "Chef"] },
  { name: "Military Base", edition: 1, roles: ["Colonel", "Private", "Medic", "Sniper", "Officer", "Tank Commander"] },
  { name: "Movie Studio", edition: 1, roles: ["Director", "Actor", "Cameraman", "Costume Designer", "Stunt Double", "Producer"] },
  { name: "Ocean Liner", edition: 1, roles: ["Captain", "Passenger", "Bartender", "Musician", "Rich Couple", "Waiter"] },
  { name: "Passenger Train", edition: 1, roles: ["Conductor", "Passenger", "Engineer", "Stoker", "Restaurant Chef", "Border Agent"] },
  { name: "Pirate Ship", edition: 1, roles: ["Captain", "First Mate", "Lookout", "Prisoner", "Cook", "Cannoneer"] },
  { name: "Polar Station", edition: 1, roles: ["Expedition Leader", "Biologist", "Geologist", "Meteorologist", "Radioman", "Medic"] },
  { name: "Police Station", edition: 1, roles: ["Detective", "Patrol Officer", "Criminal", "Forensic Scientist", "Archivist", "Lawyer"] },
  { name: "Restaurant", edition: 1, roles: ["Chef", "Waiter", "Customer", "Musician", "Food Critic", "Hostess"] },
  { name: "School", edition: 1, roles: ["Teacher", "Student", "Principal", "Janitor", "Cafeteria Lady", "Security Guard"] },
  { name: "Service Station", edition: 1, roles: ["Mechanic", "Customer", "Manager", "Car Washer", "Tow Truck Driver", "Gas Attendant"] },
  { name: "Space Station", edition: 1, roles: ["Commander", "Scientist", "Engineer", "Pilot", "Doctor", "Alien"] },
  { name: "Submarine", edition: 1, roles: ["Captain", "Navigator", "Sonar Operator", "Sailor", "Cook", "Engineer"] },
  { name: "Supermarket", edition: 1, roles: ["Cashier", "Butcher", "Customer", "Janitor", "Shelf Stocker", "Manager"] },
  { name: "University", edition: 1, roles: ["Professor", "Student", "Dean", "Researcher", "Janitor", "Psychologist"] },
  { name: "World War II Battle", edition: 1, roles: ["General", "Medic", "Soldier", "Spy", "Tank Commander", "Radio Operator"] },

  // ─── Edition 2 ───────────────────────────────────────────
  { name: "Amusement Park", edition: 2, roles: ["Ride Operator", "Mascot", "Food Vendor", "Visitor", "Security Guard", "Ticket Seller"] },
  { name: "Art Museum", edition: 2, roles: ["Curator", "Artist", "Security Guard", "Visitor", "Art Thief", "Restoration Expert"] },
  { name: "Candy Factory", edition: 2, roles: ["Factory Worker", "Inspector", "Oompa-Loompa", "Machine Operator", "Taster", "Owner"] },
  { name: "Cat Show", edition: 2, roles: ["Judge", "Cat Owner", "Veterinarian", "Spectator", "Groomer", "Security"] },
  { name: "Cemetery", edition: 2, roles: ["Gravedigger", "Mourner", "Priest", "Florist", "Relative", "Ghost Hunter"] },
  { name: "Coal Mine", edition: 2, roles: ["Miner", "Geologist", "Safety Inspector", "Foreman", "Canary Keeper", "Explosives Expert"] },
  { name: "Construction Site", edition: 2, roles: ["Foreman", "Crane Operator", "Electrician", "Safety Inspector", "Architect", "Laborer"] },
  { name: "Gaming Convention", edition: 2, roles: ["Cosplayer", "Gamer", "Vendor", "Developer", "Journalist", "Security Guard"] },
  { name: "Jazz Club", edition: 2, roles: ["Saxophonist", "Singer", "Bartender", "Bouncer", "Patron", "Drummer"] },
  { name: "Library", edition: 2, roles: ["Librarian", "Student", "Old Man", "Homeless Person", "Book Club Member", "Author"] },
  { name: "Night Club", edition: 2, roles: ["DJ", "Bouncer", "Bartender", "Dancer", "Regular", "VIP Guest"] },
  { name: "Race Track", edition: 2, roles: ["Driver", "Mechanic", "Spectator", "Bookie", "Reporter", "Track Official"] },
  { name: "Retirement Home", edition: 2, roles: ["Nurse", "Resident", "Visitor", "Activities Director", "Chef", "Janitor"] },
  { name: "Rock Concert", edition: 2, roles: ["Guitarist", "Drummer", "Singer", "Roadie", "Groupie", "Sound Engineer"] },
  { name: "Sushi Restaurant", edition: 2, roles: ["Sushi Chef", "Customer", "Waiter", "Manager", "Fish Supplier", "Food Critic"] },
  { name: "Vineyard", edition: 2, roles: ["Winemaker", "Grape Picker", "Tour Guide", "Wine Taster", "Vineyard Owner", "Sommelier"] },
  { name: "Wedding", edition: 2, roles: ["Bride", "Groom", "Priest", "Best Man", "Wedding Planner", "Photographer"] },
  { name: "Zoo", edition: 2, roles: ["Zookeeper", "Veterinarian", "Visitor", "Tour Guide", "Animal Trainer", "Gift Shop Clerk"] },
];
