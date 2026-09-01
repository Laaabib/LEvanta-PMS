import {
  User, Guest, GuestDocument, RoomType, Room, Reservation, Stay, Folio, FolioItem,
  Payment, Refund, Invoice, HousekeepingTask, MaintenanceTicket, Hall, EventClient,
  EventBooking, Package, MenuCategory, MenuItem, RestaurantOrder, AuditLog,
  OperationalAlert, SystemSetting, UserRoleName, RolePermission, NightAuditRecord,
  GLAccount, JournalVoucher, CityLedgerAccount, DepartmentalSyncStatus, ActivityAmenityCharge,
  UnitOfMeasure, InventoryCategory, WarehouseStore, Supplier, InventoryItem,
  InventoryStockByWarehouse, ItemBatchRecord, StockLedgerEntry, PurchaseRequest,
  PurchaseOrder, GoodsReceiveNote, PurchaseReturn, StockTransfer, StoreIssueConsumption,
  WastageEntry, PhysicalStockCount, StockAdjustment, ServiceChargeRule, TaxRule,
  MenuItemEnhanced, Recipe, MenuModifierItem, MenuComboItem, MenuPriceHistory
} from '../types/pms';
import {
  SEED_UOMS, SEED_INVENTORY_CATEGORIES, SEED_WAREHOUSES, SEED_SUPPLIERS,
  SEED_INVENTORY_ITEMS, SEED_INVENTORY_STOCKS, SEED_BATCHES, SEED_STOCK_LEDGER,
  SEED_PURCHASE_REQUESTS, SEED_PURCHASE_ORDERS, SEED_GRNS, SEED_PURCHASE_RETURNS,
  SEED_STOCK_TRANSFERS, SEED_STORE_ISSUES, SEED_WASTAGES, SEED_PHYSICAL_COUNTS,
  SEED_ADJUSTMENTS, SEED_SERVICE_CHARGE_RULES, SEED_TAX_RULES,
  SEED_ENHANCED_MENU_ITEMS, SEED_RECIPES, SEED_MENU_MODIFIERS, SEED_MENU_COMBOS,
  SEED_PRICE_HISTORIES
} from './mockInventoryData';

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
  glAccounts: GLAccount[];
  journalVouchers: JournalVoucher[];
  cityLedgerAccounts: CityLedgerAccount[];
  departmentalSyncs: DepartmentalSyncStatus[];
  activityCharges: ActivityAmenityCharge[];
  // Inventory & Menu Management Collections
  uoms: UnitOfMeasure[];
  inventoryCategories: InventoryCategory[];
  warehouses: WarehouseStore[];
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
  inventoryStocks: InventoryStockByWarehouse[];
  itemBatches: ItemBatchRecord[];
  stockLedgers: StockLedgerEntry[];
  purchaseRequests: PurchaseRequest[];
  purchaseOrders: PurchaseOrder[];
  goodsReceiveNotes: GoodsReceiveNote[];
  purchaseReturns: PurchaseReturn[];
  stockTransfers: StockTransfer[];
  storeIssues: StoreIssueConsumption[];
  wastages: WastageEntry[];
  physicalStockCounts: PhysicalStockCount[];
  stockAdjustments: StockAdjustment[];
  serviceChargeRules: ServiceChargeRule[];
  taxRules: TaxRule[];
  enhancedMenuItems: MenuItemEnhanced[];
  recipes: Recipe[];
  menuModifiers: MenuModifierItem[];
  menuCombos: MenuComboItem[];
  menuPriceHistories: MenuPriceHistory[];
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

