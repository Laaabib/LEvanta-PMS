export type OperationalStatus = 
  | 'Available' 
  | 'Reserved' 
  | 'Occupied' 
  | 'Dirty' 
  | 'Cleaning' 
  | 'Inspected' 
  | 'Out of Order' 
  | 'Out of Service' 
  | 'Blocked';

export type HousekeepingStatus = 
  | 'Clean' 
  | 'Dirty' 
  | 'Cleaning' 
  | 'Inspected' 
  | 'Touch Up';

export type ReservationStatus = 
  | 'Confirmed' 
  | 'Unconfirmed' 
  | 'Checked-In' 
  | 'Checked-Out' 
  | 'Cancelled' 
  | 'No-Show';

export type StayStatus = 
  | 'Active' 
  | 'Checked-Out' 
  | 'Transferred';

export type FolioStatus = 
  | 'Open' 
  | 'Closed' 
  | 'Settled';

export type FolioItemType = 
  | 'Room Charge' 
  | 'Restaurant' 
  | 'Room Service' 
  | 'Convention' 
  | 'Laundry' 
  | 'Spa/Wellness' 
  | 'Amenity' 
  | 'Discount' 
  | 'Tax' 
  | 'Service Charge' 
  | 'Adjustment';

export type PaymentMethod = 
  | 'Cash' 
  | 'Credit Card' 
  | 'Debit Card' 
  | 'Bank Transfer' 
  | 'bKash' 
  | 'Nagad' 
  | 'Rocket' 
  | 'City Bank POS';

export type PaymentStatus = 
  | 'Completed' 
  | 'Refunded' 
  | 'Partially Refunded' 
  | 'Void';

export type InvoiceStatus = 
  | 'Draft' 
  | 'Issued' 
  | 'Paid' 
  | 'Partially Paid' 
  | 'Cancelled';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type MaintenanceStatus = 'Open' | 'Assigned' | 'In Progress' | 'Completed' | 'Closed';

export type EventStatus = 'Inquiry' | 'Confirmed' | 'Ongoing' | 'Completed' | 'Cancelled';

export type UserRoleName = 
  | 'Super Admin' 
  | 'General Manager' 
  | 'Front Office Manager' 
  | 'Front Desk' 
  | 'Accounts' 
  | 'Housekeeping' 
  | 'Maintenance' 
  | 'Event Manager' 
  | 'Restaurant Staff' 
  | 'Management';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRoleName;
  active: boolean;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface RolePermission {
  id: string;
  roleName: UserRoleName;
  permissions: string[];
}

export interface Guest {
  id: string;
  guestCode: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  nationality: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  idType: 'National ID (NID)' | 'Passport' | 'Driving License' | 'Birth Certificate';
  idNumber: string;
  company?: string;
  emergencyContact?: string;
  notes?: string;
  vipStatus?: boolean;
  totalStays: number;
  totalNights: number;
  totalSpend: number;
  createdAt: string;
  updatedAt: string;
}

export interface GuestDocument {
  id: string;
  guestId: string;
  documentType: string;
  documentNumber: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  maxAdults: number;
  maxChildren: number;
  baseRate: number; // in BDT (৳)
  basePrice?: number;
  bedType?: string;
  extraAdultRate: number;
  extraChildRate: number;
  amenities: string[];
  photoUrl?: string;
  active: boolean;
  totalRooms?: number;
}

export interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName?: string;
  floor: number;
  building?: string;
  wing?: string;
  isSmoking?: boolean;
  connectingRoom?: string;
  keyCardCode?: string;
  keyCardAssigned?: string;
  features?: string[];
  amenities?: string[];
  operationalStatus: OperationalStatus;
  housekeepingStatus: HousekeepingStatus;
  active: boolean;
  notes?: string;
}

