import {
  User, Guest, GuestDocument, RoomType, Room, Reservation, Stay, Folio, FolioItem,
  Payment, Refund, Invoice, HousekeepingTask, MaintenanceTicket, Hall, EventClient,
  EventBooking, Package, MenuCategory, MenuItem, RestaurantOrder, AuditLog,
  OperationalAlert, SystemSetting, UserRoleName, RolePermission, NightAuditRecord
} from '../types/pms';

const STORAGE_KEY = 'cculb_pms_db_v1';

export interface PmsDatabaseState {
  users: User[];
  rolePermissions: RolePermission[];
  guests: Guest[];
  guestDocuments: GuestDocument[];
  roomTypes: RoomType[];
  rooms: Room[];
  reservations: Reservation[];
  stays: Stay[];
  folios: Folio[];
  payments: Payment[];
  refunds: Refund[];
  invoices: Invoice[];
  housekeepingTasks: HousekeepingTask[];
  maintenanceTickets: MaintenanceTicket[];
  halls: Hall[];
  eventClients: EventClient[];
  eventBookings: EventBooking[];
  packages: Package[];
  menuCategories: MenuCategory[];
  menuItems: MenuItem[];
  restaurantOrders: RestaurantOrder[];
  auditLogs: AuditLog[];
  alerts: OperationalAlert[];
  nightAuditRecords: NightAuditRecord[];
  settings: SystemSetting;
  currentUser: User;
}

const DEFAULT_SETTINGS: SystemSetting = {
  resortName: 'CCULB Resort & Convention Hall',
  address: 'Joypara, Dohar, Dhaka - 1330, Bangladesh',
  phone: '+880 1713-456789 / +880 2-7791234',
  email: 'reservation@cculbresort.com',
  taxRatePercent: 15,
  serviceChargePercent: 10,
  currencySymbol: '৳',
  checkInTime: '14:00',
  checkOutTime: '12:00',
  allowOverbooking: false,
  requireDepositForReservation: true,
  autoNightAuditEnabled: true,
  autoNightAuditTime: '05:00',
  currentBusinessDate: '2026-08-31',
  lastNightAuditDate: '2026-08-30'
};