export const SEED_GL_ACCOUNTS: GLAccount[] = [
  // Assets (1000 - 1999)
  { code: '1010', name: 'Cash in Vault & Commercial Bank Accounts', type: 'Asset', category: 'Current Assets', description: 'Main operational bank balances (Sonali, DBBL, EBL corporate accounts)', balance: 4520000, isSystem: true },
  { code: '1020', name: 'Front Desk & Outlet Cashier Drawers', type: 'Asset', category: 'Current Assets', description: 'Physical cash float maintained at Front Office, F&B, and POS counters', balance: 85000, isSystem: true },
  { code: '1100', name: 'Guest Ledger (In-House Active Receivables)', type: 'Asset', category: 'Current Receivables', description: 'Aggregated outstanding balances on open guest folios for active stays', balance: 148250, isSystem: true },
  { code: '1150', name: 'City Ledger (Corporate Accounts Receivable)', type: 'Asset', category: 'Trade Receivables', description: 'Direct billing receivables from registered corporate clients and credit companies', balance: 385000, isSystem: true },
  { code: '1200', name: 'Convention & Banquet Event Receivables', type: 'Asset', category: 'Trade Receivables', description: 'Confirmed event booking receivables and convention hall contracts', balance: 185000, isSystem: true },

  // Liabilities (2000 - 2999)
  { code: '2010', name: 'Guest Advance & Reservation Security Deposits', type: 'Liability', category: 'Current Liabilities', description: 'Prepayments received for future room reservations and event bookings', balance: 265000, isSystem: true },
  { code: '2100', name: 'VAT / Government Tax Payable (15%)', type: 'Liability', category: 'Statutory Liabilities', description: 'Statutory value added tax collected on accommodation, F&B, and services', balance: 94350, isSystem: true },
  { code: '2110', name: 'Service Charge Payable (10% Staff Pool)', type: 'Liability', category: 'Operational Liabilities', description: 'Service charge pool collected for employee welfare and operational distribution', balance: 62900, isSystem: true },

  // Equity (3000 - 3999)
  { code: '3010', name: 'Owners Capital & Retained Earnings', type: 'Equity', category: 'Capital & Reserves', description: 'CCULB member cooperative equity and cumulative retained earnings', balance: 25000000, isSystem: true },

  // Revenue (4000 - 4999)
  { code: '4010', name: 'Room Accommodation Revenue', type: 'Revenue', category: 'Accommodation', description: 'Gross lodging revenue generated from all room categories and night audit postings', balance: 1450000, isSystem: true },
  { code: '4020', name: 'Food & Beverage Outlet Sales', type: 'Revenue', category: 'Outlets & Dining', description: 'Revenue from main restaurant, in-room dining, and buffet operations', balance: 420000, isSystem: true },
  { code: '4030', name: 'Bar & Lounge Revenue', type: 'Revenue', category: 'Outlets & Dining', description: 'Beverages, mocktails, and lounge snack sales', balance: 115000, isSystem: true },
  { code: '4040', name: 'Convention Halls & Banquet Venue Hire', type: 'Revenue', category: 'Events & Venues', description: 'Grand Ballroom, Executive Conference, and convention hall booking fees', balance: 780000, isSystem: true },
  { code: '4050', name: 'Resort Activities & Sports Facilities', type: 'Revenue', category: 'Resort Activities', description: 'Swimming pool passes, lawn tennis, boating, archery, and recreation tickets', balance: 95000, isSystem: true },
  { code: '4060', name: 'Spa & Wellness Center Revenue', type: 'Revenue', category: 'Recreation', description: 'Therapeutic massages, sauna, and wellness packages', balance: 65000, isSystem: true },
  { code: '4070', name: 'Laundry & Valet Guest Services', type: 'Revenue', category: 'Guest Services', description: 'Express dry cleaning, laundry, and pressing services', balance: 38000, isSystem: true },

  // Expenses (5000 - 5999)
  { code: '5010', name: 'Housekeeping Linen & Guest Room Supplies', type: 'Expense', category: 'Hotel Operations', description: 'Linen replenishment, toiletries, guest room amenities, and cleaning chemicals', balance: 74000, isSystem: false },
  { code: '5020', name: 'F&B Kitchen Raw Materials & Consumables', type: 'Expense', category: 'F&B Costs', description: 'Meat, fish, poultry, spices, and perishable kitchen inventory', balance: 185000, isSystem: false },
  { code: '5030', name: 'Engineering, Facility & Maintenance Repairs', type: 'Expense', category: 'Maintenance', description: 'HVAC repair, plumbing, electrical, and room upkeep costs', balance: 42000, isSystem: false },
  { code: '5040', name: 'Power, Generator Diesel & Utilities', type: 'Expense', category: 'Utilities', description: 'Electricity grid tariffs, generator fuel, and water utility charges', balance: 125000, isSystem: false }
];