export interface Reservation {
  id: string;
  reservationNumber: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  roomTypeId: string;
  roomTypeName: string;
  assignedRoomId?: string;
  assignedRoomNumber?: string;
  arrivalDate: string; // YYYY-MM-DD
  departureDate: string; // YYYY-MM-DD
  adults: number;
  children: number;
  status: ReservationStatus;
  bookingSource: 'Front Desk Walk-in' | 'Phone / Direct' | 'Corporate' | 'Booking.com' | 'Agoda' | 'Website Engine' | 'Travel Agent';
  rate: number;
  packageId?: string;
  packageName?: string;
  specialRequests?: string;
  depositAmount: number;
  paidAmount: number;
  totalEstimatedAmount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stay {
  id: string;
  stayNumber: string;
  reservationId: string;
  guestId: string;
  guestName: string;
  roomId: string;
  roomNumber: string;
  roomTypeName: string;
  rate?: number;
  adults?: number;
  children?: number;
  checkInAt: string;
  expectedCheckOutAt: string;
  actualCheckOutAt?: string;
  status: StayStatus;
  folioId: string;
  keyCardsIssued: number;
  verifiedId: boolean;
  stopPost?: boolean;
  stopPostReason?: string;
  stopPostBy?: string;
  stopPostAt?: string;
  notes?: string;
}

export interface FolioItem {
  id: string;
  folioId: string;
  type: FolioItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  postedBy: string;
  createdAt: string;
  reference?: string;
  voided?: boolean;
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: string;
}

export interface Folio {
  id: string;
  folioNumber: string;
  stayId: string;
  guestId: string;
  guestName: string;
  roomNumber: string;
  status: FolioStatus;
  items: FolioItem[];
  subtotal: number;
  discountTotal: number;
  serviceChargeTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidTotal: number;
  balance: number;
  openedAt: string;
  closedAt?: string;
  stopPost?: boolean;
  stopPostReason?: string;
  stopPostBy?: string;
  stopPostAt?: string;
}

export interface Payment {
  id: string;
  transactionNumber: string;
  folioId?: string;
  eventBookingId?: string;
  reservationId?: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  status: PaymentStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
  voided?: boolean;
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  transactionNumber: string;
  amount: number;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  folioId?: string;
  eventBookingId?: string;
  guestOrClientName: string;
  phone?: string;
  address?: string;
  stayOrEventDetails: string;
  roomOrHall: string;
  dates: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  serviceCharge: number;
  tax: number;
  grandTotal: number;
  paidAmount: number;
  balance: number;
  status: InvoiceStatus;
  issuedAt: string;
  issuedBy: string;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  roomTypeName: string;
  assignedTo?: string;
  taskType: 'Full Turnover' | 'Daily Service' | 'Inspection' | 'Deep Clean' | 'VIP Rush';
  priority: TaskPriority;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Inspected';
  checklist: {
    bedLinenChanged: boolean;
    bathroomSanitized: boolean;
    towelsReplaced: boolean;
    amenitiesRestocked: boolean;
    floorCleaned: boolean;
    minibarChecked: boolean;
  };
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  roomId: string;
  roomNumber: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  assignedTo?: string;
  status: MaintenanceStatus;
  cost: number;
  marksOutOfOrder: boolean;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Hall {
  id: string;
  name: string;
  code: string;
  description: string;
  venueType?: 'Convention Hall' | 'Banquet Hall' | 'Meeting Room' | 'Boardroom' | 'Open Lawn' | 'Open Lawn / Amphitheatre';
  floor?: string;
  capacity: number;
  seatingTheater?: number;
  seatingBanquet?: number;
  seatingUShape?: number;
  seatingClassroom?: number;
  dimensions: string;
  baseRatePerDay: number;
  baseRateHalfDay: number;
  baseRatePerHour?: number;
  amenities: string[];
  active: boolean;
}

export interface EventClient {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export interface EventBookingItem {
  id: string;
  itemType: 'Hall Rent' | 'Food Package' | 'Decoration' | 'Sound & AV' | 'Stage Setup' | 'Projector' | 'Extra Service';
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface EventBooking {
  id: string;
  eventNumber: string;
  clientId: string;
  clientName: string;
  clientCompany?: string;
  clientPhone: string;
  hallId: string;
  hallName: string;
  eventName: string;
  eventType: 'Corporate' | 'Wedding' | 'Conference' | 'Banquet' | 'Exhibition' | 'Annual General Meeting (AGM)' | 'Seminar' | 'Birthday / Social';
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  guestCount: number;
  packageId?: string;
  packageName?: string;
  status: EventStatus;
  items: EventBookingItem[];
  subtotal: number;
  discount: number;
  serviceCharge: number;
  tax: number;
  total: number;
  totalAmount?: number;
  deposit: number;
  balance: number;
  notes?: string;
  createdAt: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  packageType: 'Honeymoon' | 'Family' | 'Corporate' | 'Weekend' | 'Event';
  price: number;
  active: boolean;
  includes: string[];
  nightsCount?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  active: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

export interface RestaurantOrder {
  id: string;
  orderNumber: string;
  stayId?: string;
  roomNumber?: string;
  guestName?: string;
  tableNumber?: string;
  orderType?: 'room-dining' | 'restaurant-table' | 'bar-lounge' | 'counter-takeaway';
  inRoomDiningDetails?: {
    deliveryTime?: string;
    trayCharge?: number;
    trayChargeIncluded?: boolean;
    specialNotes?: string;
  };
  status: 'Pending' | 'Preparing' | 'Served' | 'Posted to Folio' | 'Settled Direct' | 'Voided';
  items: {
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
  folioId?: string;
  createdBy: string;
  createdAt: string;
  voided?: boolean;
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: string;
}

export interface AuditClosedFolio {
  id: string;
  folioNumber: string;
  stayId?: string;
  guestName: string;
  roomNumber: string;
  roomType?: string;
  grandTotal: number;
  paidTotal: number;
  balance: number;
  status: 'Settled' | 'Closed' | 'Open' | 'Partially Paid';
  closedAt: string;
  settlementMethod?: string;
  remarks?: string;
}

export interface AuditGeneratedInvoice {
  id: string;
  invoiceNumber: string;
  folioNumber?: string;
  guestOrClientName: string;
  roomOrHall: string;
  subtotal: number;
  serviceCharge: number;
  tax: number;
  grandTotal: number;
  status: InvoiceStatus;
  issuedAt: string;
  issuedBy: string;
}

export interface AuditTriggeredAlert {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'vip' | 'success';
  title: string;
  message: string;
  category: 'Financial / Ledger' | 'Front Desk' | 'Housekeeping' | 'Security / Stop-Post' | 'Banquet & Events';
  timestamp: string;
  actionRoute?: string;
  actionLabel?: string;
  resolved?: boolean;
}

export interface AuditPostedCharge {
  stayId: string;
  roomNumber: string;
  guestName: string;
  roomType: string;
  rate: number;
  tax: number;
  serviceCharge: number;
  total: number;
  postedAt: string;
}

export interface NightAuditRecord {
  id: string;
  auditNumber: string;
  businessDate: string;
  nextBusinessDate: string;
  closedAt: string;
  closedBy: string;
  isAutomatic: boolean;
  totalRoomsOccupied: number;
  occupancyPercent: number;
  roomRevenuePosted: number;
  fbRevenue: number;
  banquetRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
  totalPaymentsCollected: number;
  ledgerBalance: number;
  inHouseStaysCount: number;
  departuresPending: number;
  notes?: string;
  status: 'Completed' | 'Warning' | 'Failed';
  
  // Detailed automated process results from the 5:00 AM audit run
  closedFolios?: AuditClosedFolio[];
  generatedInvoices?: AuditGeneratedInvoice[];
  triggeredAlerts?: AuditTriggeredAlert[];
  postedCharges?: AuditPostedCharge[];
}

export type PermissionKey =
  | 'can_void_bills'
  | 'can_delete_reservations'
  | 'can_modify_reservations'
  | 'can_void_payments'
  | 'can_run_night_audit'
  | 'can_manage_rooms'
  | 'can_manage_halls'
  | 'can_manage_users'
  | 'can_manage_roles'
  | 'can_view_reports'
  | 'can_checkin_checkout'
  | 'can_post_charges';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: 'Reservation' | 'Stay' | 'Room' | 'Folio' | 'Payment' | 'Refund' | 'Event' | 'Housekeeping' | 'Maintenance' | 'User' | 'Settings' | 'Hall' | 'Order' | 'NightAudit';
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface OperationalAlert {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'vip' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  actionLabel?: string;
  actionRoute?: string;
}

export interface SystemSetting {
  resortName: string;
  address: string;
  phone: string;
  email: string;
  taxRatePercent: number;
  vatRate?: number;
  serviceChargePercent: number;
  serviceChargeRate?: number;
  currencySymbol: string;
  checkInTime: string;
  checkOutTime: string;
  allowOverbooking: boolean;
  requireDepositForReservation: boolean;
  autoNightAuditEnabled: boolean;
  autoNightAuditTime: string; // e.g. "05:00"
  currentBusinessDate: string; // e.g. "2026-08-31"
  lastNightAuditDate?: string;
}