const SEED_USERS: User[] = [
  {
    id: 'u-1',
    name: 'Md. Tariqul Islam',
    email: 'admin@cculbresort.com',
    role: 'Super Admin',
    active: true,
    phone: '+880 1711-000001',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'u-2',
    name: 'Farhana Sultana',
    email: 'gm@cculbresort.com',
    role: 'General Manager',
    active: true,
    phone: '+880 1711-000002',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'u-3',
    name: 'Kazi Mahfuzur Rahman',
    email: 'frontdesk@cculbresort.com',
    role: 'Front Desk',
    active: true,
    phone: '+880 1711-000003',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'u-4',
    name: 'Nasreen Akhter',
    email: 'housekeeping@cculbresort.com',
    role: 'Housekeeping',
    active: true,
    phone: '+880 1711-000004',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'u-5',
    name: 'Syed Anisul Haque',
    email: 'events@cculbresort.com',
    role: 'Event Manager',
    active: true,
    phone: '+880 1711-000005',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'u-6',
    name: 'Arif Chowdhury',
    email: 'accounts@cculbresort.com',
    role: 'Accounts',
    active: true,
    phone: '+880 1711-000006',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

const SEED_ROOM_TYPES: RoomType[] = [
  {
    id: 'rt-1',
    name: 'Presidential Suite',
    description: 'Ultra-luxurious top-floor suite with private infinity view balcony, master lounge, jacuzzi, and butler service.',
    maxAdults: 4,
    maxChildren: 2,
    baseRate: 28000,
    extraAdultRate: 3500,
    extraChildRate: 2000,
    amenities: ['King Bed', 'Private Jacuzzi', 'Lounge Area', 'River View', 'Smart TV 65"', 'High-speed Wi-Fi', 'Complimentary Breakfast', 'Butler Service', 'Espresso Machine'],
    active: true,
    totalRooms: 2
  },
  {
    id: 'rt-2',
    name: 'Royal Suite',
    description: 'Opulent suite featuring master bedroom, living hall, modern bath amenities, and panoramic resort garden views.',
    maxAdults: 3,
    maxChildren: 2,
    baseRate: 18500,
    extraAdultRate: 2500,
    extraChildRate: 1500,
    amenities: ['King Bed', 'Bathtub', 'Living Area', 'Garden View', 'Smart TV 55"', 'High-speed Wi-Fi', 'Complimentary Breakfast', 'Mini Fridge'],
    active: true,
    totalRooms: 4
  },
  {
    id: 'rt-3',
    name: 'Honeymoon Suite',
    description: 'Specially decorated romantic suite with king-size canopy bed, mood lighting, aromatherapy setup, and romantic balcony.',
    maxAdults: 2,
    maxChildren: 1,
    baseRate: 15000,
    extraAdultRate: 2500,
    extraChildRate: 1200,
    amenities: ['Canopy King Bed', 'Jacuzzi Bath', 'Balcony', 'Romantic Decor', 'Flower Setup', 'Smart TV', 'Wi-Fi', 'Breakfast in Bed'],
    active: true,
    totalRooms: 4
  },
  {
    id: 'rt-4',
    name: 'Family Deluxe',
    description: 'Spacious interconnected or twin double bedrooms designed for family comfort with kids play-corner setup.',
    maxAdults: 4,
    maxChildren: 3,
    baseRate: 12500,
    extraAdultRate: 2000,
    extraChildRate: 1000,
    amenities: ['2 Queen Beds', 'Attached Bathroom', 'Balcony', 'Smart TV 43"', 'Wi-Fi', 'Complimentary Breakfast', 'Tea/Coffee Maker'],
    active: true,
    totalRooms: 8
  },
  {
    id: 'rt-5',
    name: 'Deluxe Room',
    description: 'Elegantly furnished premium room with private balcony, workstation, and serene swimming pool view.',
    maxAdults: 2,
    maxChildren: 1,
    baseRate: 8500,
    extraAdultRate: 1800,
    extraChildRate: 900,
    amenities: ['Queen Bed', 'Pool View Balcony', 'Modern Bath', 'Workstation', 'Smart TV', 'Wi-Fi', 'Complimentary Breakfast'],
    active: true,
    totalRooms: 12
  },
  {
    id: 'rt-6',
    name: 'Standard Room',
    description: 'Cozy and well-appointed room for business and budget travelers equipped with essential modern comforts.',
    maxAdults: 2,
    maxChildren: 1,
    baseRate: 5500,
    extraAdultRate: 1500,
    extraChildRate: 800,
    amenities: ['Double Bed', 'Attached Bath', 'LED TV', 'Wi-Fi', 'Work Table', 'Complimentary Breakfast'],
    active: true,
    totalRooms: 10
  }
];

const SEED_ROOMS: Room[] = [
  // 1st Floor (Deluxe & Standard)
  { id: 'rm-101', roomNumber: '101', roomTypeId: 'rt-5', roomTypeName: 'Deluxe Room', floor: 1, operationalStatus: 'Available', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-102', roomNumber: '102', roomTypeId: 'rt-5', roomTypeName: 'Deluxe Room', floor: 1, operationalStatus: 'Occupied', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-103', roomNumber: '103', roomTypeId: 'rt-5', roomTypeName: 'Deluxe Room', floor: 1, operationalStatus: 'Reserved', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-104', roomNumber: '104', roomTypeId: 'rt-5', roomTypeName: 'Deluxe Room', floor: 1, operationalStatus: 'Dirty', housekeepingStatus: 'Dirty', active: true },
  { id: 'rm-105', roomNumber: '105', roomTypeId: 'rt-6', roomTypeName: 'Standard Room', floor: 1, operationalStatus: 'Available', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-106', roomNumber: '106', roomTypeId: 'rt-6', roomTypeName: 'Standard Room', floor: 1, operationalStatus: 'Occupied', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-107', roomNumber: '107', roomTypeId: 'rt-6', roomTypeName: 'Standard Room', floor: 1, operationalStatus: 'Out of Order', housekeepingStatus: 'Dirty', active: true, notes: 'AC compressor unit repair' },
  { id: 'rm-108', roomNumber: '108', roomTypeId: 'rt-6', roomTypeName: 'Standard Room', floor: 1, operationalStatus: 'Available', housekeepingStatus: 'Clean', active: true },

  // 2nd Floor (Deluxe & Family Deluxe)
  { id: 'rm-201', roomNumber: '201', roomTypeId: 'rt-4', roomTypeName: 'Family Deluxe', floor: 2, operationalStatus: 'Occupied', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-202', roomNumber: '202', roomTypeId: 'rt-4', roomTypeName: 'Family Deluxe', floor: 2, operationalStatus: 'Available', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-203', roomNumber: '203', roomTypeId: 'rt-4', roomTypeName: 'Family Deluxe', floor: 2, operationalStatus: 'Reserved', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-204', roomNumber: '204', roomTypeId: 'rt-4', roomTypeName: 'Family Deluxe', floor: 2, operationalStatus: 'Cleaning', housekeepingStatus: 'Cleaning', active: true },
  { id: 'rm-205', roomNumber: '205', roomTypeId: 'rt-5', roomTypeName: 'Deluxe Room', floor: 2, operationalStatus: 'Occupied', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-206', roomNumber: '206', roomTypeId: 'rt-5', roomTypeName: 'Deluxe Room', floor: 2, operationalStatus: 'Available', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-207', roomNumber: '207', roomTypeId: 'rt-5', roomTypeName: 'Deluxe Room', floor: 2, operationalStatus: 'Inspected', housekeepingStatus: 'Inspected', active: true },
  { id: 'rm-208', roomNumber: '208', roomTypeId: 'rt-5', roomTypeName: 'Deluxe Room', floor: 2, operationalStatus: 'Available', housekeepingStatus: 'Clean', active: true },

  // 3rd Floor (Honeymoon Suite & Royal Suite)
  { id: 'rm-301', roomNumber: '301', roomTypeId: 'rt-3', roomTypeName: 'Honeymoon Suite', floor: 3, operationalStatus: 'Occupied', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-302', roomNumber: '302', roomTypeId: 'rt-3', roomTypeName: 'Honeymoon Suite', floor: 3, operationalStatus: 'Available', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-303', roomNumber: '303', roomTypeId: 'rt-3', roomTypeName: 'Honeymoon Suite', floor: 3, operationalStatus: 'Reserved', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-304', roomNumber: '304', roomTypeId: 'rt-2', roomTypeName: 'Royal Suite', floor: 3, operationalStatus: 'Occupied', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-305', roomNumber: '305', roomTypeId: 'rt-2', roomTypeName: 'Royal Suite', floor: 3, operationalStatus: 'Available', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-306', roomNumber: '306', roomTypeId: 'rt-2', roomTypeName: 'Royal Suite', floor: 3, operationalStatus: 'Dirty', housekeepingStatus: 'Dirty', active: true },

  // 4th Floor (Presidential Suites & Royal Suite)
  { id: 'rm-401', roomNumber: '401', roomTypeId: 'rt-1', roomTypeName: 'Presidential Suite', floor: 4, operationalStatus: 'Occupied', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-402', roomNumber: '402', roomTypeId: 'rt-1', roomTypeName: 'Presidential Suite', floor: 4, operationalStatus: 'Available', housekeepingStatus: 'Clean', active: true },
  { id: 'rm-403', roomNumber: '403', roomTypeId: 'rt-2', roomTypeName: 'Royal Suite', floor: 4, operationalStatus: 'Available', housekeepingStatus: 'Clean', active: true }
];

const SEED_GUESTS: Guest[] = [
  {
    id: 'gst-1',
    guestCode: 'GST-2026-00101',
    fullName: 'Engr. Mohammad Rahman',
    gender: 'Male',
    dateOfBirth: '1982-05-14',
    nationality: 'Bangladeshi',
    phone: '+880 1711-234567',
    email: 'm.rahman@infracon.com.bd',
    address: 'House 42, Road 11, Banani',
    city: 'Dhaka',
    country: 'Bangladesh',
    idType: 'National ID (NID)',
    idNumber: '19822692512345678',
    company: 'InfraCon Bangladesh Ltd.',
    emergencyContact: '+880 1819-987654 (Wife)',
    notes: 'VIP Guest. Prefers top floor, quiet room, late check-out requested.',
    vipStatus: true,
    totalStays: 4,
    totalNights: 9,
    totalSpend: 118500,
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'gst-2',
    guestCode: 'GST-2026-00102',
    fullName: 'Dr. Nusrat Jahan & Family',
    gender: 'Female',
    dateOfBirth: '1987-11-20',
    nationality: 'Bangladeshi',
    phone: '+880 1819-456789',
    email: 'dr.nusrat@apollo.com.bd',
    address: 'Flat 6B, Concord Tower, Dhanmondi',
    city: 'Dhaka',
    country: 'Bangladesh',
    idType: 'Passport',
    idNumber: 'EA0894562',
    company: 'Evercare Hospital',
    emergencyContact: '+880 1715-112233',
    notes: 'Requires extra bed for child. Non-smoking room essential.',
    vipStatus: false,
    totalStays: 2,
    totalNights: 4,
    totalSpend: 54000,
    createdAt: '2026-04-12T14:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'gst-3',
    guestCode: 'GST-2026-00103',
    fullName: 'Tanvir Ahmed & Farzana',
    gender: 'Male',
    dateOfBirth: '1995-02-18',
    nationality: 'Bangladeshi',
    phone: '+880 1912-789012',
    email: 'tanvir.farzana@gmail.com',
    address: 'Sector 4, Uttara',
    city: 'Dhaka',
    country: 'Bangladesh',
    idType: 'National ID (NID)',
    idNumber: '19952693898765432',
    company: 'Apex Footwear Ltd.',
    emergencyContact: '+880 1611-334455',
    notes: 'Honeymoon couple. Welcome drinks and fresh flower bouquet arranged.',
    vipStatus: true,
    totalStays: 1,
    totalNights: 3,
    totalSpend: 48000,
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'gst-4',
    guestCode: 'GST-2026-00104',
    fullName: 'Syed Ashraful Alam',
    gender: 'Male',
    dateOfBirth: '1976-08-04',
    nationality: 'Bangladeshi',
    phone: '+880 1713-998877',
    email: 'ashraf.alam@squaregroup.com',
    address: 'Gulshan 2',
    city: 'Dhaka',
    country: 'Bangladesh',
    idType: 'National ID (NID)',
    idNumber: '19762691234509876',
    company: 'Square Pharmaceuticals',
    emergencyContact: '+880 1712-445566',
    notes: 'Corporate event coordinator.',
    vipStatus: true,
    totalStays: 6,
    totalNights: 12,
    totalSpend: 245000,
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'gst-5',
    guestCode: 'GST-2026-00105',
    fullName: 'Michael Vance',
    gender: 'Male',
    dateOfBirth: '1980-04-12',
    nationality: 'British',
    phone: '+44 7700 900123',
    email: 'm.vance@unops.org',
    address: 'UNOPS Dhaka Country Office',
    city: 'Dhaka',
    country: 'Bangladesh',
    idType: 'Passport',
    idNumber: 'GB98234110',
    company: 'United Nations / UNOPS',
    emergencyContact: '+44 7700 900999',
    notes: 'UN Diplomatic rate applied. Airport shuttle requested.',
    vipStatus: true,
    totalStays: 3,
    totalNights: 7,
    totalSpend: 95000,
    createdAt: '2026-03-01T15:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z'
  }
];

const SEED_HALLS: Hall[] = [
  {
    id: 'hl-1',
    name: 'Grand Padma Ballroom',
    code: 'HALL-PADMA',
    venueType: 'Convention Hall',
    floor: 'Ground Floor, Convention Center Wing',
    description: 'Pillar-less supreme convention hall with intelligent lighting, high-fidelity line-array sound, and 800+ banquet capacity.',
    capacity: 800,
    seatingTheater: 1000,
    seatingBanquet: 750,
    seatingUShape: 180,
    seatingClassroom: 450,
    dimensions: '12,000 sq ft',
    baseRatePerDay: 180000,
    baseRateHalfDay: 105000,
    baseRatePerHour: 20000,
    amenities: ['Pillarless Hall', 'Stage & Green Room', 'Dual 4K Laser Projectors', 'Line-Array Sound', 'Central Air Conditioning', 'Dedicated Buffet Zone', 'VIP Green Room'],
    active: true
  },
  {
    id: 'hl-2',
    name: 'Meghna Convention & Banquet Hall',
    code: 'HALL-MEGHNA',
    venueType: 'Banquet Hall',
    floor: '1st Floor, Main Clubhouse',
    description: 'Medium scale modern conference & wedding banquet hall with direct attached open garden lawn access.',
    capacity: 400,
    seatingTheater: 450,
    seatingBanquet: 350,
    seatingUShape: 90,
    seatingClassroom: 200,
    dimensions: '6,500 sq ft',
    baseRatePerDay: 110000,
    baseRateHalfDay: 65000,
    baseRatePerHour: 14000,
    amenities: ['Stage Setup', 'Garden Lawn Access', 'JBL PA System', 'Central AC', 'Bridal Changing Suite', 'Dynamic Mood Lights'],
    active: true
  },
  {
    id: 'hl-3',
    name: 'Jamuna Banquet Hall',
    code: 'HALL-JAMUNA',
    venueType: 'Banquet Hall',
    floor: '2nd Floor, Lakeside Wing',
    description: 'Chic event space ideal for seminars, corporate training, engagements, and birthday galas.',
    capacity: 200,
    seatingTheater: 240,
    seatingBanquet: 180,
    seatingUShape: 60,
    seatingClassroom: 110,
    dimensions: '3,800 sq ft',
    baseRatePerDay: 75000,
    baseRateHalfDay: 45000,
    baseRatePerHour: 9500,
    amenities: ['Audio Visual System', 'Motorized Screen & Podium', 'Dual Wireless Mics', 'Buffet Serving Area', 'High-Speed Wi-Fi'],
    active: true
  },
  {
    id: 'hl-4',
    name: 'Executive Boardroom',
    code: 'ROOM-EXEC',
    venueType: 'Boardroom',
    floor: '3rd Floor, Administrative Block',
    description: 'High-level executive boardroom with ergonomic leather chairs, video conferencing, and private coffee lounge.',
    capacity: 35,
    seatingTheater: 40,
    seatingBanquet: 25,
    seatingUShape: 28,
    seatingClassroom: 30,
    dimensions: '900 sq ft',
    baseRatePerDay: 35000,
    baseRateHalfDay: 22000,
    baseRatePerHour: 4500,
    amenities: ['Solid Teak Conference Table', '85" 4K Smart Interactive Screen', 'Polycom Video Conferencing', 'High-Speed LAN', 'Dedicated Coffee Station'],
    active: true
  },
  {
    id: 'hl-5',
    name: 'Padmabati Meeting Room',
    code: 'ROOM-PADMABATI',
    venueType: 'Meeting Room',
    floor: '2nd Floor, Convention Center Wing',
    description: 'Modern compact workshop and training room equipped for corporate seminars, focus groups, and presentations.',
    capacity: 60,
    seatingTheater: 70,
    seatingBanquet: 50,
    seatingUShape: 35,
    seatingClassroom: 45,
    dimensions: '1,400 sq ft',
    baseRatePerDay: 45000,
    baseRateHalfDay: 28000,
    baseRatePerHour: 6000,
    amenities: ['Full HD Projector', 'Whiteboard & Flipcharts', 'Surround Sound', 'Ergonomic Seating', 'Individual Power Outlets'],
    active: true
  }
];

const SEED_PACKAGES: Package[] = [
  {
    id: 'pkg-1',
    name: 'Honeymoon Bliss Romance',
    description: '3 Days / 2 Nights in Honeymoon Suite, candlelight dinner by pool, romantic room decor, couple massage, and buffet breakfast.',
    packageType: 'Honeymoon',
    price: 42000,
    active: true,
    includes: ['2 Nights in Honeymoon Suite', 'Daily Gourmet Buffet Breakfast', '1 Candlelight 4-Course Dinner', 'Flower Garland & Bed Decor', 'Fruit Basket & Cake', 'Late Check-out 3 PM'],
    nightsCount: 2
  },
  {
    id: 'pkg-2',
    name: 'Deluxe Weekend Family Getaway',
    description: '2 Days / 1 Night in Family Deluxe room, swimming pool access, kids game zone tokens, barbecue dinner, and breakfast.',
    packageType: 'Family',
    price: 18500,
    active: true,
    includes: ['1 Night in Family Deluxe Room', 'Breakfast for 4 (2 Adults + 2 Kids)', 'Live BBQ Dinner Buffet', 'Unlimited Pool & Jacuzzi', 'Cycling around Resort Garden'],
    nightsCount: 1
  },
  {
    id: 'pkg-3',
    name: 'Corporate Executive Seminar (Full Day)',
    description: 'Hall booking, morning snacks with tea/coffee, 3-course executive lunch, afternoon high-tea, notepad & pens, audio-visual gear.',
    packageType: 'Corporate',
    price: 1850, // per person
    active: true,
    includes: ['Hall Venue & Sound System', 'Morning Snacks & Tea', 'Executive Buffet Lunch', 'Afternoon Hi-Tea & Pastry', 'Stationery Kit', 'Wi-Fi & Projector Screen']
  },
  {
    id: 'pkg-4',
    name: 'Royal Wedding Celebration Gala',
    description: 'Grand Padma Ballroom full day, luxury stage decoration, floral entrance, sound/lighting engineer, bridal holding suite.',
    packageType: 'Event',
    price: 350000,
    active: true,
    includes: ['Grand Padma Ballroom Full Day', 'Luxury Floral Stage Decor', 'Bridal Suite 1 Night Complimentary', 'Intelligent Dynamic Lighting', 'Red Carpet Pathway', 'Dedicated Event Coordinator']
  }
];

const SEED_MENU_CATEGORIES: MenuCategory[] = [
  { id: 'cat-1', name: 'Traditional Bengali & Royal Feast', active: true },
  { id: 'cat-2', name: 'Grills, Steaks & BBQ', active: true },
  { id: 'cat-3', name: 'Continental & Italian', active: true },
  { id: 'cat-4', name: 'Oriental & Chinese', active: true },
  { id: 'cat-5', name: 'Beverages & Fresh Juices', active: true },
  { id: 'cat-6', name: 'Desserts & Sweet Delights', active: true }
];

const SEED_MENU_ITEMS: MenuItem[] = [
  { id: 'mi-1', categoryId: 'cat-1', categoryName: 'Traditional Bengali & Royal Feast', name: 'Special Mutton Kacchi Biryani', description: 'Traditional aromatic basmati rice cooked with tender mutton cuts, saffron, aloo, and boiled egg. Served with borhani & salad.', price: 650, active: true },
  { id: 'mi-2', categoryId: 'cat-1', categoryName: 'Traditional Bengali & Royal Feast', name: 'Padma River Hilsha Curry (Mustard/Sorshe)', description: 'Fresh Padma Ilish cooked in pungent mustard gravy with green chillies. Served with steamed rice.', price: 850, active: true },
  { id: 'mi-3', categoryId: 'cat-1', categoryName: 'Traditional Bengali & Royal Feast', name: 'Bhuna Khichuri with Beef Kala Bhuna', description: 'Moong dal khichuri paired with authentic Chittagong style slow-braised beef kala bhuna.', price: 720, active: true },
  { id: 'mi-4', categoryId: 'cat-1', categoryName: 'Traditional Bengali & Royal Feast', name: 'Rupchanda Fish Fry with Salad', description: 'Whole marinated Rupchanda shallow fried to golden perfection with lemon and tartar dip.', price: 780, active: true },

  { id: 'mi-5', categoryId: 'cat-2', categoryName: 'Grills, Steaks & BBQ', name: 'Grilled Jumbo King Prawns (4 Pcs)', description: 'Garlic butter basted jumbo river prawns with sautéed veggies and herb rice.', price: 1250, active: true },
  { id: 'mi-6', categoryId: 'cat-2', categoryName: 'Grills, Steaks & BBQ', name: 'T-Bone Beef Steak (300g)', description: 'Imported prime beef cooked to preference with mushroom peppercorn sauce and mashed potato.', price: 1650, active: true },
  { id: 'mi-7', categoryId: 'cat-2', categoryName: 'Grills, Steaks & BBQ', name: 'Chicken Tikka Butter Masala & Butter Naan', description: 'Charcoal grilled chicken cubes simmered in rich creamy tomato cashew gravy with 2 butter naans.', price: 580, active: true },

  { id: 'mi-8', categoryId: 'cat-3', categoryName: 'Continental & Italian', name: 'Fettuccine Alfredo with Grilled Chicken', description: 'Fresh fettuccine pasta tossed in rich parmesan cream sauce with grilled chicken breast slices.', price: 620, active: true },
  { id: 'mi-9', categoryId: 'cat-3', categoryName: 'Continental & Italian', name: 'Wood-Fired Pizza Quattro Formaggi (12")', description: 'Mozzarella, cheddar, gorgonzola, and parmesan on hand-stretched thin crust.', price: 890, active: true },

  { id: 'mi-10', categoryId: 'cat-5', categoryName: 'Beverages & Fresh Juices', name: 'Fresh Mint Lemonade', description: 'Freshly squeezed lemon, organic garden mint, rock salt, and crushed ice.', price: 180, active: true },
  { id: 'mi-11', categoryId: 'cat-5', categoryName: 'Beverages & Fresh Juices', name: 'Royal Saffron Borhani (Glass)', description: 'Traditional yogurt drink spiced with mustard seeds, mint, roasted cumin, and black salt.', price: 150, active: true },
  { id: 'mi-12', categoryId: 'cat-6', categoryName: 'Desserts & Sweet Delights', name: 'Matka Kulfi with Pistachio & Saffron', description: 'Slow cooked condensed milk kulfi infused with Kashmiri saffron in traditional clay pot.', price: 220, active: true }
];

export function getInitialDatabase(): PmsDatabaseState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      console.warn('Could not parse saved DB, resetting to defaults');
    }
  }

  // Generate today's realistic operational data
  const today = '2026-08-31';
  const tomorrow = '2026-09-01';
  const dayAfter = '2026-09-02';
  const threeDaysLater = '2026-09-03';

  const reservations: Reservation[] = [
    {
      id: 'res-1',
      reservationNumber: 'RES-2026-00451',
      guestId: 'gst-1',
      guestName: 'Engr. Mohammad Rahman',
      guestPhone: '+880 1711-234567',
      guestEmail: 'm.rahman@infracon.com.bd',
      roomTypeId: 'rt-4',
      roomTypeName: 'Family Deluxe',
      assignedRoomId: 'rm-201',
      assignedRoomNumber: '201',
      arrivalDate: today,
      departureDate: threeDaysLater,
      adults: 2,
      children: 2,
      status: 'Checked-In',
      bookingSource: 'Corporate',
      rate: 12500,
      depositAmount: 15000,
      paidAmount: 15000,
      totalEstimatedAmount: 37500,
      specialRequests: 'High floor, extra towels, baby cot',
      createdBy: 'Front Desk - Tariqul',
      createdAt: '2026-08-25T10:00:00Z',
      updatedAt: '2026-08-31T14:30:00Z'
    },
    {
      id: 'res-2',
      reservationNumber: 'RES-2026-00452',
      guestId: 'gst-2',
      guestName: 'Dr. Nusrat Jahan & Family',
      guestPhone: '+880 1819-456789',
      roomTypeId: 'rt-5',
      roomTypeName: 'Deluxe Room',
      assignedRoomId: 'rm-102',
      assignedRoomNumber: '102',
      arrivalDate: today,
      departureDate: dayAfter,
      adults: 2,
      children: 1,
      status: 'Checked-In',
      bookingSource: 'Website Engine',
      rate: 8500,
      depositAmount: 8500,
      paidAmount: 8500,
      totalEstimatedAmount: 17000,
      specialRequests: 'Pool view room',
      createdBy: 'Online Booking Engine',
      createdAt: '2026-08-28T12:00:00Z',
      updatedAt: '2026-08-31T15:00:00Z'
    },
    {
      id: 'res-3',
      reservationNumber: 'RES-2026-00453',
      guestId: 'gst-3',
      guestName: 'Tanvir Ahmed & Farzana',
      guestPhone: '+880 1912-789012',
      roomTypeId: 'rt-3',
      roomTypeName: 'Honeymoon Suite',
      assignedRoomId: 'rm-301',
      assignedRoomNumber: '301',
      arrivalDate: today,
      departureDate: threeDaysLater,
      adults: 2,
      children: 0,
      status: 'Checked-In',
      bookingSource: 'Front Desk Walk-in',
      rate: 15000,
      packageId: 'pkg-1',
      packageName: 'Honeymoon Bliss Romance',
      depositAmount: 20000,
      paidAmount: 20000,
      totalEstimatedAmount: 45000,
      specialRequests: 'Canopy bed decoration with red roses',
      createdBy: 'Kazi Mahfuzur Rahman',
      createdAt: '2026-08-30T16:00:00Z',
      updatedAt: '2026-08-31T16:20:00Z'
    },
    {
      id: 'res-4',
      reservationNumber: 'RES-2026-00454',
      guestId: 'gst-4',
      guestName: 'Syed Ashraful Alam',
      guestPhone: '+880 1713-998877',
      roomTypeId: 'rt-1',
      roomTypeName: 'Presidential Suite',
      assignedRoomId: 'rm-401',
      assignedRoomNumber: '401',
      arrivalDate: today,
      departureDate: tomorrow,
      adults: 2,
      children: 0,
      status: 'Checked-In',
      bookingSource: 'Corporate',
      rate: 28000,
      depositAmount: 30000,
      paidAmount: 30000,
      totalEstimatedAmount: 28000,
      specialRequests: 'VIP protocol. Board meeting attendees.',
      createdBy: 'Super Admin',
      createdAt: '2026-08-20T08:00:00Z',
      updatedAt: '2026-08-31T13:00:00Z'
    },
    {
      id: 'res-5',
      reservationNumber: 'RES-2026-00455',
      guestId: 'gst-5',
      guestName: 'Michael Vance',
      guestPhone: '+44 7700 900123',
      roomTypeId: 'rt-2',
      roomTypeName: 'Royal Suite',
      assignedRoomId: 'rm-304',
      assignedRoomNumber: '304',
      arrivalDate: today,
      departureDate: tomorrow,
      adults: 1,
      children: 0,
      status: 'Checked-In',
      bookingSource: 'Booking.com',
      rate: 18500,
      depositAmount: 18500,
      paidAmount: 18500,
      totalEstimatedAmount: 18500,
      specialRequests: 'Quiet room for video conference',
      createdBy: 'Booking.com OTA Sync',
      createdAt: '2026-08-22T19:00:00Z',
      updatedAt: '2026-08-31T11:00:00Z'
    },
    {
      id: 'res-6',
      reservationNumber: 'RES-2026-00456',
      guestId: 'gst-2',
      guestName: 'Dr. Nusrat Jahan (Friend Ref)',
      guestPhone: '+880 1819-456789',
      roomTypeId: 'rt-5',
      roomTypeName: 'Deluxe Room',
      assignedRoomId: 'rm-103',
      assignedRoomNumber: '103',
      arrivalDate: today,
      departureDate: dayAfter,
      adults: 2,
      children: 0,
      status: 'Confirmed',
      bookingSource: 'Phone / Direct',
      rate: 8500,
      depositAmount: 5000,
      paidAmount: 5000,
      totalEstimatedAmount: 17000,
      specialRequests: 'Arriving at 6:00 PM',
      createdBy: 'Front Desk',
      createdAt: '2026-08-29T10:00:00Z',
      updatedAt: '2026-08-29T10:00:00Z'
    },
    {
      id: 'res-7',
      reservationNumber: 'RES-2026-00457',
      guestId: 'gst-1',
      guestName: 'Engr. Mohammad Rahman (Colleague)',
      guestPhone: '+880 1711-234567',
      roomTypeId: 'rt-4',
      roomTypeName: 'Family Deluxe',
      assignedRoomId: 'rm-203',
      assignedRoomNumber: '203',
      arrivalDate: today,
      departureDate: threeDaysLater,
      adults: 3,
      children: 1,
      status: 'Confirmed',
      bookingSource: 'Corporate',
      rate: 12500,
      depositAmount: 10000,
      paidAmount: 10000,
      totalEstimatedAmount: 37500,
      specialRequests: 'Adjacent to room 201 if possible',
      createdBy: 'Front Desk',
      createdAt: '2026-08-30T11:00:00Z',
      updatedAt: '2026-08-30T11:00:00Z'
    }
  ];

  const stays: Stay[] = [
    {
      id: 'sty-1',
      stayNumber: 'STY-2026-00311',
      reservationId: 'res-1',
      guestId: 'gst-1',
      guestName: 'Engr. Mohammad Rahman',
      roomId: 'rm-201',
      roomNumber: '201',
      roomTypeName: 'Family Deluxe',
      checkInAt: '2026-08-31T14:30:00Z',
      expectedCheckOutAt: '2026-09-03T12:00:00Z',
      status: 'Active',
      folioId: 'fol-1',
      keyCardsIssued: 2,
      verifiedId: true,
      notes: 'Checked in by Kazi. Room keycard #201-A and #201-B provided.'
    },
    {
      id: 'sty-2',
      stayNumber: 'STY-2026-00312',
      reservationId: 'res-2',
      guestId: 'gst-2',
      guestName: 'Dr. Nusrat Jahan & Family',
      roomId: 'rm-102',
      roomNumber: '102',
      roomTypeName: 'Deluxe Room',
      checkInAt: '2026-08-31T15:00:00Z',
      expectedCheckOutAt: '2026-09-02T12:00:00Z',
      status: 'Active',
      folioId: 'fol-2',
      keyCardsIssued: 2,
      verifiedId: true
    },
    {
      id: 'sty-3',
      stayNumber: 'STY-2026-00313',
      reservationId: 'res-3',
      guestId: 'gst-3',
      guestName: 'Tanvir Ahmed & Farzana',
      roomId: 'rm-301',
      roomNumber: '301',
      roomTypeName: 'Honeymoon Suite',
      checkInAt: '2026-08-31T16:20:00Z',
      expectedCheckOutAt: '2026-09-03T12:00:00Z',
      status: 'Active',
      folioId: 'fol-3',
      keyCardsIssued: 2,
      verifiedId: true
    },
    {
      id: 'sty-4',
      stayNumber: 'STY-2026-00314',
      reservationId: 'res-4',
      guestId: 'gst-4',
      guestName: 'Syed Ashraful Alam',
      roomId: 'rm-401',
      roomNumber: '401',
      roomTypeName: 'Presidential Suite',
      checkInAt: '2026-08-31T13:00:00Z',
      expectedCheckOutAt: '2026-09-01T12:00:00Z',
      status: 'Active',
      folioId: 'fol-4',
      keyCardsIssued: 3,
      verifiedId: true
    },
    {
      id: 'sty-5',
      stayNumber: 'STY-2026-00315',
      reservationId: 'res-5',
      guestId: 'gst-5',
      guestName: 'Michael Vance',
      roomId: 'rm-304',
      roomNumber: '304',
      roomTypeName: 'Royal Suite',
      checkInAt: '2026-08-31T11:00:00Z',
      expectedCheckOutAt: '2026-09-01T12:00:00Z',
      status: 'Active',
      folioId: 'fol-5',
      keyCardsIssued: 1,
      verifiedId: true
    }
  ];

  const folios: Folio[] = [
    {
      id: 'fol-1',
      folioNumber: 'FOL-2026-00881',
      stayId: 'sty-1',
      guestId: 'gst-1',
      guestName: 'Engr. Mohammad Rahman',
      roomNumber: '201',
      status: 'Open',
      items: [
        {
          id: 'item-101',
          folioId: 'fol-1',
          type: 'Room Charge',
          description: 'Night 1 Room Charge - Family Deluxe (Room 201)',
          quantity: 1,
          unitPrice: 12500,
          discount: 0,
          tax: 1875,
          total: 14375,
          postedBy: 'Night Audit System',
          createdAt: '2026-08-31T14:30:00Z'
        },
        {
          id: 'item-102',
          folioId: 'fol-1',
          type: 'Restaurant',
          description: 'Padma Dine - Dinner: Mutton Kacchi Biryani (2x), Borhani (2x)',
          quantity: 1,
          unitPrice: 1600,
          discount: 0,
          tax: 240,
          total: 1840,
          postedBy: 'Restaurant POS (Waiter Kamal)',
          createdAt: '2026-08-31T20:15:00Z',
          reference: 'ORD-2026-00101'
        },
        {
          id: 'item-103',
          folioId: 'fol-1',
          type: 'Service Charge',
          description: 'Hotel Service Charge (10%)',
          quantity: 1,
          unitPrice: 1410,
          discount: 0,
          tax: 0,
          total: 1410,
          postedBy: 'System',
          createdAt: '2026-08-31T20:15:00Z'
        }
      ],
      subtotal: 15510,
      discountTotal: 0,
      serviceChargeTotal: 1410,
      taxTotal: 2115,
      grandTotal: 17625,
      paidTotal: 15000,
      balance: 2625,
      openedAt: '2026-08-31T14:30:00Z'
    },
    {
      id: 'fol-2',
      folioNumber: 'FOL-2026-00882',
      stayId: 'sty-2',
      guestId: 'gst-2',
      guestName: 'Dr. Nusrat Jahan & Family',
      roomNumber: '102',
      status: 'Open',
      items: [
        {
          id: 'item-201',
          folioId: 'fol-2',
          type: 'Room Charge',
          description: 'Night 1 Room Charge - Deluxe Room (Room 102)',
          quantity: 1,
          unitPrice: 8500,
          discount: 0,
          tax: 1275,
          total: 9775,
          postedBy: 'Front Desk',
          createdAt: '2026-08-31T15:00:00Z'
        },
        {
          id: 'item-202',
          folioId: 'fol-2',
          type: 'Restaurant',
          description: 'Poolside Cafe - Fresh Mint Lemonade (3x), Rupchanda Fry',
          quantity: 1,
          unitPrice: 1320,
          discount: 0,
          tax: 198,
          total: 1518,
          postedBy: 'Restaurant POS',
          createdAt: '2026-08-31T18:40:00Z'
        }
      ],
      subtotal: 9820,
      discountTotal: 0,
      serviceChargeTotal: 982,
      taxTotal: 1473,
      grandTotal: 12275,
      paidTotal: 8500,
      balance: 3775,
      openedAt: '2026-08-31T15:00:00Z'
    },
    {
      id: 'fol-3',
      folioNumber: 'FOL-2026-00883',
      stayId: 'sty-3',
      guestId: 'gst-3',
      guestName: 'Tanvir Ahmed & Farzana',
      roomNumber: '301',
      status: 'Open',
      items: [
        {
          id: 'item-301',
          folioId: 'fol-3',
          type: 'Room Charge',
          description: 'Honeymoon Bliss Romance Package (Room 301)',
          quantity: 1,
          unitPrice: 42000,
          discount: 2000,
          tax: 6000,
          total: 46000,
          postedBy: 'Front Desk',
          createdAt: '2026-08-31T16:20:00Z'
        }
      ],
      subtotal: 40000,
      discountTotal: 2000,
      serviceChargeTotal: 4000,
      taxTotal: 6000,
      grandTotal: 50000,
      paidTotal: 20000,
      balance: 30000,
      openedAt: '2026-08-31T16:20:00Z'
    },
    {
      id: 'fol-4',
      folioNumber: 'FOL-2026-00884',
      stayId: 'sty-4',
      guestId: 'gst-4',
      guestName: 'Syed Ashraful Alam',
      roomNumber: '401',
      status: 'Open',
      items: [
        {
          id: 'item-401',
          folioId: 'fol-4',
          type: 'Room Charge',
          description: 'Night 1 Room Charge - Presidential Suite (Room 401)',
          quantity: 1,
          unitPrice: 28000,
          discount: 0,
          tax: 4200,
          total: 32200,
          postedBy: 'Front Desk',
          createdAt: '2026-08-31T13:00:00Z'
        },
        {
          id: 'item-402',
          folioId: 'fol-4',
          type: 'Restaurant',
          description: 'Executive Lounge - Grilled Jumbo King Prawns (2x), Steak',
          quantity: 1,
          unitPrice: 4150,
          discount: 0,
          tax: 622,
          total: 4772,
          postedBy: 'Restaurant POS',
          createdAt: '2026-08-31T20:30:00Z'
        }
      ],
      subtotal: 32150,
      discountTotal: 0,
      serviceChargeTotal: 3215,
      taxTotal: 4822,
      grandTotal: 40187,
      paidTotal: 30000,
      balance: 10187,
      openedAt: '2026-08-31T13:00:00Z'
    },
    {
      id: 'fol-5',
      folioNumber: 'FOL-2026-00885',
      stayId: 'sty-5',
      guestId: 'gst-5',
      guestName: 'Michael Vance',
      roomNumber: '304',
      status: 'Open',
      items: [
        {
          id: 'item-501',
          folioId: 'fol-5',
          type: 'Room Charge',
          description: 'Night 1 Room Charge - Royal Suite (Room 304)',
          quantity: 1,
          unitPrice: 18500,
          discount: 0,
          tax: 2775,
          total: 21275,
          postedBy: 'Front Desk',
          createdAt: '2026-08-31T11:00:00Z'
        }
      ],
      subtotal: 18500,
      discountTotal: 0,
      serviceChargeTotal: 1850,
      taxTotal: 2775,
      grandTotal: 23125,
      paidTotal: 18500,
      balance: 4625,
      openedAt: '2026-08-31T11:00:00Z'
    }
  ];

  const payments: Payment[] = [
    {
      id: 'pay-1',
      transactionNumber: 'TXN-2026-0901',
      folioId: 'fol-1',
      reservationId: 'res-1',
      amount: 15000,
      method: 'Credit Card',
      reference: 'VISA-4242 / City Bank Terminal',
      status: 'Completed',
      notes: 'Check-in advance payment',
      createdBy: 'Front Desk - Tariqul',
      createdAt: '2026-08-31T14:30:00Z'
    },
    {
      id: 'pay-2',
      transactionNumber: 'TXN-2026-0902',
      folioId: 'fol-2',
      reservationId: 'res-2',
      amount: 8500,
      method: 'bKash',
      reference: 'BKASH-9A8B7C6D',
      status: 'Completed',
      notes: 'Online deposit confirmed',
      createdBy: 'Online Sync',
      createdAt: '2026-08-28T12:05:00Z'
    },
    {
      id: 'pay-3',
      transactionNumber: 'TXN-2026-0903',
      folioId: 'fol-3',
      reservationId: 'res-3',
      amount: 20000,
      method: 'Bank Transfer',
      reference: 'EBL-TRF-889922',
      status: 'Completed',
      notes: 'Honeymoon advance deposit',
      createdBy: 'Accounts - Arif',
      createdAt: '2026-08-30T16:15:00Z'
    },
    {
      id: 'pay-4',
      transactionNumber: 'TXN-2026-0904',
      folioId: 'fol-4',
      reservationId: 'res-4',
      amount: 30000,
      method: 'Cash',
      reference: 'CASH-RECEIPT-404',
      status: 'Completed',
      notes: 'Advance at front desk',
      createdBy: 'Super Admin',
      createdAt: '2026-08-31T13:00:00Z'
    },
    {
      id: 'pay-5',
      transactionNumber: 'TXN-2026-0905',
      folioId: 'fol-5',
      reservationId: 'res-5',
      amount: 18500,
      method: 'Credit Card',
      reference: 'MASTERCARD-5521',
      status: 'Completed',
      notes: 'Direct Booking.com card authorization',
      createdBy: 'Front Desk',
      createdAt: '2026-08-31T11:00:00Z'
    }
  ];

  const housekeepingTasks: HousekeepingTask[] = [
    {
      id: 'hk-1',
      roomId: 'rm-104',
      roomNumber: '104',
      roomTypeName: 'Deluxe Room',
      assignedTo: 'Nasreen Akhter',
      taskType: 'Full Turnover',
      priority: 'High',
      status: 'Pending',
      checklist: {
        bedLinenChanged: false,
        bathroomSanitized: false,
        towelsReplaced: false,
        amenitiesRestocked: false,
        floorCleaned: false,
        minibarChecked: false
      },
      notes: 'Checkout room. Upcoming arrival expected at 5:00 PM.',
      createdAt: '2026-08-31T12:00:00Z'
    },
    {
      id: 'hk-2',
      roomId: 'rm-204',
      roomNumber: '204',
      roomTypeName: 'Family Deluxe',
      assignedTo: 'Salma Begum',
      taskType: 'Daily Service',
      priority: 'Medium',
      status: 'In Progress',
      checklist: {
        bedLinenChanged: true,
        bathroomSanitized: true,
        towelsReplaced: false,
        amenitiesRestocked: false,
        floorCleaned: false,
        minibarChecked: false
      },
      notes: 'Guest requested cleaning between 2 PM - 3 PM.',
      createdAt: '2026-08-31T13:30:00Z'
    },
    {
      id: 'hk-3',
      roomId: 'rm-306',
      roomNumber: '306',
      roomTypeName: 'Royal Suite',
      assignedTo: 'Nasreen Akhter',
      taskType: 'VIP Rush',
      priority: 'Urgent',
      status: 'Pending',
      checklist: {
        bedLinenChanged: false,
        bathroomSanitized: false,
        towelsReplaced: false,
        amenitiesRestocked: false,
        floorCleaned: false,
        minibarChecked: false
      },
      notes: 'VIP Guest arriving tomorrow morning. Needs full flower styling.',
      createdAt: '2026-08-31T14:00:00Z'
    }
  ];

  const maintenanceTickets: MaintenanceTicket[] = [
    {
      id: 'mt-1',
      ticketNumber: 'MNT-2026-0044',
      roomId: 'rm-107',
      roomNumber: '107',
      title: 'AC Inverter Compressor Noise & Low Cooling',
      description: 'Gree 2.0 Ton split AC outdoor unit making rattle noise. Needs technician coil inspection and gas recharge.',
      priority: 'Critical',
      assignedTo: 'Md. Rafiq (Senior AC Tech)',
      status: 'In Progress',
      cost: 4500,
      marksOutOfOrder: true,
      notes: 'Room taken Out-Of-Order until tomorrow 12:00 PM.',
      createdAt: '2026-08-30T09:00:00Z'
    },
    {
      id: 'mt-2',
      ticketNumber: 'MNT-2026-0045',
      roomId: 'rm-206',
      roomNumber: '206',
      title: 'Balcony Door Latch Adjustment',
      description: 'Sliding glass door latch sticky and hard to close smoothly.',
      priority: 'Low',
      assignedTo: 'Al-Amin (Carpenter)',
      status: 'Open',
      cost: 500,
      marksOutOfOrder: false,
      notes: 'Can be done during standard housekeeping window.',
      createdAt: '2026-08-31T10:00:00Z'
    }
  ];

  const eventClients: EventClient[] = [
    {
      id: 'ec-1',
      name: 'Grameenphone Ltd. (HR & Admin)',
      company: 'Grameenphone Ltd.',
      phone: '+880 1700-112233',
      email: 'events@grameenphone.com',
      address: 'GPHouse, Bashundhara, Dhaka',
      notes: 'Annual Corporate Leadership Workshop.',
      createdAt: '2026-08-10T10:00:00Z'
    },
    {
      id: 'ec-2',
      name: 'Al-Haj Kabir Uddin & Family',
      company: 'Private Family',
      phone: '+880 1819-223344',
      email: 'kabir.uddin@gmail.com',
      address: 'Gulshan 1, Dhaka',
      notes: 'Daughter Wedding Reception gala.',
      createdAt: '2026-07-15T14:00:00Z'
    }
  ];

  const eventBookings: EventBooking[] = [
    {
      id: 'evt-1',
      eventNumber: 'EVT-2026-0089',
      clientId: 'ec-1',
      clientName: 'Grameenphone Ltd. (HR & Admin)',
      clientCompany: 'Grameenphone Ltd.',
      clientPhone: '+880 1700-112233',
      hallId: 'hl-1',
      hallName: 'Grand Padma Ballroom',
      eventName: 'Annual Leadership Strategy Summit 2026',
      eventType: 'Corporate',
      eventDate: today,
      startTime: '09:00',
      endTime: '18:00',
      guestCount: 350,
      packageId: 'pkg-3',
      packageName: 'Corporate Executive Seminar (Full Day)',
      status: 'Ongoing',
      items: [
        {
          id: 'ei-1',
          itemType: 'Hall Rent',
          description: 'Grand Padma Ballroom Full Day Rental',
          quantity: 1,
          unitPrice: 180000,
          total: 180000
        },
        {
          id: 'ei-2',
          itemType: 'Food Package',
          description: 'Executive Buffet Lunch & Hi-Tea for 350 Persons',
          quantity: 350,
          unitPrice: 1450,
          total: 507500
        },
        {
          id: 'ei-3',
          itemType: 'Sound & AV',
          description: 'Dual HD Laser Projectors & Line Array PA',
          quantity: 1,
          unitPrice: 25000,
          total: 25000
        }
      ],
      subtotal: 712500,
      discount: 30000,
      serviceCharge: 68250,
      tax: 102375,
      total: 853125,
      deposit: 500000,
      balance: 353125,
      notes: 'Lunch served at 1:15 PM in dedicated buffet zone. VIP seating arranged for 20 directors.',
      createdAt: '2026-08-10T10:00:00Z'
    },
    {
      id: 'evt-2',
      eventNumber: 'EVT-2026-0090',
      clientId: 'ec-2',
      clientName: 'Al-Haj Kabir Uddin & Family',
      clientCompany: 'Kabir Group',
      clientPhone: '+880 1819-223344',
      hallId: 'hl-2',
      hallName: 'Meghna Convention Hall',
      eventName: 'Kabir & Farzana Wedding Reception Gala',
      eventType: 'Wedding',
      eventDate: dayAfter,
      startTime: '18:00',
      endTime: '23:30',
      guestCount: 400,
      packageId: 'pkg-4',
      packageName: 'Royal Wedding Celebration Gala',
      status: 'Confirmed',
      items: [
        {
          id: 'ei-4',
          itemType: 'Hall Rent',
          description: 'Meghna Convention Hall Evening Booking',
          quantity: 1,
          unitPrice: 110000,
          total: 110000
        },
        {
          id: 'ei-5',
          itemType: 'Food Package',
          description: 'Royal Wedding Kacchi & Ilish Feast (400 pax)',
          quantity: 400,
          unitPrice: 1200,
          total: 480000
        },
        {
          id: 'ei-6',
          itemType: 'Decoration',
          description: 'Fresh Floral Stage & Red Carpet Pathway Decor',
          quantity: 1,
          unitPrice: 65000,
          total: 65000
        }
      ],
      subtotal: 655000,
      discount: 25000,
      serviceCharge: 63000,
      tax: 94500,
      total: 787500,
      deposit: 400000,
      balance: 387500,
      notes: 'Floral decor team to start setup from 11:00 AM.',
      createdAt: '2026-07-15T14:00:00Z'
    }
  ];

  const alerts: OperationalAlert[] = [
    {
      id: 'alt-1',
      type: 'urgent',
      title: 'AC Maintenance Out-of-Order (Room 107)',
      message: 'Room 107 compressor replacement in progress. Room is blocked from availability.',
      timestamp: 'Today, 09:00 AM',
      read: false,
      actionLabel: 'View Ticket',
      actionRoute: 'maintenance'
    },
    {
      id: 'alt-2',
      type: 'vip',
      title: 'VIP Arrival: Engr. Mohammad Rahman (Room 201)',
      message: 'VIP guest in-house. Ensure fruit basket & butler service check.',
      timestamp: 'Today, 02:30 PM',
      read: false,
      actionLabel: 'View Folio',
      actionRoute: 'billing'
    },
    {
      id: 'alt-3',
      type: 'info',
      title: 'Convention Hall Ongoing: Grameenphone Summit',
      message: '350 attendees currently in Grand Padma Ballroom. Afternoon Hi-Tea scheduled at 4:30 PM.',
      timestamp: 'Today, 09:30 AM',
      read: false,
      actionLabel: 'Event Details',
      actionRoute: 'convention'
    },
    {
      id: 'alt-4',
      type: 'warning',
      title: 'Dirty Priority Turnover (Room 104)',
      message: 'Room 104 dirty after checkout. Next arrival expected at 5:00 PM.',
      timestamp: 'Today, 12:15 PM',
      read: false,
      actionLabel: 'HK Board',
      actionRoute: 'housekeeping'
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud-1',
      userId: 'u-1',
      userName: 'Md. Tariqul Islam',
      userRole: 'Super Admin',
      action: 'Check-In Completed',
      entityType: 'Stay',
      entityId: 'STY-2026-00311',
      oldValue: 'Reservation Confirmed',
      newValue: 'Stay Active (Room 201 Assigned, Folio FOL-2026-00881 Opened)',
      ipAddress: '192.168.1.10',
      createdAt: '2026-08-31T14:30:00Z'
    },
    {
      id: 'aud-2',
      userId: 'u-3',
      userName: 'Kazi Mahfuzur Rahman',
      userRole: 'Front Desk',
      action: 'Advance Payment Received',
      entityType: 'Payment',
      entityId: 'TXN-2026-0901',
      newValue: 'Amount ৳15,000 via VISA-4242 to Folio FOL-2026-00881',
      ipAddress: '192.168.1.14',
      createdAt: '2026-08-31T14:32:00Z'
    },
    {
      id: 'aud-3',
      userId: 'u-5',
      userName: 'Syed Anisul Haque',
      userRole: 'Event Manager',
      action: 'Event Booking Status Changed',
      entityType: 'Event',
      entityId: 'EVT-2026-0089',
      oldValue: 'Confirmed',
      newValue: 'Ongoing (Grand Padma Ballroom)',
      ipAddress: '192.168.1.22',
      createdAt: '2026-08-31T09:00:00Z'
    }
  ];

  const invoices: Invoice[] = [
    {
      id: 'inv-1',
      invoiceNumber: 'INV-2026-00881',
      folioId: 'fol-1',
      guestOrClientName: 'Engr. Mohammad Rahman',
      phone: '+880 1711-234567',
      address: 'House 42, Road 11, Banani, Dhaka',
      stayOrEventDetails: 'Stay STY-2026-00311 (31 Aug – 03 Sep 2026)',
      roomOrHall: 'Room 201 (Family Deluxe)',
      dates: '31 Aug 2026 – 03 Sep 2026',
      items: [
        { description: 'Night 1 Room Charge - Family Deluxe', quantity: 1, unitPrice: 12500, total: 12500 },
        { description: 'Padma Dine - Dinner: Mutton Kacchi Biryani & Borhani', quantity: 1, unitPrice: 1600, total: 1600 },
        { description: 'Hotel Service Charge (10%)', quantity: 1, unitPrice: 1410, total: 1410 }
      ],
      subtotal: 15510,
      discount: 0,
      serviceCharge: 1410,
      tax: 2115,
      grandTotal: 17625,
      paidAmount: 15000,
      balance: 2625,
      status: 'Partially Paid',
      issuedAt: '2026-08-31T20:30:00Z',
      issuedBy: 'Front Desk - Tariqul'
    }
  ];

  const rolePermissions: RolePermission[] = [
    { id: 'rp-1', roleName: 'Super Admin', permissions: ['*'] },
    { id: 'rp-2', roleName: 'General Manager', permissions: ['*'] },
    { id: 'rp-3', roleName: 'Front Office Manager', permissions: ['can_modify_reservations', 'can_void_bills', 'can_run_night_audit', 'can_checkin_checkout', 'can_post_charges', 'can_manage_rooms'] },
    { id: 'rp-4', roleName: 'Front Desk', permissions: ['can_modify_reservations', 'can_checkin_checkout', 'can_post_charges'] },
    { id: 'rp-5', roleName: 'Accounts', permissions: ['can_void_bills', 'can_void_payments', 'can_run_night_audit', 'can_post_charges'] },
    { id: 'rp-6', roleName: 'Housekeeping', permissions: ['can_checkin_checkout'] },
    { id: 'rp-7', roleName: 'Maintenance', permissions: ['can_manage_rooms'] },
    { id: 'rp-8', roleName: 'Event Manager', permissions: ['can_manage_halls', 'can_modify_reservations', 'can_post_charges'] },
    { id: 'rp-9', roleName: 'Restaurant Staff', permissions: ['can_post_charges'] },
    { id: 'rp-10', roleName: 'Management', permissions: ['can_run_night_audit'] }
  ];

  const seedNightAuditRecords: NightAuditRecord[] = [
    {
      id: 'na-20260830',
      auditNumber: 'AUD-20260830-01',
      businessDate: '2026-08-30',
      nextBusinessDate: '2026-08-31',
      closedAt: '2026-08-31T05:00:00Z',
      closedBy: 'System Auto-Scheduler (05:00 AM)',
      isAutomatic: true,
      totalRoomsOccupied: 4,
      occupancyPercent: 80,
      roomRevenuePosted: 47500,
      fbRevenue: 18450,
      banquetRevenue: 150000,
      otherRevenue: 3200,
      totalRevenue: 219150,
      totalPaymentsCollected: 165000,
      ledgerBalance: 54150,
      inHouseStaysCount: 4,
      departuresPending: 0,
      notes: 'Auto night audit executed seamlessly at 05:00 AM. 4 in-house folios posted, 2 settled folios closed, 3 invoices generated, and system audit alerts dispatched.',
      status: 'Completed',
      closedFolios: [
        {
          id: 'fol-seed-closed-1',
          folioNumber: 'FOL-2026-00874',
          stayId: 'sty-old-1',
          guestName: 'Dr. Kamal Hossain',
          roomNumber: '104',
          roomType: 'Deluxe Couple',
          grandTotal: 18500,
          paidTotal: 18500,
          balance: 0,
          status: 'Settled',
          closedAt: '2026-08-31T05:00:00Z',
          settlementMethod: 'Credit Card (City Bank AMEX)',
          remarks: 'Full settlement verified during 05:00 AM audit cycle'
        },
        {
          id: 'fol-seed-closed-2',
          folioNumber: 'FOL-2026-00875',
          stayId: 'sty-old-2',
          guestName: 'Mrs. Sabrina Chowdhury',
          roomNumber: '102',
          roomType: 'Executive Suite',
          grandTotal: 34200,
          paidTotal: 34200,
          balance: 0,
          status: 'Settled',
          closedAt: '2026-08-31T05:00:00Z',
          settlementMethod: 'MFS (bKash Corporate)',
          remarks: 'Pre-authorization converted and folio closed during night run'
        }
      ],
      generatedInvoices: [
        {
          id: 'inv-aud-1',
          invoiceNumber: 'INV-2026-00874',
          folioNumber: 'FOL-2026-00874',
          guestOrClientName: 'Dr. Kamal Hossain',
          roomOrHall: 'Room 104 (Deluxe Couple)',
          subtotal: 15000,
          serviceCharge: 1500,
          tax: 2000,
          grandTotal: 18500,
          status: 'Paid',
          issuedAt: '2026-08-31T05:00:00Z',
          issuedBy: 'Automated 05:00 AM Audit Engine'
        },
        {
          id: 'inv-aud-2',
          invoiceNumber: 'INV-2026-00875',
          folioNumber: 'FOL-2026-00875',
          guestOrClientName: 'Mrs. Sabrina Chowdhury',
          roomOrHall: 'Room 102 (Executive Suite)',
          subtotal: 28000,
          serviceCharge: 2800,
          tax: 3400,
          grandTotal: 34200,
          status: 'Paid',
          issuedAt: '2026-08-31T05:00:00Z',
          issuedBy: 'Automated 05:00 AM Audit Engine'
        },
        {
          id: 'inv-aud-3',
          invoiceNumber: 'INV-2026-00876',
          folioNumber: 'FOL-2026-00881',
          guestOrClientName: 'Engr. Mohammad Rahman',
          roomOrHall: 'Room 201 (Family Deluxe)',
          subtotal: 12500,
          serviceCharge: 1250,
          tax: 1875,
          grandTotal: 15625,
          status: 'Partially Paid',
          issuedAt: '2026-08-31T05:00:00Z',
          issuedBy: 'Automated 05:00 AM Audit Engine'
        }
      ],
      triggeredAlerts: [
        {
          id: 'alt-na-1',
          type: 'success',
          title: 'Automated 05:00 AM Day-Close Completed',
          message: 'Business date successfully rolled from 2026-08-30 to 2026-08-31. Total reconciled revenue: ৳219,150.',
          category: 'Financial / Ledger',
          timestamp: '05:00 AM'
        },
        {
          id: 'alt-na-2',
          type: 'warning',
          title: 'High Outstanding Folio Balance (Room 201)',
          message: 'Engr. Mohammad Rahman (Room 201) balance is ৳2,625 with total charges ৳17,625. Credit limit warning threshold monitored.',
          category: 'Financial / Ledger',
          timestamp: '05:00 AM',
          actionRoute: 'billing',
          actionLabel: 'View Folio'
        },
        {
          id: 'alt-na-3',
          type: 'info',
          title: 'Stop Post Notice Monitored (Room 301)',
          message: 'Room 301 has active Stop Post restriction (Direct Pay Only). Outlet POS charge attempts blocked during overnight audit.',
          category: 'Security / Stop-Post',
          timestamp: '05:00 AM',
          actionRoute: 'frontdesk',
          actionLabel: 'Front Desk'
        },
        {
          id: 'alt-na-4',
          type: 'urgent',
          title: 'Housekeeping Morning Turnover Queue',
          message: '4 occupied rooms queued for regular morning service; 2 checkout rooms (104, 102) flagged as Dirty Priority for 10:00 AM HK Shift.',
          category: 'Housekeeping',
          timestamp: '05:00 AM',
          actionRoute: 'housekeeping',
          actionLabel: 'HK Board'
        }
      ],
      postedCharges: [
        {
          stayId: 'sty-1',
          roomNumber: '201',
          guestName: 'Engr. Mohammad Rahman',
          roomType: 'Family Deluxe',
          rate: 12500,
          tax: 1875,
          serviceCharge: 1250,
          total: 15625,
          postedAt: '2026-08-31T05:00:00Z'
        },
        {
          stayId: 'sty-2',
          roomNumber: '301',
          guestName: 'Barrister Anisul Islam',
          roomType: 'Presidential Suite',
          rate: 22000,
          tax: 3300,
          serviceCharge: 2200,
          total: 27500,
          postedAt: '2026-08-31T05:00:00Z'
        },
        {
          stayId: 'sty-3',
          roomNumber: '101',
          guestName: 'Prof. Dr. Nusrat Jahan',
          roomType: 'Deluxe Single',
          rate: 5500,
          tax: 825,
          serviceCharge: 550,
          total: 6875,
          postedAt: '2026-08-31T05:00:00Z'
        },
        {
          stayId: 'sty-4',
          roomNumber: '202',
          guestName: 'Md. Farhan Tanvir',
          roomType: 'Executive Suite',
          rate: 7500,
          tax: 1125,
          serviceCharge: 750,
          total: 9375,
          postedAt: '2026-08-31T05:00:00Z'
        }
      ]
    }
  ];

  const seedRestaurantOrders: RestaurantOrder[] = [
    {
      id: 'ord-1',
      orderNumber: 'POS-2026-0081',
      stayId: 'sty-1',
      roomNumber: '201',
      guestName: 'Engr. Mohammad Rahman',
      orderType: 'room-dining',
      inRoomDiningDetails: {
        deliveryTime: '20:15',
        trayCharge: 100,
        specialNotes: 'Extra spoons & napkins please'
      },
      status: 'Posted to Folio',
      items: [
        { menuItemId: 'mi-1', name: 'Special Mutton Kacchi Biryani', quantity: 2, unitPrice: 650, total: 1300 },
        { menuItemId: 'mi-10', name: 'Fresh Mint Lemonade', quantity: 2, unitPrice: 180, total: 360 }
      ],
      subtotal: 1760,
      serviceCharge: 176,
      tax: 264,
      total: 2200,
      folioId: 'fol-1',
      createdBy: 'Room Service Staff',
      createdAt: '2026-08-31T19:45:00Z'
    },
    {
      id: 'ord-2',
      orderNumber: 'BAR-2026-0042',
      stayId: 'sty-2',
      roomNumber: '301',
      guestName: 'Barrister Anisul Islam',
      orderType: 'bar-lounge',
      status: 'Posted to Folio',
      items: [
        { menuItemId: 'mi-11', name: 'Royal Saffron Borhani (Glass)', quantity: 2, unitPrice: 150, total: 300 },
        { menuItemId: 'mi-7', name: 'Chicken Tikka Butter Masala & Butter Naan', quantity: 1, unitPrice: 580, total: 580 }
      ],
      subtotal: 880,
      serviceCharge: 88,
      tax: 132,
      total: 1100,
      folioId: 'fol-2',
      createdBy: 'Bar Captain',
      createdAt: '2026-08-31T20:10:00Z'
    }
  ];

  const state: PmsDatabaseState = {
    users: SEED_USERS,
    rolePermissions,
    guests: SEED_GUESTS,
    guestDocuments: [],
    roomTypes: SEED_ROOM_TYPES,
    rooms: SEED_ROOMS,
    reservations,
    stays,
    folios,
    payments,
    refunds: [],
    invoices,
    housekeepingTasks,
    maintenanceTickets,
    halls: SEED_HALLS,
    eventClients,
    eventBookings,
    packages: SEED_PACKAGES,
    menuCategories: SEED_MENU_CATEGORIES,
    menuItems: SEED_MENU_ITEMS,
    restaurantOrders: seedRestaurantOrders,
    auditLogs,
    alerts,
    nightAuditRecords: seedNightAuditRecords,
    settings: DEFAULT_SETTINGS,
    currentUser: SEED_USERS[0]
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function saveDatabase(state: PmsDatabaseState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