export const SEED_CITY_LEDGER_ACCOUNTS: CityLedgerAccount[] = [
  {
    id: 'cla-1',
    accountNumber: 'CL-2026-001',
    companyName: 'Grameenphone Ltd.',
    contactPerson: 'Syed Ashfaqur Rahman (HR & Admin Manager)',
    phone: '+880 1711-500100',
    email: 'corporate.booking@grameenphone.com',
    creditLimit: 500000,
    currentBalance: 145000,
    paymentTerms: 'Net 30',
    status: 'Active',
    taxNumber: 'TIN-48291049281',
    address: 'GPHouse, Bashundhara R/A, Dhaka-1229',
    notes: 'Approved for direct folio transfer for C-level & Senior Director retreats.',
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'cla-2',
    accountNumber: 'CL-2026-002',
    companyName: 'Unilever Bangladesh Limited',
    contactPerson: 'Tanvir Hasan (Supply Chain Protocol Lead)',
    phone: '+880 1819-223344',
    email: 'admin.dhaka@unilever.com',
    creditLimit: 600000,
    currentBalance: 95000,
    paymentTerms: 'Net 30',
    status: 'Active',
    taxNumber: 'TIN-10928374612',
    address: 'ZN Tower, Gulshan-1, Dhaka-1212',
    notes: 'Standing corporate discount 10% on convention halls and room rack.',
    createdAt: '2026-02-01T00:00:00Z'
  },
  {
    id: 'cla-3',
    accountNumber: 'CL-2026-003',
    companyName: 'CCULB Corporate Credit Union Central',
    contactPerson: 'Joynal Abedin (Secretary General)',
    phone: '+880 1713-445566',
    email: 'admin@cculb.org.bd',
    creditLimit: 1000000,
    currentBalance: 85000,
    paymentTerms: 'Net 45',
    status: 'Active',
    taxNumber: 'TIN-99283471029',
    address: 'CCULB Bhaban, 17/1-C Tejkunipara, Tejgaon, Dhaka',
    notes: 'Parent cooperative union account. Annual AGM and quarterly retreats.',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cla-4',
    accountNumber: 'CL-2026-004',
    companyName: 'Beximco Pharmaceuticals Ltd.',
    contactPerson: 'Dr. Farhana Kabir (Medical Events Coordinator)',
    phone: '+880 1715-998877',
    email: 'events.pharma@beximco.net',
    creditLimit: 400000,
    currentBalance: 60000,
    paymentTerms: 'Net 30',
    status: 'Active',
    taxNumber: 'TIN-33445566778',
    address: '19 Dhanmondi R/A, Road 7, Dhaka-1205',
    notes: 'Physician symposium and weekend clinical round conferences.',
    createdAt: '2026-03-10T00:00:00Z'
  },
  {
    id: 'cla-5',
    accountNumber: 'CL-2026-005',
    companyName: 'BRAC Bank Corporate Division',
    contactPerson: 'Mahbubur Rahman (Senior VP, Operations)',
    phone: '+880 1714-332211',
    email: 'corporate.events@bracbank.com',
    creditLimit: 500000,
    currentBalance: 0,
    paymentTerms: 'Net 15',
    status: 'Active',
    taxNumber: 'TIN-77889900112',
    address: 'Anik Tower, 220/B Tejgaon I/A, Dhaka-1208',
    notes: 'All dues clear. Eligible for instant credit authorization.',
    createdAt: '2026-04-05T00:00:00Z'
  }
];

export const SEED_DEPARTMENTAL_SYNCS: DepartmentalSyncStatus[] = [
  {
    department: 'Front Desk Rooms',
    totalBills: 18,
    totalVolume: 182500,
    syncedCount: 18,
    unmappedCount: 0,
    lastSyncTime: '2026-08-31T05:00:00Z',
    syncStatus: 'In Sync',
    glAccountMapping: { debitAccount: '1100 (Guest Ledger)', creditAccount: '4010 (Room Revenue)' }
  },
  {
    department: 'Restaurant F&B',
    totalBills: 34,
    totalVolume: 48200,
    syncedCount: 34,
    unmappedCount: 0,
    lastSyncTime: '2026-08-31T20:15:00Z',
    syncStatus: 'In Sync',
    glAccountMapping: { debitAccount: '1100 (Guest Ledger) / 1020 (Cashier)', creditAccount: '4020 (F&B Sales)' }
  },
  {
    department: 'Bar & Lounge POS',
    totalBills: 12,
    totalVolume: 16800,
    syncedCount: 12,
    unmappedCount: 0,
    lastSyncTime: '2026-08-31T20:10:00Z',
    syncStatus: 'In Sync',
    glAccountMapping: { debitAccount: '1100 (Guest Ledger) / 1020 (Cashier)', creditAccount: '4030 (Bar Sales)' }
  },
  {
    department: 'Activities & Recreation',
    totalBills: 15,
    totalVolume: 22500,
    syncedCount: 15,
    unmappedCount: 0,
    lastSyncTime: '2026-08-31T18:30:00Z',
    syncStatus: 'In Sync',
    glAccountMapping: { debitAccount: '1100 (Guest Ledger) / 1020 (Cashier)', creditAccount: '4050 (Activities Revenue)' }
  },
  {
    department: 'Amenities & Spa',
    totalBills: 8,
    totalVolume: 18000,
    syncedCount: 8,
    unmappedCount: 0,
    lastSyncTime: '2026-08-31T17:00:00Z',
    syncStatus: 'In Sync',
    glAccountMapping: { debitAccount: '1100 (Guest Ledger) / 1020 (Cash)', creditAccount: '4060 (Spa Revenue)' }
  },
  {
    department: 'Banquet & Venues',
    totalBills: 4,
    totalVolume: 285000,
    syncedCount: 4,
    unmappedCount: 0,
    lastSyncTime: '2026-08-31T16:00:00Z',
    syncStatus: 'In Sync',
    glAccountMapping: { debitAccount: '1200 (Banquet Receivables) / 1010 (Bank)', creditAccount: '4040 (Banquet Venue Hire)' }
  },
  {
    department: 'Payment Cashiers',
    totalBills: 26,
    totalVolume: 345000,
    syncedCount: 26,
    unmappedCount: 0,
    lastSyncTime: '2026-08-31T20:30:00Z',
    syncStatus: 'In Sync',
    glAccountMapping: { debitAccount: '1010 (Bank) / 1020 (Drawer)', creditAccount: '1100 (Guest Ledger) / 2010 (Deposits)' }
  }
];

export const SEED_JOURNAL_VOUCHERS: JournalVoucher[] = [
  {
    id: 'jv-1',
    voucherNumber: 'JV-2026-0081',
    date: '2026-08-31',
    sourceModule: 'Front Desk',
    sourceReference: 'TXN-2026-0901',
    narration: 'Advance check-in deposit collected via VISA credit card terminal from Engr. Mohammad Rahman (Room 201)',
    entries: [
      { id: 'jve-1', accountCode: '1010', accountName: 'Cash in Vault & Commercial Bank Accounts', debit: 15000, credit: 0, memo: 'Card settlement batch #4401' },
      { id: 'jve-2', accountCode: '2010', accountName: 'Guest Advance & Reservation Security Deposits', debit: 0, credit: 15000, memo: 'Folio FOL-2026-00881 advance' }
    ],
    totalDebit: 15000,
    totalCredit: 15000,
    isBalanced: true,
    postedBy: 'Md. Tariqul Islam (Front Desk)',
    postedAt: '2026-08-31T14:30:00Z'
  },
  {
    id: 'jv-2',
    voucherNumber: 'JV-2026-0082',
    date: '2026-08-31',
    sourceModule: 'Night Audit',
    sourceReference: 'AUD-20260831-01',
    narration: '05:00 AM Automated Day-Close room accommodation revenue and statutory tax postings across 4 active occupied rooms',
    entries: [
      { id: 'jve-3', accountCode: '1100', accountName: 'Guest Ledger (In-House Active Receivables)', debit: 82500, credit: 0, memo: 'Daily room ledger debit' },
      { id: 'jve-4', accountCode: '4010', accountName: 'Room Accommodation Revenue', debit: 0, credit: 66000, memo: 'Base room charges' },
      { id: 'jve-5', accountCode: '2100', accountName: 'VAT / Government Tax Payable (15%)', debit: 0, credit: 9900, memo: 'Govt VAT on lodging' },
      { id: 'jve-6', accountCode: '2110', accountName: 'Service Charge Payable (10% Staff Pool)', debit: 0, credit: 6600, memo: '10% service charge' }
    ],
    totalDebit: 82500,
    totalCredit: 82500,
    isBalanced: true,
    postedBy: 'Automated 05:00 AM Audit Engine',
    postedAt: '2026-08-31T05:00:00Z'
  },
  {
    id: 'jv-3',
    voucherNumber: 'JV-2026-0083',
    date: '2026-08-31',
    sourceModule: 'Restaurant POS',
    sourceReference: 'POS-2026-0081',
    narration: 'Room service dining order posted to in-house Guest Folio FOL-2026-00881 (Room 201)',
    entries: [
      { id: 'jve-7', accountCode: '1100', accountName: 'Guest Ledger (In-House Active Receivables)', debit: 2200, credit: 0, memo: 'Room service bill 201' },
      { id: 'jve-8', accountCode: '4020', accountName: 'Food & Beverage Outlet Sales', debit: 0, credit: 1760, memo: 'Mutton Kacchi & Lemonade' },
      { id: 'jve-9', accountCode: '2100', accountName: 'VAT / Government Tax Payable (15%)', debit: 0, credit: 264, memo: '15% F&B VAT' },
      { id: 'jve-10', accountCode: '2110', accountName: 'Service Charge Payable (10% Staff Pool)', debit: 0, credit: 176, memo: '10% F&B service charge' }
    ],
    totalDebit: 2200,
    totalCredit: 2200,
    isBalanced: true,
    postedBy: 'Room Service POS Cashier',
    postedAt: '2026-08-31T19:45:00Z'
  },
  {
    id: 'jv-4',
    voucherNumber: 'JV-2026-0084',
    date: '2026-08-31',
    sourceModule: 'Banquet & Events',
    sourceReference: 'EVT-2026-0021',
    narration: 'Advance booking confirmation deposit for Grameenphone Leadership Summit at Grand Padma Ballroom',
    entries: [
      { id: 'jve-11', accountCode: '1010', accountName: 'Cash in Vault & Commercial Bank Accounts', debit: 100000, credit: 0, memo: 'Direct bank transfer EBL' },
      { id: 'jve-12', accountCode: '1200', accountName: 'Convention & Banquet Event Receivables', debit: 0, credit: 100000, memo: 'Advance deposit credit' }
    ],
    totalDebit: 100000,
    totalCredit: 100000,
    isBalanced: true,
    postedBy: 'Syed Anisul Haque (Event Manager)',
    postedAt: '2026-08-31T16:00:00Z'
  },
  {
    id: 'jv-5',
    voucherNumber: 'JV-2026-0085',
    date: '2026-08-31',
    sourceModule: 'Activities',
    sourceReference: 'ACT-2026-0012',
    narration: 'Swimming pool and lawn tennis day-pass tickets sold via Front Desk direct payment',
    entries: [
      { id: 'jve-13', accountCode: '1020', accountName: 'Front Desk & Outlet Cashier Drawers', debit: 3500, credit: 0, memo: 'Cash collection' },
      { id: 'jve-14', accountCode: '4050', accountName: 'Resort Activities & Sports Facilities', debit: 0, credit: 3043, memo: 'Pool & Tennis tickets' },
      { id: 'jve-15', accountCode: '2100', accountName: 'VAT / Government Tax Payable (15%)', debit: 0, credit: 457, memo: 'Activity 15% VAT' }
    ],
    totalDebit: 3500,
    totalCredit: 3500,
    isBalanced: true,
    postedBy: 'Front Desk Cashier',
    postedAt: '2026-08-31T18:15:00Z'
  }
];

export const SEED_ACTIVITY_CHARGES: ActivityAmenityCharge[] = [
  {
    id: 'act-1',
    chargeNumber: 'ACT-2026-0001',
    category: 'Activity',
    serviceType: 'Swimming Pool Pass',
    guestOrCustomerName: 'Engr. Mohammad Rahman',
    roomNumber: '201',
    stayId: 'sty-1',
    folioId: 'fol-1',
    quantity: 2,
    unitPrice: 500,
    subtotal: 1000,
    tax: 150,
    grandTotal: 1150,
    paymentType: 'Billed to Room Folio',
    settlementStatus: 'Posted to Folio',
    notes: 'Adult swimming pool wristband passes issued',
    createdAt: '2026-08-31T15:30:00Z',
    createdBy: 'Pool Attendant'
  },
  {
    id: 'act-2',
    chargeNumber: 'ACT-2026-0002',
    category: 'Activity',
    serviceType: 'Lawn Tennis',
    guestOrCustomerName: 'Dr. Nusrat Jahan',
    roomNumber: '102',
    stayId: 'sty-2',
    folioId: 'fol-2',
    quantity: 1,
    unitPrice: 1200,
    subtotal: 1200,
    tax: 180,
    grandTotal: 1380,
    paymentType: 'Billed to Room Folio',
    settlementStatus: 'Posted to Folio',
    notes: '1 Hour floodlit lawn tennis court rental + rackets',
    createdAt: '2026-08-31T17:00:00Z',
    createdBy: 'Sports Coordinator'
  },
  {
    id: 'act-3',
    chargeNumber: 'ACT-2026-0003',
    category: 'Activity',
    serviceType: 'Boating & Water Sports',
    guestOrCustomerName: 'Mr. Tareq Al-Hasan (Day Visitor)',
    quantity: 2,
    unitPrice: 750,
    subtotal: 1500,
    tax: 225,
    grandTotal: 1725,
    paymentType: 'Cash Direct',
    settlementStatus: 'Settled Direct',
    notes: 'Paddle boat 45-minute river lake cruise',
    createdAt: '2026-08-31T16:15:00Z',
    createdBy: 'Boating Deck Staff'
  },
  {
    id: 'act-4',
    chargeNumber: 'ACT-2026-0004',
    category: 'Activity',
    serviceType: 'Archery Field',
    guestOrCustomerName: 'Sabbir Ahmed (Club Member)',
    quantity: 1,
    unitPrice: 800,
    subtotal: 800,
    tax: 120,
    grandTotal: 920,
    paymentType: 'bKash MFS',
    settlementStatus: 'Settled Direct',
    notes: '20-arrow archery target practice with instructor',
    createdAt: '2026-08-31T16:45:00Z',
    createdBy: 'Archery Range Master'
  },
  {
    id: 'act-5',
    chargeNumber: 'ACT-2026-0005',
    category: 'Amenity',
    serviceType: 'Spa & Massage',
    guestOrCustomerName: 'Barrister Anisul Islam',
    roomNumber: '301',
    stayId: 'sty-3',
    folioId: 'fol-3',
    quantity: 1,
    unitPrice: 3500,
    subtotal: 3500,
    tax: 525,
    grandTotal: 4025,
    paymentType: 'Billed to Room Folio',
    settlementStatus: 'Posted to Folio',
    notes: '60-minute Swedish aromatherapy relaxing body massage',
    createdAt: '2026-08-31T18:00:00Z',
    createdBy: 'Spa Receptionist'
  },
  {
    id: 'act-6',
    chargeNumber: 'ACT-2026-0006',
    category: 'Amenity',
    serviceType: 'Laundry & Dry Cleaning',
    guestOrCustomerName: 'Engr. Mohammad Rahman',
    roomNumber: '201',
    stayId: 'sty-1',
    folioId: 'fol-1',
    quantity: 4,
    unitPrice: 150,
    subtotal: 600,
    tax: 90,
    grandTotal: 690,
    paymentType: 'Billed to Room Folio',
    settlementStatus: 'Posted to Folio',
    notes: '2 Formal Shirts + 2 Trousers express press and laundry',
    createdAt: '2026-08-31T11:30:00Z',
    createdBy: 'Laundry Supervisor'
  },
  {
    id: 'act-7',
    chargeNumber: 'ACT-2026-0007',
    category: 'Amenity',
    serviceType: 'Airport Shuttle',
    guestOrCustomerName: 'Michael Vance',
    roomNumber: '304',
    stayId: 'sty-5',
    folioId: 'fol-5',
    quantity: 1,
    unitPrice: 2500,
    subtotal: 2500,
    tax: 375,
    grandTotal: 2875,
    paymentType: 'Billed to Room Folio',
    settlementStatus: 'Posted to Folio',
    notes: 'Hazrat Shahjalal Int. Airport pickup in Toyota Noah AC Van',
    createdAt: '2026-08-31T09:00:00Z',
    createdBy: 'Concierge Transport'
  }
];

export function getInitialDatabase(): PmsDatabaseState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure newly added structures are populated if missing in saved storage
      if (!parsed.glAccounts || parsed.glAccounts.length === 0) parsed.glAccounts = SEED_GL_ACCOUNTS;
      if (!parsed.journalVouchers || parsed.journalVouchers.length === 0) parsed.journalVouchers = SEED_JOURNAL_VOUCHERS;
      if (!parsed.cityLedgerAccounts || parsed.cityLedgerAccounts.length === 0) parsed.cityLedgerAccounts = SEED_CITY_LEDGER_ACCOUNTS;
      if (!parsed.departmentalSyncs || parsed.departmentalSyncs.length === 0) parsed.departmentalSyncs = SEED_DEPARTMENTAL_SYNCS;
      if (!parsed.activityCharges || parsed.activityCharges.length === 0) parsed.activityCharges = SEED_ACTIVITY_CHARGES;
      // Inventory & Menu Collections Initializer
      if (!parsed.uoms || parsed.uoms.length === 0) parsed.uoms = SEED_UOMS;
      if (!parsed.inventoryCategories || parsed.inventoryCategories.length === 0) parsed.inventoryCategories = SEED_INVENTORY_CATEGORIES;
      if (!parsed.warehouses || parsed.warehouses.length === 0) parsed.warehouses = SEED_WAREHOUSES;
      if (!parsed.suppliers || parsed.suppliers.length === 0) parsed.suppliers = SEED_SUPPLIERS;
      if (!parsed.inventoryItems || parsed.inventoryItems.length === 0) parsed.inventoryItems = SEED_INVENTORY_ITEMS;
      if (!parsed.inventoryStocks || parsed.inventoryStocks.length === 0) parsed.inventoryStocks = SEED_INVENTORY_STOCKS;
      if (!parsed.itemBatches || parsed.itemBatches.length === 0) parsed.itemBatches = SEED_BATCHES;
      if (!parsed.stockLedgers || parsed.stockLedgers.length === 0) parsed.stockLedgers = SEED_STOCK_LEDGER;
      if (!parsed.purchaseRequests || parsed.purchaseRequests.length === 0) parsed.purchaseRequests = SEED_PURCHASE_REQUESTS;
      if (!parsed.purchaseOrders || parsed.purchaseOrders.length === 0) parsed.purchaseOrders = SEED_PURCHASE_ORDERS;
      if (!parsed.goodsReceiveNotes || parsed.goodsReceiveNotes.length === 0) parsed.goodsReceiveNotes = SEED_GRNS;
      if (!parsed.purchaseReturns) parsed.purchaseReturns = SEED_PURCHASE_RETURNS;
      if (!parsed.stockTransfers || parsed.stockTransfers.length === 0) parsed.stockTransfers = SEED_STOCK_TRANSFERS;
      if (!parsed.storeIssues || parsed.storeIssues.length === 0) parsed.storeIssues = SEED_STORE_ISSUES;
      if (!parsed.wastages || parsed.wastages.length === 0) parsed.wastages = SEED_WASTAGES;
      if (!parsed.physicalStockCounts || parsed.physicalStockCounts.length === 0) parsed.physicalStockCounts = SEED_PHYSICAL_COUNTS;
      if (!parsed.stockAdjustments || parsed.stockAdjustments.length === 0) parsed.stockAdjustments = SEED_ADJUSTMENTS;
      if (!parsed.serviceChargeRules || parsed.serviceChargeRules.length === 0) parsed.serviceChargeRules = SEED_SERVICE_CHARGE_RULES;
      if (!parsed.taxRules || parsed.taxRules.length === 0) parsed.taxRules = SEED_TAX_RULES;
      if (!parsed.enhancedMenuItems || parsed.enhancedMenuItems.length === 0) parsed.enhancedMenuItems = SEED_ENHANCED_MENU_ITEMS;
      if (!parsed.recipes || parsed.recipes.length === 0) parsed.recipes = SEED_RECIPES;
      if (!parsed.menuModifiers || parsed.menuModifiers.length === 0) parsed.menuModifiers = SEED_MENU_MODIFIERS;
      if (!parsed.menuCombos || parsed.menuCombos.length === 0) parsed.menuCombos = SEED_MENU_COMBOS;
      if (!parsed.menuPriceHistories || parsed.menuPriceHistories.length === 0) parsed.menuPriceHistories = SEED_PRICE_HISTORIES;
      return parsed;
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
    glAccounts: SEED_GL_ACCOUNTS,
    journalVouchers: SEED_JOURNAL_VOUCHERS,
    cityLedgerAccounts: SEED_CITY_LEDGER_ACCOUNTS,
    departmentalSyncs: SEED_DEPARTMENTAL_SYNCS,
    activityCharges: SEED_ACTIVITY_CHARGES,
    uoms: SEED_UOMS,
    inventoryCategories: SEED_INVENTORY_CATEGORIES,
    warehouses: SEED_WAREHOUSES,
    suppliers: SEED_SUPPLIERS,
    inventoryItems: SEED_INVENTORY_ITEMS,
    inventoryStocks: SEED_INVENTORY_STOCKS,
    itemBatches: SEED_BATCHES,
    stockLedgers: SEED_STOCK_LEDGER,
    purchaseRequests: SEED_PURCHASE_REQUESTS,
    purchaseOrders: SEED_PURCHASE_ORDERS,
    goodsReceiveNotes: SEED_GRNS,
    purchaseReturns: SEED_PURCHASE_RETURNS,
    stockTransfers: SEED_STOCK_TRANSFERS,
    storeIssues: SEED_STORE_ISSUES,
    wastages: SEED_WASTAGES,
    physicalStockCounts: SEED_PHYSICAL_COUNTS,
    stockAdjustments: SEED_ADJUSTMENTS,
    serviceChargeRules: SEED_SERVICE_CHARGE_RULES,
    taxRules: SEED_TAX_RULES,
    enhancedMenuItems: SEED_ENHANCED_MENU_ITEMS,
    recipes: SEED_RECIPES,
    menuModifiers: SEED_MENU_MODIFIERS,
    menuCombos: SEED_MENU_COMBOS,
    menuPriceHistories: SEED_PRICE_HISTORIES,
    settings: DEFAULT_SETTINGS,
    currentUser: SEED_USERS[0]
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function saveDatabase(state: PmsDatabaseState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
