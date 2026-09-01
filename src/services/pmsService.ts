import {
  getInitialDatabase, saveDatabase, PmsDatabaseState
} from './mockPmsDatabase';
import {
  Reservation, Stay, Folio, FolioItem, Payment, Refund, Invoice,
  HousekeepingTask, MaintenanceTicket, EventBooking, RestaurantOrder,
  AuditLog, OperationalStatus, HousekeepingStatus, Room, Guest, UserRoleName,
  OperationalAlert, RoomType, Package, MenuItem, EventClient, NightAuditRecord,
  PermissionKey, Hall, User, GLAccount, JournalVoucher, JournalEntryItem,
  CityLedgerAccount, DepartmentalSyncStatus, ActivityAmenityCharge
} from '../types/pms';
import { inventoryMenuService } from './inventoryMenuService';
import * as XLSX from 'xlsx';

// Reactive listeners
type Listener = (state: PmsDatabaseState) => void;
let listeners: Listener[] = [];
let state: PmsDatabaseState = getInitialDatabase();

function notify() {
  saveDatabase(state);
  listeners.forEach(fn => fn(state));
}

export const pmsService = {
  subscribe(fn: Listener) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  },

  getState(): PmsDatabaseState {
    return state;
  },

  getDatabase(): PmsDatabaseState {
    return state;
  },

  notify() {
    notify();
  },

  resetToSeed() {
    localStorage.removeItem('cculb_pms_db_v1');
    state = getInitialDatabase();
    notify();
  },

  setCurrentUser(userId: string) {
    const user = state.users.find(u => u.id === userId);
    if (user) {
      state.currentUser = user;
      notify();
    }
  },

  logAudit(action: string, entityType: AuditLog['entityType'], entityId: string, oldValue?: string, newValue?: string) {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      userRole: state.currentUser.role,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress: '192.168.1.50',
      createdAt: new Date().toISOString()
    };
    state.auditLogs.unshift(log);
  },

  addAlert(type: OperationalAlert['type'], title: string, message: string, actionLabel?: string, actionRoute?: string) {
    const alert: OperationalAlert = {
      id: `alt-${Date.now()}`,
      type,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      actionLabel,
      actionRoute
    };
    state.alerts.unshift(alert);
    notify();
  },

  markAlertRead(alertId: string) {
    state.alerts = state.alerts.map(a => a.id === alertId ? { ...a, read: true } : a);
    notify();
  },

  clearAllAlerts() {
    state.alerts = state.alerts.map(a => ({ ...a, read: true }));
    notify();
  },

  // -------------------------------------------------------------
  // AVAILABILITY ENGINE (Double-Booking & Date-Overlap Prevention)
  // -------------------------------------------------------------
  checkRoomAvailability(roomId: string, arrivalDate: string, departureDate: string, excludeReservationId?: string): {
    isAvailable: boolean;
    reason?: string;
  } {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return { isAvailable: false, reason: 'Room not found' };
    if (!room.active) return { isAvailable: false, reason: 'Room is marked inactive' };
    if (room.operationalStatus === 'Out of Order') return { isAvailable: false, reason: 'Room is currently Out of Order for maintenance' };

    const arr = new Date(arrivalDate).getTime();
    const dep = new Date(departureDate).getTime();

    if (isNaN(arr) || isNaN(dep) || arr >= dep) {
      return { isAvailable: false, reason: 'Departure date must be after arrival date' };
    }

    // Check active stays
    const activeStay = state.stays.find(s => s.roomId === roomId && s.status === 'Active');
    if (activeStay) {
      const checkInStr = activeStay.checkInAt ? activeStay.checkInAt.split('T')[0] : '';
      const expDepStr = activeStay.expectedCheckOutAt ? activeStay.expectedCheckOutAt.split('T')[0] : '';
      const stayCheckIn = checkInStr ? new Date(checkInStr).getTime() : 0;
      const stayExpectedDep = expDepStr ? new Date(expDepStr).getTime() : 0;
      if (arr < stayExpectedDep && dep > stayCheckIn) {
        return { isAvailable: false, reason: `Room is currently occupied by active stay ${activeStay.stayNumber}` };
      }
    }

    // Check overlapping confirmed/checked-in reservations
    const overlappingRes = state.reservations.find(res => {
      if (excludeReservationId && res.id === excludeReservationId) return false;
      if (res.assignedRoomId !== roomId) return false;
      if (res.status === 'Cancelled' || res.status === 'Checked-Out' || res.status === 'No-Show') return false;

      const resArr = new Date(res.arrivalDate).getTime();
      const resDep = new Date(res.departureDate).getTime();
      return arr < resDep && dep > resArr;
    });

    if (overlappingRes) {
      return {
        isAvailable: false,
        reason: `Room is already reserved by ${overlappingRes.guestName} (${overlappingRes.reservationNumber}) from ${overlappingRes.arrivalDate} to ${overlappingRes.departureDate}`
      };
    }

    return { isAvailable: true };
  },

  getAvailableRoomsForDates(arrivalDate: string, departureDate: string, roomTypeId?: string): Room[] {
    return state.rooms.filter(room => {
      if (roomTypeId && room.roomTypeId !== roomTypeId) return false;
      const { isAvailable } = this.checkRoomAvailability(room.id, arrivalDate, departureDate);
      return isAvailable;
    });
  },

  getAvailabilitySummary(arrivalDate: string, departureDate: string): {
    roomType: RoomType;
    totalRooms: number;
    availableCount: number;
    baseRate: number;
  }[] {
    return state.roomTypes.map(rt => {
      const matchingRooms = state.rooms.filter(r => r.roomTypeId === rt.id && r.active);
      const availableRooms = matchingRooms.filter(r => this.checkRoomAvailability(r.id, arrivalDate, departureDate).isAvailable);
      return {
        roomType: rt,
        totalRooms: matchingRooms.length,
        availableCount: availableRooms.length,
        baseRate: rt.baseRate
      };
    });
  },

  // -------------------------------------------------------------
  // GUEST MANAGEMENT
  // -------------------------------------------------------------
  createGuest(guestData: Omit<Guest, 'id' | 'guestCode' | 'totalStays' | 'totalNights' | 'totalSpend' | 'createdAt' | 'updatedAt'>): Guest {
    const codeNumber = state.guests.length + 101;
    const newGuest: Guest = {
      ...guestData,
      id: `gst-${Date.now()}`,
      guestCode: `GST-2026-00${codeNumber}`,
      totalStays: 0,
      totalNights: 0,
      totalSpend: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.guests.unshift(newGuest);
    this.logAudit('Created Guest Profile', 'Stay', newGuest.id, undefined, `${newGuest.fullName} (${newGuest.phone})`);
    notify();
    return newGuest;
  },

  updateGuest(id: string, updates: Partial<Guest>): Guest {
    const idx = state.guests.findIndex(g => g.id === id);
    if (idx === -1) throw new Error('Guest not found');
    const old = state.guests[idx];
    const updated = { ...old, ...updates, updatedAt: new Date().toISOString() };
    state.guests[idx] = updated;
    this.logAudit('Updated Guest Profile', 'Stay', id, old.fullName, updated.fullName);
    notify();
    return updated;
  },

  // -------------------------------------------------------------
  // RESERVATIONS
  // -------------------------------------------------------------
  createReservation(data: {
    guestId: string;
    roomTypeId: string;
    assignedRoomId?: string;
    arrivalDate: string;
    departureDate: string;
    adults: number;
    children: number;
    bookingSource: Reservation['bookingSource'];
    packageId?: string;
    specialRequests?: string;
    depositAmount?: number;
    paymentMethod?: Payment['method'];
    paymentReference?: string;
  }): Reservation {
    const guest = state.guests.find(g => g.id === data.guestId);
    if (!guest) throw new Error('Guest profile not found');

    const roomType = state.roomTypes.find(rt => rt.id === data.roomTypeId);
    if (!roomType) throw new Error('Room type not found');

    // Concurrency check
    if (data.assignedRoomId) {
      const avail = this.checkRoomAvailability(data.assignedRoomId, data.arrivalDate, data.departureDate);
      if (!avail.isAvailable) {
        throw new Error(avail.reason || 'Selected room is not available for specified dates.');
      }
    }

    const arr = new Date(data.arrivalDate);
    const dep = new Date(data.departureDate);
    const nights = Math.max(1, Math.round((dep.getTime() - arr.getTime()) / (1000 * 60 * 60 * 24)));
    
    let rate = roomType.baseRate;
    let packageName: string | undefined;
    if (data.packageId) {
      const pkg = state.packages.find(p => p.id === data.packageId);
      if (pkg) {
        rate = pkg.price;
        packageName = pkg.name;
      }
    }

    const totalEstimated = rate * nights;
    const deposit = data.depositAmount || 0;
    const resNumber = `RES-2026-00${state.reservations.length + 458}`;

    let assignedRoomNumber: string | undefined;
    if (data.assignedRoomId) {
      const room = state.rooms.find(r => r.id === data.assignedRoomId);
      if (room) {
        assignedRoomNumber = room.roomNumber;
        // Mark room reserved if today
        const todayStr = new Date().toISOString().split('T')[0];
        if (data.arrivalDate === todayStr && room.operationalStatus === 'Available') {
          room.operationalStatus = 'Reserved';
        }
      }
    }

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      reservationNumber: resNumber,
      guestId: guest.id,
      guestName: guest.fullName,
      guestPhone: guest.phone,
      guestEmail: guest.email,
      roomTypeId: roomType.id,
      roomTypeName: roomType.name,
      assignedRoomId: data.assignedRoomId,
      assignedRoomNumber,
      arrivalDate: data.arrivalDate,
      departureDate: data.departureDate,
      adults: data.adults,
      children: data.children,
      status: 'Confirmed',
      bookingSource: data.bookingSource,
      rate,
      packageId: data.packageId,
      packageName,
      specialRequests: data.specialRequests,
      depositAmount: deposit,
      paidAmount: deposit,
      totalEstimatedAmount: totalEstimated,
      createdBy: state.currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    state.reservations.unshift(newRes);

    if (deposit > 0 && data.paymentMethod) {
      const txnNumber = `TXN-2026-09${state.payments.length + 10}`;
      const payment: Payment = {
        id: `pay-${Date.now()}`,
        transactionNumber: txnNumber,
        reservationId: newRes.id,
        amount: deposit,
        method: data.paymentMethod,
        reference: data.paymentReference || 'Advance Reservation Deposit',
        status: 'Completed',
        notes: `Advance for ${newRes.reservationNumber}`,
        createdBy: state.currentUser.name,
        createdAt: new Date().toISOString()
      };
      state.payments.unshift(payment);
    }

    this.logAudit('Created Reservation', 'Reservation', newRes.id, undefined, `${newRes.reservationNumber} for ${guest.fullName} (${nights} nights)`);
    this.addAlert('info', `New Reservation: ${newRes.reservationNumber}`, `${guest.fullName} reserved ${roomType.name} from ${data.arrivalDate} to ${data.departureDate}`, 'View Reservations', 'reservations');
    
    notify();
    return newRes;
  },

  cancelReservation(reservationId: string, reason?: string) {
    const res = state.reservations.find(r => r.id === reservationId);
    if (!res) throw new Error('Reservation not found');
    res.status = 'Cancelled';
    res.updatedAt = new Date().toISOString();

    if (res.assignedRoomId) {
      const room = state.rooms.find(r => r.id === res.assignedRoomId);
      if (room && room.operationalStatus === 'Reserved') {
        room.operationalStatus = 'Available';
      }
    }

    this.logAudit('Cancelled Reservation', 'Reservation', res.id, 'Confirmed', `Cancelled: ${reason || 'Guest requested'}`);
    notify();
  },

  // -------------------------------------------------------------
  // FRONT DESK CHECK-IN (Transactional Atomic Execution)
  // -------------------------------------------------------------
  checkInReservation(params: {
    reservationId: string;
    roomId: string;
    keyCardsIssued?: number;
    verifiedId?: boolean;
    depositPayment?: {
      amount: number;
      method: Payment['method'];
      reference: string;
    };
    specialRequests?: string;
  }): { stay: Stay; folio: Folio } {
    const res = state.reservations.find(r => r.id === params.reservationId);
    if (!res) throw new Error('Reservation not found');
    if (res.status === 'Checked-In') throw new Error('Reservation is already checked in');

    const room = state.rooms.find(r => r.id === params.roomId);
    if (!room) throw new Error('Room not found');
    if (room.operationalStatus === 'Occupied') {
      throw new Error(`Room ${room.roomNumber} is already occupied by another active stay`);
    }
    if (room.operationalStatus === 'Out of Order') {
      throw new Error(`Room ${room.roomNumber} is Out of Order for maintenance`);
    }

    const guest = state.guests.find(g => g.id === res.guestId);
    if (!guest) throw new Error('Guest record not found');

    const stayNumber = `STY-2026-00${state.stays.length + 316}`;
    const folioNumber = `FOL-2026-00${state.folios.length + 886}`;
    const stayId = `sty-${Date.now()}`;
    const folioId = `fol-${Date.now()}`;

    // 1. Mark Room Occupied
    room.operationalStatus = 'Occupied';
    room.housekeepingStatus = 'Clean';

    // 2. Update Reservation
    res.status = 'Checked-In';
    res.assignedRoomId = room.id;
    res.assignedRoomNumber = room.roomNumber;
    res.updatedAt = new Date().toISOString();

    // 3. Create Stay
    const stay: Stay = {
      id: stayId,
      stayNumber,
      reservationId: res.id,
      guestId: guest.id,
      guestName: guest.fullName,
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomTypeName: room.roomTypeName || 'Standard',
      checkInAt: new Date().toISOString(),
      expectedCheckOutAt: `${res.departureDate}T12:00:00Z`,
      status: 'Active',
      folioId,
      keyCardsIssued: params.keyCardsIssued || 2,
      verifiedId: params.verifiedId ?? true,
      notes: params.specialRequests || res.specialRequests
    };
    state.stays.unshift(stay);

    // 4. Create Initial Folio & Night 1 Room Charge
    const taxRate = state.settings.taxRatePercent / 100;
    const scRate = state.settings.serviceChargePercent / 100;
    const baseRoomRate = res.rate;
    const roomTax = Math.round(baseRoomRate * taxRate);
    const roomSC = Math.round(baseRoomRate * scRate);

    const initialItem: FolioItem = {
      id: `item-${Date.now()}`,
      folioId,
      type: 'Room Charge',
      description: `Night 1 Room Charge - ${room.roomTypeName} (Room ${room.roomNumber})`,
      quantity: 1,
      unitPrice: baseRoomRate,
      discount: 0,
      tax: roomTax,
      total: baseRoomRate + roomTax,
      postedBy: state.currentUser.name,
      createdAt: new Date().toISOString()
    };

    let totalPaid = res.paidAmount || 0;

    // Process additional check-in deposit if provided
    if (params.depositPayment && params.depositPayment.amount > 0) {
      totalPaid += params.depositPayment.amount;
      const txnNumber = `TXN-2026-09${state.payments.length + 10}`;
      const payment: Payment = {
        id: `pay-${Date.now()}`,
        transactionNumber: txnNumber,
        folioId,
        reservationId: res.id,
        amount: params.depositPayment.amount,
        method: params.depositPayment.method,
        reference: params.depositPayment.reference || 'Check-in Counter Deposit',
        status: 'Completed',
        notes: `Check-in advance payment for Room ${room.roomNumber}`,
        createdBy: state.currentUser.name,
        createdAt: new Date().toISOString()
      };
      state.payments.unshift(payment);
    }

    const folio: Folio = {
      id: folioId,
      folioNumber,
      stayId,
      guestId: guest.id,
      guestName: guest.fullName,
      roomNumber: room.roomNumber,
      status: 'Open',
      items: [initialItem],
      subtotal: baseRoomRate,
      discountTotal: 0,
      serviceChargeTotal: roomSC,
      taxTotal: roomTax,
      grandTotal: baseRoomRate + roomSC + roomTax,
      paidTotal: totalPaid,
      balance: (baseRoomRate + roomSC + roomTax) - totalPaid,
      openedAt: new Date().toISOString()
    };
    state.folios.unshift(folio);

    // Update guest stats
    guest.totalStays += 1;

    this.logAudit('Completed Check-In', 'Stay', stay.id, 'Reservation Confirmed', `Stay ${stayNumber}, Room ${room.roomNumber}, Folio ${folioNumber}`);
    this.addAlert('success', `Check-in Completed: Room ${room.roomNumber}`, `${guest.fullName} is now in-house. Folio ${folioNumber} opened.`, 'View Folio', 'billing');

    notify();
    return { stay, folio };
  },

  // -------------------------------------------------------------
  // FRONT DESK CHECK-OUT & AUTOMATIC HOUSEKEEPING TRIGGER
  // -------------------------------------------------------------
  checkOutStay(params: {
    stayId: string;
    settlePayment?: {
      amount: number;
      method: Payment['method'];
      reference: string;
    };
  }): { invoice: Invoice } {
    const stay = state.stays.find(s => s.id === params.stayId);
    if (!stay) throw new Error('Stay record not found');
    if (stay.status === 'Checked-Out') throw new Error('Stay is already checked out');

    const folio = state.folios.find(f => f.id === stay.folioId);
    if (!folio) throw new Error('Folio not found');

    const room = state.rooms.find(r => r.id === stay.roomId);
    if (!room) throw new Error('Room not found');

    const res = state.reservations.find(r => r.id === stay.reservationId);
    const guest = state.guests.find(g => g.id === stay.guestId);

    // Process settlement payment if balance is being paid
    if (params.settlePayment && params.settlePayment.amount > 0) {
      const txnNumber = `TXN-2026-09${state.payments.length + 10}`;
      const payment: Payment = {
        id: `pay-${Date.now()}`,
        transactionNumber: txnNumber,
        folioId: folio.id,
        amount: params.settlePayment.amount,
        method: params.settlePayment.method,
        reference: params.settlePayment.reference || 'Check-out Balance Settlement',
        status: 'Completed',
        notes: `Full checkout settlement for Room ${stay.roomNumber}`,
        createdBy: state.currentUser.name,
        createdAt: new Date().toISOString()
      };
      state.payments.unshift(payment);

      folio.paidTotal += params.settlePayment.amount;
      folio.balance = folio.grandTotal - folio.paidTotal;
    }

    // 1. Mark Stay Checked Out
    stay.status = 'Checked-Out';
    stay.actualCheckOutAt = new Date().toISOString();

    // 2. Mark Reservation Checked Out
    if (res) {
      res.status = 'Checked-Out';
      res.updatedAt = new Date().toISOString();
    }

    // 3. Mark Folio Closed / Settled
    folio.status = folio.balance <= 0 ? 'Settled' : 'Closed';
    folio.closedAt = new Date().toISOString();

    // 4. Mark Room Dirty & Trigger Automatic Housekeeping Task
    room.operationalStatus = 'Dirty';
    room.housekeepingStatus = 'Dirty';

    const hkTask: HousekeepingTask = {
      id: `hk-${Date.now()}`,
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomTypeName: room.roomTypeName || 'Standard',
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
      notes: `Checkout turnover after ${guest?.fullName || 'Guest'}. Prepare for incoming guests.`,
      createdAt: new Date().toISOString()
    };
    state.housekeepingTasks.unshift(hkTask);

    // 5. Generate Official Invoice
    const invoiceNumber = `INV-2026-00${state.invoices.length + 882}`;
    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      folioId: folio.id,
      guestOrClientName: guest?.fullName || stay.guestName,
      phone: guest?.phone,
      address: guest?.address,
      stayOrEventDetails: `Stay ${stay.stayNumber} (${stay.checkInAt ? stay.checkInAt.split('T')[0] : ''} to ${stay.actualCheckOutAt ? stay.actualCheckOutAt.split('T')[0] : stay.expectedCheckOutAt ? stay.expectedCheckOutAt.split('T')[0] : ''})`,
      roomOrHall: `Room ${room.roomNumber} (${room.roomTypeName})`,
      dates: `${stay.checkInAt ? stay.checkInAt.split('T')[0] : ''} – ${stay.actualCheckOutAt ? stay.actualCheckOutAt.split('T')[0] : stay.expectedCheckOutAt ? stay.expectedCheckOutAt.split('T')[0] : ''}`,
      items: folio.items.map(it => ({
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.total
      })),
      subtotal: folio.subtotal,
      discount: folio.discountTotal,
      serviceCharge: folio.serviceChargeTotal,
      tax: folio.taxTotal,
      grandTotal: folio.grandTotal,
      paidAmount: folio.paidTotal,
      balance: folio.balance,
      status: folio.balance <= 0 ? 'Paid' : 'Partially Paid',
      issuedAt: new Date().toISOString(),
      issuedBy: state.currentUser.name
    };
    state.invoices.unshift(invoice);

    // Update guest total spend
    if (guest) {
      guest.totalSpend += folio.paidTotal;
      guest.totalNights += 1;
    }

    this.logAudit('Completed Check-Out', 'Stay', stay.id, 'Active', `Room ${room.roomNumber} vacated, Folio ${folio.folioNumber} settled, Invoice ${invoiceNumber} generated, Room set to Dirty`);
    this.addAlert('info', `Check-out: Room ${room.roomNumber}`, `${guest?.fullName || 'Guest'} checked out. Housekeeping task dispatched.`, 'Housekeeping Board', 'housekeeping');

    notify();
    return { invoice };
  },

  // -------------------------------------------------------------
  // ROOM TRANSFER (Inter-Room Relocation)
  // -------------------------------------------------------------
  transferRoom(stayId: string, newRoomId: string, reason: string): { stay: Stay; newRoom: Room } {
    const stay = state.stays.find(s => s.id === stayId && s.status === 'Active');
    if (!stay) throw new Error('Active stay not found');

    const oldRoom = state.rooms.find(r => r.id === stay.roomId);
    const newRoom = state.rooms.find(r => r.id === newRoomId);
    if (!newRoom) throw new Error('New room not found');
    if (newRoom.operationalStatus === 'Occupied') throw new Error(`Room ${newRoom.roomNumber} is occupied`);
    if (newRoom.operationalStatus === 'Out of Order') throw new Error(`Room ${newRoom.roomNumber} is Out of Order`);

    // Transfer
    if (oldRoom) {
      oldRoom.operationalStatus = 'Dirty';
      oldRoom.housekeepingStatus = 'Dirty';
      // Create HK task for old room
      state.housekeepingTasks.unshift({
        id: `hk-${Date.now()}`,
        roomId: oldRoom.id,
        roomNumber: oldRoom.roomNumber,
        roomTypeName: oldRoom.roomTypeName || 'Room',
        taskType: 'Full Turnover',
        priority: 'Medium',
        status: 'Pending',
        checklist: { bedLinenChanged: false, bathroomSanitized: false, towelsReplaced: false, amenitiesRestocked: false, floorCleaned: false, minibarChecked: false },
        notes: `Room transfer turnover from Room ${oldRoom.roomNumber} to Room ${newRoom.roomNumber}. Reason: ${reason}`,
        createdAt: new Date().toISOString()
      });
    }

    newRoom.operationalStatus = 'Occupied';
    newRoom.housekeepingStatus = 'Clean';

    const oldRoomNum = stay.roomNumber;
    stay.roomId = newRoom.id;
    stay.roomNumber = newRoom.roomNumber;
    stay.roomTypeName = newRoom.roomTypeName || 'Standard';

    // Update Folio note
    const folio = state.folios.find(f => f.id === stay.folioId);
    if (folio) {
      folio.roomNumber = newRoom.roomNumber;
      folio.items.push({
        id: `item-${Date.now()}`,
        folioId: folio.id,
        type: 'Adjustment',
        description: `Room Transfer: Relocated from Room ${oldRoomNum} to Room ${newRoom.roomNumber} (${reason})`,
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        tax: 0,
        total: 0,
        postedBy: state.currentUser.name,
        createdAt: new Date().toISOString()
      });
    }

    this.logAudit('Room Transfer', 'Stay', stay.id, `Room ${oldRoomNum}`, `Transferred to Room ${newRoom.roomNumber} (${reason})`);
    this.addAlert('info', `Room Transfer: ${oldRoomNum} → ${newRoom.roomNumber}`, `${stay.guestName} moved to Room ${newRoom.roomNumber}`, 'View Room Rack', 'rooms');

    notify();
    return { stay, newRoom };
  },

  // -------------------------------------------------------------
  // STOP POST (Restrict / Unrestrict Room Charge Postings)
  // -------------------------------------------------------------
  toggleStopPost(stayId: string, stopPost: boolean, reason?: string): { stay: Stay; folio: Folio } {
    const stay = state.stays.find(s => s.id === stayId);
    if (!stay) throw new Error('Stay record not found');

    const folio = state.folios.find(f => f.id === stay.folioId);
    if (!folio) throw new Error('Folio record not found');

    const trimmedReason = reason?.trim() || (stopPost ? 'Restricted by Front Office' : undefined);

    stay.stopPost = stopPost;
    stay.stopPostReason = trimmedReason;
    stay.stopPostBy = state.currentUser.name;
    stay.stopPostAt = new Date().toISOString();

    folio.stopPost = stopPost;
    folio.stopPostReason = trimmedReason;
    folio.stopPostBy = state.currentUser.name;
    folio.stopPostAt = stay.stopPostAt;

    const action = stopPost ? 'Enabled Stop Post' : 'Removed Stop Post';
    this.logAudit(
      action,
      'Stay',
      stay.id,
      stopPost ? 'Posting Allowed' : 'Stop Post Active',
      `Room ${stay.roomNumber} (${stay.guestName}) - Stop Post ${stopPost ? `ON: "${trimmedReason}"` : 'OFF: Posting Unlocked'}`
    );

    if (stopPost) {
      this.addAlert(
        'warning',
        `Stop Post Active: Room ${stay.roomNumber}`,
        `Posting room charges from F&B / POS / Outlets is now blocked for ${stay.guestName}. Reason: ${trimmedReason}`,
        'View Folio',
        'billing'
      );
    } else {
      this.addAlert(
        'info',
        `Stop Post Cleared: Room ${stay.roomNumber}`,
        `Room charge posting re-enabled for ${stay.guestName}.`,
        'View Folio',
        'billing'
      );
    }

    notify();
    return { stay, folio };
  },

  // -------------------------------------------------------------
  // FOLIO & BILLING (Post Charges, Payments, Discounts, Adjustments)
  // -------------------------------------------------------------
  postFolioCharge(folioId: string, itemData: {
    type: FolioItem['type'];
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    applyTax?: boolean;
    reference?: string;
    allowStopPostOverride?: boolean;
  }): FolioItem {
    const folio = state.folios.find(f => f.id === folioId);
    if (!folio) throw new Error('Folio not found');

    if (folio.stopPost && !itemData.allowStopPostOverride) {
      throw new Error(`Posting restricted: Room ${folio.roomNumber || folio.folioNumber} has STOP POST active (${folio.stopPostReason || 'No outlet charges permitted'}). Remove Stop Post lock or authorize manual override.`);
    }

    const discount = itemData.discount || 0;
    const rawTotal = (itemData.quantity * itemData.unitPrice) - discount;
    const taxRate = itemData.applyTax !== false ? (state.settings.taxRatePercent / 100) : 0;
    const tax = Math.round(rawTotal * taxRate);
    const lineTotal = rawTotal + tax;

    const newItem: FolioItem = {
      id: `item-${Date.now()}`,
      folioId,
      type: itemData.type,
      description: itemData.description,
      quantity: itemData.quantity,
      unitPrice: itemData.unitPrice,
      discount,
      tax,
      total: lineTotal,
      postedBy: state.currentUser.name,
      createdAt: new Date().toISOString(),
      reference: itemData.reference
    };

    folio.items.push(newItem);
    
    // Recalculate totals
    this.recalculateFolio(folio);
    this.logAudit('Posted Folio Charge', 'Folio', folio.id, undefined, `${newItem.description} (৳${lineTotal}) to Folio ${folio.folioNumber}`);
    notify();
    return newItem;
  },

  recordFolioPayment(folioId: string, paymentData: {
    amount: number;
    method: Payment['method'];
    reference: string;
    notes?: string;
  }): Payment {
    const folio = state.folios.find(f => f.id === folioId);
    if (!folio) throw new Error('Folio not found');

    const txnNumber = `TXN-2026-09${state.payments.length + 10}`;
    const payment: Payment = {
      id: `pay-${Date.now()}`,
      transactionNumber: txnNumber,
      folioId,
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference,
      status: 'Completed',
      notes: paymentData.notes,
      createdBy: state.currentUser.name,
      createdAt: new Date().toISOString()
    };

    state.payments.unshift(payment);
    folio.paidTotal += paymentData.amount;
    folio.balance = folio.grandTotal - folio.paidTotal;

    this.logAudit('Received Payment', 'Payment', payment.id, undefined, `৳${payment.amount} via ${payment.method} for Folio ${folio.folioNumber}`);
    notify();
    return payment;
  },

  recalculateFolio(folio: Folio) {
    let sub = 0;
    let disc = 0;
    let tax = 0;
    folio.items.filter(it => !it.voided).forEach(it => {
      sub += (it.quantity * it.unitPrice);
      disc += (it.discount || 0);
      tax += (it.tax || 0);
    });
    const sc = Math.round(sub * (state.settings.serviceChargePercent / 100));
    folio.subtotal = sub;
    folio.discountTotal = disc;
    folio.serviceChargeTotal = sc;
    folio.taxTotal = tax;
    folio.grandTotal = (sub - disc) + sc + tax;
    folio.balance = folio.grandTotal - folio.paidTotal;
  },

  // -------------------------------------------------------------
  // RESTAURANT / BAR / IN-ROOM DINING POS & BILLING
  // -------------------------------------------------------------
  createRestaurantOrder(params: {
    stayId?: string;
    roomNumber?: string;
    tableNumber?: string;
    guestName?: string;
    folioId?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    subtotal?: number;
    tax?: number;
    total?: number;
    orderType?: 'room-dining' | 'restaurant-table' | 'bar-lounge' | 'counter-takeaway' | 'in-room-dining';
    inRoomDiningDetails?: {
      deliveryTime?: string;
      trayCharge?: number;
      trayChargeIncluded?: boolean;
      scheduledDeliveryTime?: string;
      kitchenNotes?: string;
      specialNotes?: string;
    };
    postToFolio?: boolean;
    items: { menuItemId?: string; name?: string; quantity: number; unitPrice?: number; totalPrice?: number }[];
    notes?: string;
  }): RestaurantOrder {
    const orderItems = params.items.map(it => {
      const item = it.menuItemId ? state.menuItems.find(m => m.id === it.menuItemId) : undefined;
      const unitPrice = it.unitPrice || item?.price || 0;
      const name = it.name || item?.name || 'Menu Item';
      return {
        menuItemId: it.menuItemId || (item ? item.id : `mi-${Date.now()}`),
        name,
        quantity: it.quantity,
        unitPrice,
        total: it.totalPrice || (unitPrice * it.quantity)
      };
    });

    let subtotal = params.subtotal || orderItems.reduce((acc, curr) => acc + curr.total, 0);
    if ((params.orderType === 'room-dining' || params.orderType === 'in-room-dining') && params.inRoomDiningDetails?.trayCharge) {
      subtotal += params.inRoomDiningDetails.trayCharge;
    }

    const sc = Math.round(subtotal * (state.settings.serviceChargePercent / 100));
    const tax = Math.round(subtotal * (state.settings.taxRatePercent / 100));
    const total = params.total || (subtotal + sc + tax);
    const prefix = params.orderType === 'bar-lounge' ? 'BAR' : (params.orderType === 'room-dining' || params.orderType === 'in-room-dining') ? 'IRD' : 'POS';
    const orderNumber = `${prefix}-2026-${String(state.restaurantOrders.length + 101).padStart(4, '0')}`;

    let folioId: string | undefined = params.folioId;
    const shouldPostToFolio = params.postToFolio ?? (params.paymentStatus === 'Billed-To-Room' || !!params.stayId);

    if (shouldPostToFolio && params.stayId) {
      const stay = state.stays.find(s => s.id === params.stayId);
      if (stay) {
        if (stay.stopPost) {
          throw new Error(`Cannot bill to Room ${stay.roomNumber}: STOP POST restriction is active (${stay.stopPostReason || 'Outlet charges restricted by Front Office'}). Please collect Direct Settlement (Cash, Card, or Mobile Pay).`);
        }
        folioId = stay.folioId;
        const itemSummary = orderItems.map(i => `${i.name} (x${i.quantity})`).join(', ');
        const chargeType: FolioItem['type'] = (params.orderType === 'room-dining' || params.orderType === 'in-room-dining') ? 'Room Service' : 'Restaurant';
        const typeLabel = (params.orderType === 'room-dining' || params.orderType === 'in-room-dining') ? 'In-Room Dining' : params.orderType === 'bar-lounge' ? 'Bar & Lounge' : 'Restaurant Dining';
        
        this.postFolioCharge(stay.folioId, {
          type: chargeType,
          description: `${typeLabel} [${orderNumber}]: ${itemSummary}${params.inRoomDiningDetails?.trayCharge ? ` (+৳${params.inRoomDiningDetails.trayCharge} Tray Service)` : ''}`,
          quantity: 1,
          unitPrice: subtotal,
          applyTax: true,
          reference: orderNumber
        });
      }
    }

    const normalizedOrderType: RestaurantOrder['orderType'] = params.orderType === 'in-room-dining' ? 'room-dining' : (params.orderType || (params.roomNumber ? 'room-dining' : params.tableNumber ? 'restaurant-table' : 'counter-takeaway'));

    const newOrder: RestaurantOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      stayId: params.stayId,
      roomNumber: params.roomNumber,
      guestName: params.guestName,
      tableNumber: params.tableNumber,
      orderType: normalizedOrderType,
      inRoomDiningDetails: params.inRoomDiningDetails,
      status: shouldPostToFolio ? 'Posted to Folio' : 'Served',
      items: orderItems,
      subtotal,
      serviceCharge: sc,
      tax,
      total,
      folioId,
      createdBy: state.currentUser.name,
      createdAt: new Date().toISOString()
    };

    state.restaurantOrders.unshift(newOrder);
    
    // Automatically trigger recipe ingredient stock consumption, stock ledger, and GL cost posting
    try {
      inventoryMenuService.consumeIngredientsForRestaurantOrder(newOrder);
    } catch (err) {
      console.warn('Auto stock consumption notice:', err);
    }

    this.logAudit('Created Restaurant Order', 'Order', newOrder.id, undefined, `${orderNumber} (৳${total}) - ${newOrder.orderType} for ${params.guestName || params.roomNumber || params.tableNumber || 'Walk-in'}`);
    this.addAlert('info', `POS Order ${orderNumber}`, `${newOrder.orderType.toUpperCase()} order created for ৳${total}. ${params.postToFolio ? 'Billed to Room ' + params.roomNumber : 'Paid at counter'}.`, 'View POS', 'restaurant');
    notify();
    return newOrder;
  },

  // -------------------------------------------------------------
  // HOUSEKEEPING & MAINTENANCE
  // -------------------------------------------------------------
  updateHousekeepingStatus(roomId: string, status: HousekeepingStatus, notes?: string) {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Room not found');

    const oldStatus = room.housekeepingStatus;
    room.housekeepingStatus = status;

    if (status === 'Clean' || status === 'Inspected') {
      if (room.operationalStatus === 'Dirty' || room.operationalStatus === 'Cleaning') {
        room.operationalStatus = status === 'Inspected' ? 'Inspected' : 'Available';
      }
    } else if (status === 'Dirty') {
      if (room.operationalStatus === 'Available' || room.operationalStatus === 'Inspected') {
        room.operationalStatus = 'Dirty';
      }
    } else if (status === 'Cleaning') {
      if (room.operationalStatus !== 'Occupied') {
        room.operationalStatus = 'Cleaning';
      }
    }

    this.logAudit('Changed Housekeeping Status', 'Housekeeping', room.id, oldStatus, `Room ${room.roomNumber} is now ${status}`);
    if (status === 'Clean' || status === 'Inspected') {
      this.addAlert('success', `Room ${room.roomNumber} Ready`, `Housekeeping completed for Room ${room.roomNumber}. Status: ${status}`, 'View Room Rack', 'rooms');
    }
    notify();
  },

  completeHousekeepingTask(taskId: string) {
    const task = state.housekeepingTasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    task.status = 'Completed';
    task.completedAt = new Date().toISOString();
    task.checklist = {
      bedLinenChanged: true,
      bathroomSanitized: true,
      towelsReplaced: true,
      amenitiesRestocked: true,
      floorCleaned: true,
      minibarChecked: true
    };

    this.updateHousekeepingStatus(task.roomId, 'Clean');
    notify();
  },

  createMaintenanceTicket(ticketData: {
    roomId: string;
    title: string;
    description: string;
    priority: MaintenanceTicket['priority'];
    assignedTo?: string;
    marksOutOfOrder: boolean;
  }): MaintenanceTicket {
    const room = state.rooms.find(r => r.id === ticketData.roomId);
    if (!room) throw new Error('Room not found');

    const ticketNumber = `MNT-2026-00${state.maintenanceTickets.length + 46}`;
    const newTicket: MaintenanceTicket = {
      id: `mt-${Date.now()}`,
      ticketNumber,
      roomId: room.id,
      roomNumber: room.roomNumber,
      title: ticketData.title,
      description: ticketData.description,
      priority: ticketData.priority,
      assignedTo: ticketData.assignedTo || 'Facility Team',
      status: 'Open',
      cost: 0,
      marksOutOfOrder: ticketData.marksOutOfOrder,
      createdAt: new Date().toISOString()
    };

    state.maintenanceTickets.unshift(newTicket);

    if (ticketData.marksOutOfOrder) {
      room.operationalStatus = 'Out of Order';
      this.addAlert('urgent', `Room ${room.roomNumber} Out of Order`, `Critical ticket ${ticketNumber}: ${ticketData.title}. Room removed from inventory.`, 'Maintenance Desk', 'maintenance');
    }

    this.logAudit('Created Maintenance Ticket', 'Maintenance', newTicket.id, undefined, `${ticketNumber} for Room ${room.roomNumber} (${ticketData.title})`);
    notify();
    return newTicket;
  },

  resolveMaintenanceTicket(ticketId: string, cost?: number, resolutionNotes?: string) {
    const ticket = state.maintenanceTickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error('Ticket not found');

    ticket.status = 'Completed';
    ticket.completedAt = new Date().toISOString();
    if (cost !== undefined) ticket.cost = cost;
    if (resolutionNotes) ticket.notes = resolutionNotes;

    if (ticket.marksOutOfOrder) {
      const room = state.rooms.find(r => r.id === ticket.roomId);
      if (room && room.operationalStatus === 'Out of Order') {
        room.operationalStatus = 'Dirty';
        room.housekeepingStatus = 'Dirty';
        // Dispatch housekeeping inspection
        state.housekeepingTasks.unshift({
          id: `hk-${Date.now()}`,
          roomId: room.id,
          roomNumber: room.roomNumber,
          roomTypeName: room.roomTypeName || 'Room',
          taskType: 'Inspection',
          priority: 'High',
          status: 'Pending',
          checklist: { bedLinenChanged: true, bathroomSanitized: true, towelsReplaced: true, amenitiesRestocked: true, floorCleaned: true, minibarChecked: true },
          notes: `Post-maintenance cleaning and inspection after ticket ${ticket.ticketNumber}`,
          createdAt: new Date().toISOString()
        });
        this.addAlert('info', `Maintenance Resolved (Room ${room.roomNumber})`, `Ticket ${ticket.ticketNumber} completed. Room queued for HK inspection.`, 'Housekeeping', 'housekeeping');
      }
    }

    this.logAudit('Resolved Maintenance Ticket', 'Maintenance', ticket.id, 'In Progress', `Completed ticket ${ticket.ticketNumber}`);
    notify();
  },

  // -------------------------------------------------------------
  // CONVENTION HALLS & EVENT BOOKINGS
  // -------------------------------------------------------------
  createEventBooking(eventData: {
    clientId?: string;
    clientName: string;
    clientCompany?: string;
    clientPhone: string;
    clientEmail?: string;
    hallId: string;
    eventName: string;
    eventType: EventBooking['eventType'];
    eventDate: string;
    startTime: string;
    endTime: string;
    guestCount: number;
    packageId?: string;
    depositAmount?: number;
    paymentMethod?: Payment['method'];
    notes?: string;
    items: { itemType: EventBooking['items'][0]['itemType']; description: string; quantity: number; unitPrice: number }[];
  }): EventBooking {
    const hall = state.halls.find(h => h.id === eventData.hallId);
    if (!hall) throw new Error('Convention hall not found');

    // Check hall collision on same date & overlapping time
    const collision = state.eventBookings.find(e => {
      if (e.hallId !== hall.id) return false;
      if (e.eventDate !== eventData.eventDate) return false;
      if (e.status === 'Cancelled') return false;

      return (eventData.startTime < e.endTime && eventData.endTime > e.startTime);
    });

    if (collision) {
      throw new Error(`Hall ${hall.name} is already booked on ${eventData.eventDate} by ${collision.clientName} (${collision.startTime} - ${collision.endTime})`);
    }

    let clientId = eventData.clientId;
    if (!clientId) {
      const newClient: EventClient = {
        id: `ec-${Date.now()}`,
        name: eventData.clientName,
        company: eventData.clientCompany,
        phone: eventData.clientPhone,
        email: eventData.clientEmail || '',
        address: 'Dhaka, Bangladesh',
        notes: 'Created via Event Booking',
        createdAt: new Date().toISOString()
      };
      state.eventClients.unshift(newClient);
      clientId = newClient.id;
    }

    const items = eventData.items.map(it => ({
      id: `ei-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemType: it.itemType,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.quantity * it.unitPrice
    }));

    const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);
    const sc = Math.round(subtotal * (state.settings.serviceChargePercent / 100));
    const tax = Math.round(subtotal * (state.settings.taxRatePercent / 100));
    const total = subtotal + sc + tax;
    const deposit = eventData.depositAmount || 0;
    const balance = total - deposit;
    const eventNumber = `EVT-2026-00${state.eventBookings.length + 91}`;

    const pkg = eventData.packageId ? state.packages.find(p => p.id === eventData.packageId) : undefined;

    const newBooking: EventBooking = {
      id: `evt-${Date.now()}`,
      eventNumber,
      clientId,
      clientName: eventData.clientName,
      clientCompany: eventData.clientCompany,
      clientPhone: eventData.clientPhone,
      hallId: hall.id,
      hallName: hall.name,
      eventName: eventData.eventName,
      eventType: eventData.eventType,
      eventDate: eventData.eventDate,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      guestCount: eventData.guestCount,
      packageId: eventData.packageId,
      packageName: pkg?.name,
      status: 'Confirmed',
      items,
      subtotal,
      discount: 0,
      serviceCharge: sc,
      tax,
      total,
      deposit,
      balance,
      notes: eventData.notes,
      createdAt: new Date().toISOString()
    };

    state.eventBookings.unshift(newBooking);

    if (deposit > 0 && eventData.paymentMethod) {
      const txnNumber = `TXN-2026-09${state.payments.length + 10}`;
      state.payments.unshift({
        id: `pay-${Date.now()}`,
        transactionNumber: txnNumber,
        eventBookingId: newBooking.id,
        amount: deposit,
        method: eventData.paymentMethod,
        reference: `Event Booking Advance for ${eventNumber}`,
        status: 'Completed',
        notes: `Advance for ${newBooking.eventName}`,
        createdBy: state.currentUser.name,
        createdAt: new Date().toISOString()
      });
    }

    this.logAudit('Created Event Booking', 'Event', newBooking.id, undefined, `${eventNumber}: ${newBooking.eventName} in ${hall.name}`);
    this.addAlert('info', `New Event Booked: ${hall.name}`, `${newBooking.eventName} (${newBooking.guestCount} guests) on ${eventData.eventDate}`, 'Event Calendar', 'convention');

    notify();
    return newBooking;
  },

  recordEventPayment(eventId: string, paymentData: {
    amount: number;
    method: Payment['method'];
    reference: string;
  }): Payment {
    const event = state.eventBookings.find(e => e.id === eventId);
    if (!event) throw new Error('Event booking not found');

    const txnNumber = `TXN-2026-09${state.payments.length + 10}`;
    const payment: Payment = {
      id: `pay-${Date.now()}`,
      transactionNumber: txnNumber,
      eventBookingId: eventId,
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference,
      status: 'Completed',
      notes: `Event payment for ${event.eventNumber}`,
      createdBy: state.currentUser.name,
      createdAt: new Date().toISOString()
    };

    state.payments.unshift(payment);
    event.deposit += paymentData.amount;
    event.balance = event.total - event.deposit;

    this.logAudit('Received Event Payment', 'Payment', payment.id, undefined, `৳${payment.amount} for Event ${event.eventNumber}`);
    notify();
    return payment;
  },

  // -------------------------------------------------------------
  // GLOBAL SEARCH (Unified Enterprise Search Engine)
  // -------------------------------------------------------------
  searchGlobal(query: string): {
    guests: Guest[];
    reservations: Reservation[];
    rooms: Room[];
    invoices: Invoice[];
    events: EventBooking[];
    folios: Folio[];
  } {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { guests: [], reservations: [], rooms: [], invoices: [], events: [], folios: [] };
    }

    const guests = state.guests.filter(g =>
      g.fullName.toLowerCase().includes(q) ||
      g.phone.includes(q) ||
      g.guestCode.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.idNumber.toLowerCase().includes(q)
    );

    const reservations = state.reservations.filter(r =>
      r.reservationNumber.toLowerCase().includes(q) ||
      r.guestName.toLowerCase().includes(q) ||
      r.guestPhone.includes(q) ||
      (r.assignedRoomNumber && r.assignedRoomNumber.includes(q))
    );

    const rooms = state.rooms.filter(r =>
      r.roomNumber.includes(q) ||
      (r.roomTypeName && r.roomTypeName.toLowerCase().includes(q))
    );

    const invoices = state.invoices.filter(inv =>
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.guestOrClientName.toLowerCase().includes(q) ||
      inv.roomOrHall.toLowerCase().includes(q)
    );

    const events = state.eventBookings.filter(e =>
      e.eventNumber.toLowerCase().includes(q) ||
      e.eventName.toLowerCase().includes(q) ||
      e.clientName.toLowerCase().includes(q) ||
      e.hallName.toLowerCase().includes(q)
    );

    const folios = state.folios.filter(f =>
      f.folioNumber.toLowerCase().includes(q) ||
      f.guestName.toLowerCase().includes(q) ||
      f.roomNumber.includes(q)
    );

    return { guests, reservations, rooms, invoices, events, folios };
  },

  // -------------------------------------------------------------
  // OPERATIONAL & MANAGEMENT KPIS
  // -------------------------------------------------------------
  getOperationalKPIs() {
    const totalRooms = state.rooms.filter(r => r.active).length;
    const occupiedRooms = state.rooms.filter(r => r.active && r.operationalStatus === 'Occupied').length;
    const reservedRooms = state.rooms.filter(r => r.active && r.operationalStatus === 'Reserved').length;
    const availableRooms = state.rooms.filter(r => r.active && (r.operationalStatus === 'Available' || r.operationalStatus === 'Inspected')).length;
    const dirtyRooms = state.rooms.filter(r => r.active && (r.operationalStatus === 'Dirty' || r.operationalStatus === 'Cleaning')).length;
    const oooRooms = state.rooms.filter(r => r.active && r.operationalStatus === 'Out of Order').length;

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayArrivals = state.reservations.filter(r => r.arrivalDate === todayStr && r.status !== 'Cancelled');
    const todayDepartures = state.stays.filter(s => s.expectedCheckOutAt.startsWith(todayStr) && s.status === 'Active');
    const inHouseGuests = state.stays.filter(s => s.status === 'Active').length;

    // Financial revenue calculations from payments and folios
    const totalPayments = state.payments.reduce((acc, p) => acc + p.amount, 0);
    const roomRevenue = state.folios.reduce((acc, f) => {
      const roomCharges = f.items.filter(i => i.type === 'Room Charge').reduce((sum, item) => sum + item.total, 0);
      return acc + roomCharges;
    }, 0);

    const restaurantRevenue = state.folios.reduce((acc, f) => {
      const dining = f.items.filter(i => i.type === 'Restaurant' || i.type === 'Room Service').reduce((sum, item) => sum + item.total, 0);
      return acc + dining;
    }, 0);

    const eventRevenue = state.eventBookings.reduce((acc, e) => acc + e.deposit, 0);

    const outstandingBalance = state.folios.filter(f => f.status === 'Open').reduce((acc, f) => acc + Math.max(0, f.balance), 0) +
      state.eventBookings.filter(e => e.status !== 'Cancelled').reduce((acc, e) => acc + Math.max(0, e.balance), 0);

    // Hotel metrics: ADR & RevPAR
    const adr = occupiedRooms > 0 ? Math.round(roomRevenue / Math.max(1, occupiedRooms)) : 0;
    const revpar = totalRooms > 0 ? Math.round(roomRevenue / totalRooms) : 0;

    const todayEvents = state.eventBookings.filter(e => e.eventDate === todayStr && e.status !== 'Cancelled');

    return {
      totalRooms,
      occupiedRooms,
      reservedRooms,
      availableRooms,
      dirtyRooms,
      oooRooms,
      occupancyRate,
      todayArrivalsCount: todayArrivals.length,
      todayDeparturesCount: todayDepartures.length,
      inHouseGuests,
      todayRevenue: totalPayments,
      roomRevenue,
      restaurantRevenue,
      eventRevenue,
      outstandingBalance,
      adr,
      revpar,
      todayEventsCount: todayEvents.length
    };
  },

  // -------------------------------------------------------------
  // EXPORT TO EXCEL / CSV (.xlsx)
  // -------------------------------------------------------------
  exportTableToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1') {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  // -------------------------------------------------------------
  // ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSION ENGINE
  // -------------------------------------------------------------
  hasPermission(permission: PermissionKey, user?: User): boolean {
    const targetUser = user || state.currentUser;
    if (!targetUser) return false;
    // Super Admin & General Manager always have full access
    if (targetUser.role === 'Super Admin' || targetUser.role === 'General Manager') {
      return true;
    }
    const rolePerm = state.rolePermissions.find(rp => rp.roleName === targetUser.role);
    if (!rolePerm) return false;
    return rolePerm.permissions.includes('*') || rolePerm.permissions.includes(permission);
  },

  updateRolePermissions(roleName: UserRoleName, permissions: string[]): { success: boolean; message: string } {
    if (!this.hasPermission('can_manage_roles')) {
      throw new Error('Permission denied: You do not have permission to manage roles.');
    }
    let rolePerm = state.rolePermissions.find(rp => rp.roleName === roleName);
    if (rolePerm) {
      rolePerm.permissions = permissions;
    } else {
      state.rolePermissions.push({
        id: `rp-${Date.now()}`,
        roleName,
        permissions
      });
    }
    this.logAudit('Updated Role Permissions', 'User', state.currentUser.id, undefined, `Updated permissions for role: ${roleName}`);
    notify();
    return { success: true, message: `Permissions for ${roleName} updated successfully.` };
  },

  addUser(userData: {
    name: string;
    email: string;
    role: UserRoleName;
    phone?: string;
    active: boolean;
  }): { success: boolean; user: User; message: string } {
    if (!this.hasPermission('can_manage_users')) {
      throw new Error('Permission denied: You do not have permission to add users.');
    }
    const exists = state.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      throw new Error(`A user with email ${userData.email} already exists.`);
    }
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      phone: userData.phone || '',
      active: userData.active,
      createdAt: new Date().toISOString()
    };
    state.users.push(newUser);
    this.logAudit('Added Staff User', 'User', newUser.id, undefined, `Created user ${newUser.name} (${newUser.role})`);
    notify();
    return { success: true, user: newUser, message: `User ${newUser.name} created successfully.` };
  },

  updateUser(userId: string, updates: Partial<User>): { success: boolean; message: string } {
    if (!this.hasPermission('can_manage_users')) {
      throw new Error('Permission denied: You do not have permission to modify users.');
    }
    const user = state.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');
    Object.assign(user, updates);
    this.logAudit('Modified Staff User', 'User', user.id, undefined, `Updated profile/role for ${user.name}`);
    notify();
    return { success: true, message: `User ${user.name} updated successfully.` };
  },

  deleteUser(userId: string): { success: boolean; message: string } {
    if (!this.hasPermission('can_manage_users')) {
      throw new Error('Permission denied: You do not have permission to delete users.');
    }
    if (userId === state.currentUser.id) {
      throw new Error('You cannot delete your own active account.');
    }
    const user = state.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');
    state.users = state.users.filter(u => u.id !== userId);
    this.logAudit('Deleted Staff User', 'User', userId, undefined, `Deleted user ${user.name} (${user.role})`);
    notify();
    return { success: true, message: `User ${user.name} removed successfully.` };
  },

  // -------------------------------------------------------------
  // VOIDING SYSTEM (Orders, Folio Charges, Payments, Reservations)
  // -------------------------------------------------------------
  voidRestaurantOrder(orderId: string, voidReason: string): { success: boolean; message: string } {
    if (!this.hasPermission('can_void_bills')) {
      throw new Error('Permission Denied: User role does not have authorization to void bills.');
    }
    const order = state.restaurantOrders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found.');
    if (order.voided) throw new Error('Order is already voided.');

    order.voided = true;
    order.voidReason = voidReason;
    order.voidedAt = new Date().toISOString();
    order.voidedBy = state.currentUser.name;
    order.status = 'Voided';

    // If order was billed to a folio, void the corresponding folio line item as well
    if (order.folioId) {
      const folio = state.folios.find(f => f.id === order.folioId);
      if (folio) {
        const item = folio.items.find(i => i.reference === order.orderNumber);
        if (item) {
          item.voided = true;
          item.voidReason = `Order Voided: ${voidReason}`;
          item.voidedAt = new Date().toISOString();
          item.voidedBy = state.currentUser.name;
          this.recalculateFolio(folio);
        }
      }
    }

    this.logAudit('Voided Restaurant Bill', 'Order', order.id, 'Active', `Voided ${order.orderNumber} (৳${order.total}). Reason: ${voidReason}`);
    this.addAlert('warning', `Order Voided: ${order.orderNumber}`, `${order.orderNumber} was voided by ${state.currentUser.name}. Reason: ${voidReason}`, 'View POS', 'restaurant');
    notify();
    return { success: true, message: `Order ${order.orderNumber} has been successfully voided.` };
  },

  voidFolioItem(folioId: string, itemId: string, voidReason: string): { success: boolean; message: string } {
    if (!this.hasPermission('can_void_bills')) {
      throw new Error('Permission Denied: User role does not have authorization to void guest bill items.');
    }
    const folio = state.folios.find(f => f.id === folioId);
    if (!folio) throw new Error('Folio not found.');

    const item = folio.items.find(i => i.id === itemId);
    if (!item) throw new Error('Bill item not found.');
    if (item.voided) throw new Error('Item is already voided.');

    item.voided = true;
    item.voidReason = voidReason;
    item.voidedAt = new Date().toISOString();
    item.voidedBy = state.currentUser.name;

    // Recalculate the folio grand total and balance
    this.recalculateFolio(folio);

    this.logAudit('Voided Bill Item', 'Folio', folio.id, undefined, `Voided "${item.description}" (৳${item.total}) on Folio ${folio.folioNumber}. Reason: ${voidReason}`);
    this.addAlert('warning', `Bill Item Voided: Folio ${folio.folioNumber}`, `Charge of ৳${item.total} voided by ${state.currentUser.name}.`, 'View Folio', 'billing');
    notify();
    return { success: true, message: `Charge line "${item.description}" voided and folio rebalanced.` };
  },

  voidPayment(paymentId: string, voidReason: string): { success: boolean; message: string } {
    if (!this.hasPermission('can_void_payments')) {
      throw new Error('Permission Denied: User role does not have authorization to void payments.');
    }
    const payment = state.payments.find(p => p.id === paymentId);
    if (!payment) throw new Error('Payment transaction not found.');
    if (payment.voided) throw new Error('Payment is already voided.');

    payment.voided = true;
    payment.voidReason = voidReason;
    payment.voidedAt = new Date().toISOString();
    payment.voidedBy = state.currentUser.name;
    payment.status = 'Void';

    // Reverse from Folio if linked
    if (payment.folioId) {
      const folio = state.folios.find(f => f.id === payment.folioId);
      if (folio) {
        folio.paidTotal -= payment.amount;
        folio.balance = folio.grandTotal - folio.paidTotal;
        if (folio.status === 'Settled' && folio.balance > 0) {
          folio.status = 'Open';
        }
      }
    }

    // Reverse from Reservation if linked
    if (payment.reservationId) {
      const res = state.reservations.find(r => r.id === payment.reservationId);
      if (res) {
        res.paidAmount = Math.max(0, res.paidAmount - payment.amount);
      }
    }

    this.logAudit('Voided Payment Transaction', 'Payment', payment.id, 'Completed', `Voided payment ${payment.transactionNumber} of ৳${payment.amount}. Reason: ${voidReason}`);
    this.addAlert('warning', `Payment Voided: ${payment.transactionNumber}`, `৳${payment.amount} reversed by ${state.currentUser.name}. Reason: ${voidReason}`, 'View Payments', 'billing');
    notify();
    return { success: true, message: `Payment ${payment.transactionNumber} voided and balances updated.` };
  },

  // -------------------------------------------------------------
  // RESERVATION MODIFY & DELETE (WITH PERMISSION CHECKS)
  // -------------------------------------------------------------
  updateReservation(reservationId: string, updates: Partial<Reservation>): { success: boolean; message: string } {
    if (!this.hasPermission('can_modify_reservations')) {
      throw new Error('Permission Denied: User role does not have authorization to modify reservations.');
    }
    const res = state.reservations.find(r => r.id === reservationId);
    if (!res) throw new Error('Reservation not found.');

    const oldStatus = res.status;
    Object.assign(res, updates, { updatedAt: new Date().toISOString() });

    // Recalculate estimated total if arrival/departure/rate changed
    if (updates.arrivalDate || updates.departureDate || updates.rate) {
      const d1 = new Date(res.arrivalDate);
      const d2 = new Date(res.departureDate);
      const nights = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
      const base = nights * res.rate;
      const sc = Math.round(base * (state.settings.serviceChargePercent / 100));
      const tax = Math.round(base * (state.settings.taxRatePercent / 100));
      res.totalEstimatedAmount = base + sc + tax;
    }

    this.logAudit('Modified Reservation', 'Reservation', res.id, oldStatus, `Updated reservation details for ${res.guestName} (${res.reservationNumber})`);
    notify();
    return { success: true, message: `Reservation ${res.reservationNumber} modified successfully.` };
  },

  deleteReservation(reservationId: string, reason: string): { success: boolean; message: string } {
    if (!this.hasPermission('can_delete_reservations')) {
      throw new Error('Permission Denied: User role does not have authorization to delete reservations.');
    }
    const res = state.reservations.find(r => r.id === reservationId);
    if (!res) throw new Error('Reservation not found.');
    if (res.status === 'Checked-In') {
      throw new Error('Cannot delete a reservation that is currently Checked-In. Please check out the guest first.');
    }

    // Release assigned room if reserved
    if (res.assignedRoomId) {
      const room = state.rooms.find(r => r.id === res.assignedRoomId);
      if (room && room.operationalStatus === 'Reserved') {
        room.operationalStatus = 'Available';
      }
    }

    res.status = 'Cancelled';
    res.specialRequests = (res.specialRequests ? res.specialRequests + ' | ' : '') + `[DELETED/CANCELLED by ${state.currentUser.name}: ${reason}]`;
    res.updatedAt = new Date().toISOString();

    this.logAudit('Deleted/Cancelled Reservation', 'Reservation', res.id, 'Active', `Reservation ${res.reservationNumber} cancelled. Reason: ${reason}`);
    this.addAlert('info', `Reservation Cancelled: ${res.reservationNumber}`, `${res.reservationNumber} (${res.guestName}) cancelled by ${state.currentUser.name}.`, 'View Reservations', 'reservations');
    notify();
    return { success: true, message: `Reservation ${res.reservationNumber} has been removed/cancelled.` };
  },

  // -------------------------------------------------------------
  // ADMINISTRATION: ROOMS CRUD (ADD, EDIT, DELETE)
  // -------------------------------------------------------------
  addRoom(roomData: {
    roomNumber: string;
    roomTypeId: string;
    floor: number;
    building?: string;
    wing?: string;
    features?: string[];
    connectingRoom?: string;
    amenities?: string[];
    isSmoking?: boolean;
    keyCardCode?: string;
  }): { success: boolean; room: Room; message: string } {
    if (!this.hasPermission('can_manage_rooms')) {
      throw new Error('Permission Denied: User role does not have authorization to manage rooms.');
    }
    const existing = state.rooms.find(r => r.roomNumber.toLowerCase() === roomData.roomNumber.toLowerCase());
    if (existing) {
      throw new Error(`Room number ${roomData.roomNumber} already exists in the resort inventory.`);
    }
    const roomType = state.roomTypes.find(rt => rt.id === roomData.roomTypeId);
    if (!roomType) throw new Error('Selected room type not found.');

    const newRoom: Room = {
      id: `rm-${Date.now()}`,
      roomNumber: roomData.roomNumber,
      roomTypeId: roomType.id,
      roomTypeName: roomType.name,
      floor: roomData.floor,
      building: roomData.building || 'Main Resort Complex',
      wing: roomData.wing || (roomData.floor === 1 ? 'East Garden Wing' : 'West Lake Wing'),
      operationalStatus: 'Available',
      housekeepingStatus: 'Clean',
      features: roomData.features || ['Wi-Fi', 'Balcony', 'Smart TV', 'Mini Fridge', 'Air Conditioned'],
      connectingRoom: roomData.connectingRoom,
      amenities: roomData.amenities || ['King Bed', 'Rain Shower', 'Safety Deposit Locker', 'Electric Kettle'],
      isSmoking: roomData.isSmoking || false,
      keyCardCode: roomData.keyCardCode || `KC-${roomData.roomNumber}`,
      active: true
    };

    state.rooms.push(newRoom);
    this.logAudit('Created Room', 'Room', newRoom.id, undefined, `Added Room ${newRoom.roomNumber} (${newRoom.roomTypeName}) to floor ${newRoom.floor}`);
    this.addAlert('success', `New Room Added: ${newRoom.roomNumber}`, `Room ${newRoom.roomNumber} (${newRoom.roomTypeName}) has been added to the active inventory.`, 'Room Rack', 'rooms');
    notify();
    return { success: true, room: newRoom, message: `Room ${newRoom.roomNumber} created successfully.` };
  },

  updateRoom(roomId: string, updates: Partial<Room>): { success: boolean; message: string } {
    if (!this.hasPermission('can_manage_rooms')) {
      throw new Error('Permission Denied: User role does not have authorization to modify rooms.');
    }
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Room not found.');

    if (updates.roomNumber && updates.roomNumber !== room.roomNumber) {
      const duplicate = state.rooms.find(r => r.id !== roomId && r.roomNumber.toLowerCase() === updates.roomNumber?.toLowerCase());
      if (duplicate) throw new Error(`Room number ${updates.roomNumber} is already in use.`);
    }

    if (updates.roomTypeId && updates.roomTypeId !== room.roomTypeId) {
      const rt = state.roomTypes.find(t => t.id === updates.roomTypeId);
      if (rt) {
        room.roomTypeId = rt.id;
        room.roomTypeName = rt.name;
      }
    }

    Object.assign(room, updates);
    this.logAudit('Modified Room Details', 'Room', room.id, undefined, `Updated specifications for Room ${room.roomNumber}`);
    notify();
    return { success: true, message: `Room ${room.roomNumber} updated successfully.` };
  },

  deleteRoom(roomId: string): { success: boolean; message: string } {
    if (!this.hasPermission('can_manage_rooms')) {
      throw new Error('Permission Denied: User role does not have authorization to delete rooms.');
    }
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Room not found.');

    // Check if room has an active stay
    const activeStay = state.stays.find(s => s.roomId === roomId && s.status === 'Active');
    if (activeStay) {
      throw new Error(`Cannot delete Room ${room.roomNumber} because guest ${activeStay.guestName} is currently in-house.`);
    }

    // Check future reservations
    const upcomingRes = state.reservations.find(r => r.assignedRoomId === roomId && r.status === 'Confirmed');
    if (upcomingRes) {
      throw new Error(`Cannot delete Room ${room.roomNumber} because it is assigned to upcoming reservation ${upcomingRes.reservationNumber}. Reassign reservation first.`);
    }

    state.rooms = state.rooms.filter(r => r.id !== roomId);
    this.logAudit('Deleted Room', 'Room', roomId, undefined, `Removed Room ${room.roomNumber} (${room.roomTypeName}) from resort database`);
    this.addAlert('info', `Room Deleted: ${room.roomNumber}`, `Room ${room.roomNumber} was removed from the property inventory.`, 'Room Rack', 'rooms');
    notify();
    return { success: true, message: `Room ${room.roomNumber} has been removed from inventory.` };
  },

  // -------------------------------------------------------------
  // ADMINISTRATION: CONVENTION HALLS, BANQUET & MEETING ROOMS CRUD
  // -------------------------------------------------------------
  addHall(hallData: {
    name: string;
    code: string;
    venueType?: 'Convention Hall' | 'Banquet Hall' | 'Meeting Room' | 'Boardroom' | 'Open Lawn / Amphitheatre';
    floor?: string;
    description: string;
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
  }): { success: boolean; hall: Hall; message: string } {
    if (!this.hasPermission('can_manage_halls')) {
      throw new Error('Permission Denied: User role does not have authorization to manage venues/halls.');
    }
    const existing = state.halls.find(h => h.code.toLowerCase() === hallData.code.toLowerCase() || h.name.toLowerCase() === hallData.name.toLowerCase());
    if (existing) {
      throw new Error(`A venue with code "${hallData.code}" or name "${hallData.name}" already exists.`);
    }

    const newHall: Hall = {
      id: `hl-${Date.now()}`,
      name: hallData.name,
      code: hallData.code.toUpperCase(),
      venueType: hallData.venueType || 'Banquet Hall',
      floor: hallData.floor || 'Ground Floor',
      description: hallData.description,
      capacity: hallData.capacity,
      seatingTheater: hallData.seatingTheater,
      seatingBanquet: hallData.seatingBanquet,
      seatingUShape: hallData.seatingUShape,
      seatingClassroom: hallData.seatingClassroom,
      dimensions: hallData.dimensions,
      baseRatePerDay: hallData.baseRatePerDay,
      baseRateHalfDay: hallData.baseRateHalfDay,
      baseRatePerHour: hallData.baseRatePerHour,
      amenities: hallData.amenities,
      active: true
    };

    state.halls.push(newHall);
    this.logAudit('Created Venue Hall', 'Hall', newHall.id, undefined, `Added venue ${newHall.name} (${newHall.code}) with capacity ${newHall.capacity}`);
    this.addAlert('success', `New Venue Created: ${newHall.name}`, `${newHall.venueType} "${newHall.name}" added with day rate ৳${newHall.baseRatePerDay.toLocaleString()}.`, 'View Events', 'events');
    notify();
    return { success: true, hall: newHall, message: `Venue "${newHall.name}" registered successfully.` };
  },

  updateHall(hallId: string, updates: Partial<Hall>): { success: boolean; message: string } {
    if (!this.hasPermission('can_manage_halls')) {
      throw new Error('Permission Denied: User role does not have authorization to modify venues/halls.');
    }
    const hall = state.halls.find(h => h.id === hallId);
    if (!hall) throw new Error('Hall / venue not found.');

    if (updates.code && updates.code !== hall.code) {
      const duplicate = state.halls.find(h => h.id !== hallId && h.code.toLowerCase() === updates.code?.toLowerCase());
      if (duplicate) throw new Error(`Venue code ${updates.code} is already in use.`);
    }

    Object.assign(hall, updates);
    this.logAudit('Modified Venue Details', 'Hall', hall.id, undefined, `Updated specs/rates for ${hall.name} (${hall.code})`);
    notify();
    return { success: true, message: `Venue "${hall.name}" updated successfully.` };
  },

  deleteHall(hallId: string): { success: boolean; message: string } {
    if (!this.hasPermission('can_manage_halls')) {
      throw new Error('Permission Denied: User role does not have authorization to delete venues/halls.');
    }
    const hall = state.halls.find(h => h.id === hallId);
    if (!hall) throw new Error('Venue not found.');

    // Check if any active or confirmed bookings exist for this hall
    const activeBooking = state.eventBookings.find(b => b.hallId === hallId && (b.status === 'Confirmed' || b.status === 'Ongoing'));
    if (activeBooking) {
      throw new Error(`Cannot delete "${hall.name}" because it has confirmed event booking "${activeBooking.eventName}" (${activeBooking.eventDate}).`);
    }

    state.halls = state.halls.filter(h => h.id !== hallId);
    this.logAudit('Deleted Venue Hall', 'Hall', hallId, undefined, `Deleted venue ${hall.name} (${hall.code}) from system`);
    this.addAlert('info', `Venue Deleted: ${hall.name}`, `Venue "${hall.name}" has been removed from convention hall listings.`, 'View Events', 'events');
    notify();
    return { success: true, message: `Venue "${hall.name}" removed successfully.` };
  },

  // -------------------------------------------------------------
  // NIGHT AUDIT ENGINE & AUTO-CLOSE (05:00 AM SCHEDULER)
  // -------------------------------------------------------------
  getNightAuditHistory(): NightAuditRecord[] {
    return state.nightAuditRecords || [];
  },

  updateNightAuditSettings(enabled: boolean, time: string): { success: boolean; message: string } {
    state.settings.autoNightAuditEnabled = enabled;
    state.settings.autoNightAuditTime = time;
    this.logAudit('Updated Night Audit Settings', 'NightAudit', 'settings', undefined, `Auto Audit: ${enabled ? 'Enabled' : 'Disabled'}, Scheduled Time: ${time}`);
    notify();
    return { success: true, message: `Night Audit scheduled for ${time} (${enabled ? 'Auto-Active' : 'Manual only'}).` };
  },

  runNightAudit(manual: boolean = false, notes?: string): { success: boolean; record: NightAuditRecord; message: string } {
    if (!manual && !this.hasPermission('can_run_night_audit')) {
      // Auto triggers skip auth, manual checks permission
    } else if (manual && !this.hasPermission('can_run_night_audit')) {
      throw new Error('Permission Denied: User does not have authorization to execute Night Audit.');
    }

    const currentBizDate = state.settings.currentBusinessDate || '2026-08-31';
    const d = new Date(currentBizDate);
    d.setDate(d.getDate() + 1);
    const nextBizDate = d.toISOString().split('T')[0];

    // 1. Post room charges and taxes for all active in-house stays
    const activeStays = state.stays.filter(s => s.status === 'Active');
    let roomRevenuePosted = 0;
    const postedChargesList: any[] = [];

    activeStays.forEach(stay => {
      const folio = state.folios.find(f => f.id === stay.folioId);
      if (folio) {
        // Check if room charge for this business date was already posted
        const dateDesc = `Room Charge (${currentBizDate}) - Room ${stay.roomNumber}`;
        const alreadyPosted = folio.items.some(i => !i.voided && (i.description.includes(currentBizDate) || i.reference === `NIGHT-AUDIT-${currentBizDate}`));
        
        const room = state.rooms.find(r => r.id === stay.roomId);
        const roomType = room ? state.roomTypes.find(rt => rt.id === room.roomTypeId) : null;
        const rate = stay.rate || (roomType?.baseRate || roomType?.basePrice || 7500);

        const taxRate = state.settings.taxRatePercent / 100;
        const scRate = state.settings.serviceChargePercent / 100;
        const tax = Math.round(rate * taxRate);
        const sc = Math.round(rate * scRate);
        const total = rate + sc + tax;

        if (!alreadyPosted) {
          folio.items.push({
            id: `item-na-${Date.now()}-${stay.id}`,
            folioId: folio.id,
            type: 'Room Charge',
            description: dateDesc,
            quantity: 1,
            unitPrice: rate,
            discount: 0,
            tax,
            total,
            postedBy: manual ? state.currentUser.name : 'System Auto Night Audit (05:00 AM)',
            createdAt: new Date().toISOString(),
            reference: `NIGHT-AUDIT-${currentBizDate}`
          });

          this.recalculateFolio(folio);
          roomRevenuePosted += rate;
        }

        postedChargesList.push({
          stayId: stay.id,
          roomNumber: stay.roomNumber,
          guestName: stay.guestName,
          roomType: roomType?.name || 'Deluxe Room',
          rate,
          tax,
          serviceCharge: sc,
          total,
          postedAt: new Date().toISOString()
        });
      }
    });

    // 2. Compute F&B, banquet, and other revenues posted on this business date
    const fbRevenue = state.restaurantOrders
      .filter(o => !o.voided && o.createdAt.startsWith(currentBizDate))
      .reduce((acc, o) => acc + o.subtotal, 0);

    const banquetRevenue = state.eventBookings
      .filter(e => e.status !== 'Cancelled' && e.eventDate === currentBizDate)
      .reduce((acc, e) => acc + (e.total || e.totalAmount || 0), 0);

    const totalRevenue = roomRevenuePosted + fbRevenue + banquetRevenue;

    // 3. Compute payments collected on this business date
    const totalPayments = state.payments
      .filter(p => !p.voided && p.status === 'Completed' && p.createdAt.startsWith(currentBizDate))
      .reduce((acc, p) => acc + p.amount, 0);

    // 4. Compute guest ledger balance & identify closed/settled folios
    const ledgerBalance = state.folios
      .filter(f => f.status === 'Open')
      .reduce((acc, f) => acc + Math.max(0, f.balance), 0);

    const closedFoliosList = state.folios
      .filter(f => f.status === 'Settled' || f.status === 'Closed' || f.balance === 0)
      .map(f => {
        const folioPayments = state.payments.filter(p => p.folioId === f.id);
        const lastPay = folioPayments.length > 0 ? folioPayments[folioPayments.length - 1] : null;
        return {
          id: f.id,
          folioNumber: f.folioNumber,
          stayId: f.stayId,
          guestName: f.guestName,
          roomNumber: f.roomNumber,
          grandTotal: f.grandTotal,
          paidTotal: f.paidTotal,
          balance: f.balance,
          status: f.status,
          closedAt: f.closedAt || f.openedAt || new Date().toISOString(),
          settlementMethod: lastPay ? lastPay.method : 'Direct Settlement',
          remarks: f.balance === 0 ? 'Zero-balance verified & reconciled' : 'Settled with full cashier collection'
        };
      });

    // Invoices generated
    const generatedInvoicesList = state.invoices
      .filter(inv => inv.issuedAt.startsWith(currentBizDate) || inv.status === 'Paid')
      .map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        folioNumber: inv.folioId,
        guestOrClientName: inv.guestOrClientName,
        roomOrHall: inv.roomOrHall,
        subtotal: inv.subtotal,
        serviceCharge: inv.serviceCharge,
        tax: inv.tax,
        grandTotal: inv.grandTotal,
        status: inv.status,
        issuedAt: inv.issuedAt,
        issuedBy: inv.issuedBy
      }));

    // Triggered System Alerts from Audit Run
    const triggeredAlertsList: any[] = [
      {
        id: `alt-na-run-1-${Date.now()}`,
        type: 'success',
        title: `${manual ? 'Manual' : 'Automated 05:00 AM'} Day-Close Completed`,
        message: `Business date successfully advanced from ${currentBizDate} to ${nextBizDate}. Total day revenue: ৳${totalRevenue.toLocaleString()}.`,
        category: 'Financial / Ledger',
        timestamp: manual ? 'Manual Run' : '05:00 AM'
      }
    ];

    // High balance check
    const highBalanceFolios = state.folios.filter(f => f.status === 'Open' && f.balance > 10000);
    if (highBalanceFolios.length > 0) {
      triggeredAlertsList.push({
        id: `alt-na-run-2-${Date.now()}`,
        type: 'warning',
        title: `High Outstanding Balance Warning (${highBalanceFolios.length} Accounts)`,
        message: `${highBalanceFolios.map(f => `Room ${f.roomNumber} (${f.guestName}: ৳${f.balance.toLocaleString()})`).join(', ')}. Credit threshold check recommended.`,
        category: 'Financial / Ledger',
        timestamp: manual ? 'Manual Run' : '05:00 AM',
        actionRoute: 'billing',
        actionLabel: 'View Folios'
      });
    }

    // Stop-post check
    const stopPostStays = state.stays.filter(s => s.status === 'Active' && s.stopPost);
    if (stopPostStays.length > 0) {
      triggeredAlertsList.push({
        id: `alt-na-run-3-${Date.now()}`,
        type: 'info',
        title: `Stop Post Restrictions Enforced (${stopPostStays.length} Rooms)`,
        message: `Rooms with active Stop Post lock: ${stopPostStays.map(s => `${s.roomNumber} (${s.guestName})`).join(', ')}. Direct outlet charges remained blocked.`,
        category: 'Security / Stop-Post',
        timestamp: manual ? 'Manual Run' : '05:00 AM',
        actionRoute: 'frontdesk',
        actionLabel: 'Front Desk'
      });
    }

    // Housekeeping morning queue alert
    triggeredAlertsList.push({
      id: `alt-na-run-4-${Date.now()}`,
      type: 'urgent',
      title: 'Housekeeping Morning Roster Generated',
      message: `${activeStays.length} occupied rooms flagged for routine morning housekeeping service on ${nextBizDate}.`,
      category: 'Housekeeping',
      timestamp: manual ? 'Manual Run' : '05:00 AM',
      actionRoute: 'housekeeping',
      actionLabel: 'HK Board'
    });

    const totalRooms = state.rooms.filter(r => r.active).length;
    const occupancyPercent = totalRooms > 0 ? Math.round((activeStays.length / totalRooms) * 100) : 0;
    const departuresPending = state.stays.filter(s => s.status === 'Active' && s.expectedCheckOutAt.startsWith(currentBizDate)).length;

    // 5. Generate Night Audit Record
    const auditNumber = `AUD-${currentBizDate.replace(/-/g, '')}-${String((state.nightAuditRecords?.length || 0) + 1).padStart(2, '0')}`;
    const auditRecord: NightAuditRecord = {
      id: `na-${Date.now()}`,
      auditNumber,
      businessDate: currentBizDate,
      nextBusinessDate: nextBizDate,
      closedAt: new Date().toISOString(),
      closedBy: manual ? state.currentUser.name : 'Auto-Scheduler (05:00 AM Close)',
      isAutomatic: !manual,
      totalRoomsOccupied: activeStays.length,
      occupancyPercent,
      roomRevenuePosted,
      fbRevenue,
      banquetRevenue,
      otherRevenue: 0,
      totalRevenue,
      totalPaymentsCollected: totalPayments,
      ledgerBalance,
      inHouseStaysCount: activeStays.length,
      departuresPending,
      notes: notes || (manual ? `Manual night audit executed by ${state.currentUser.name}.` : `Scheduled automated night audit completed at ${state.settings.autoNightAuditTime || '05:00 AM'}.`),
      status: 'Completed',
      closedFolios: closedFoliosList,
      generatedInvoices: generatedInvoicesList,
      triggeredAlerts: triggeredAlertsList,
      postedCharges: postedChargesList
    };

    if (!state.nightAuditRecords) state.nightAuditRecords = [];
    state.nightAuditRecords.unshift(auditRecord);

    // 6. Roll business date
    state.settings.lastNightAuditDate = currentBizDate;
    state.settings.currentBusinessDate = nextBizDate;

    this.logAudit('Night Audit Executed & Day Closed', 'NightAudit', auditRecord.id, currentBizDate, `Business date rolled from ${currentBizDate} to ${nextBizDate}. Total Rev: ৳${totalRevenue.toLocaleString()}`);
    this.addAlert('success', `Night Audit Completed: ${currentBizDate}`, `Business day closed. Active stays: ${activeStays.length}. New business date: ${nextBizDate}.`, 'View Night Audit', 'night-audit');

    notify();
    return {
      success: true,
      record: auditRecord,
      message: `Night audit successfully closed day ${currentBizDate}. Business date rolled to ${nextBizDate}.`
    };
  },

  checkAndTriggerAutoNightAudit() {
    if (!state.settings.autoNightAuditEnabled) return;
    const currentBizDate = state.settings.currentBusinessDate || '2026-08-31';
    const lastAudit = state.settings.lastNightAuditDate;
    if (lastAudit === currentBizDate) return; // Already run for this business date

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const targetTime = state.settings.autoNightAuditTime || '05:00';

    // If current time is past or equal to scheduled auto-close time
    if (currentTimeStr >= targetTime && lastAudit !== currentBizDate) {
      console.log(`[NightAudit] Auto 05:00 AM trigger conditions met. Running Night Audit for ${currentBizDate}...`);
      this.runNightAudit(false, `Automated scheduled trigger executed at ${currentTimeStr}.`);
    }
  },

  // ----------------------------------------------------
  // ACTIVITIES & AMENITIES SERVICES
  // ----------------------------------------------------
  getActivityCharges(): ActivityAmenityCharge[] {
    return state.activityCharges || [];
  },

  createActivityCharge(data: {
    category: 'Activity' | 'Amenity';
    serviceType: ActivityAmenityCharge['serviceType'];
    guestOrCustomerName: string;
    roomNumber?: string;
    stayId?: string;
    folioId?: string;
    quantity: number;
    unitPrice: number;
    paymentType: ActivityAmenityCharge['paymentType'];
    notes?: string;
  }): { success: boolean; charge: ActivityAmenityCharge; message: string } {
    const subtotal = data.quantity * data.unitPrice;
    const taxRate = state.settings.taxRatePercent || 15;
    const tax = Math.round(subtotal * (taxRate / 100));
    const grandTotal = subtotal + tax;

    const chargeNumber = `ACT-${new Date().getFullYear()}-${String((state.activityCharges?.length || 0) + 1).padStart(4, '0')}`;
    const settlementStatus: ActivityAmenityCharge['settlementStatus'] =
      data.paymentType === 'Billed to Room Folio' ? 'Posted to Folio' : 'Settled Direct';

    const newCharge: ActivityAmenityCharge = {
      id: `act-${Date.now()}`,
      chargeNumber,
      category: data.category,
      serviceType: data.serviceType,
      guestOrCustomerName: data.guestOrCustomerName,
      roomNumber: data.roomNumber,
      stayId: data.stayId,
      folioId: data.folioId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      subtotal,
      tax,
      grandTotal,
      paymentType: data.paymentType,
      settlementStatus,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      createdBy: state.currentUser.name
    };

    if (!state.activityCharges) state.activityCharges = [];
    state.activityCharges.unshift(newCharge);

    // If billed to room folio, add as Folio Item
    if (data.paymentType === 'Billed to Room Folio' && data.folioId) {
      const folio = state.folios.find(f => f.id === data.folioId);
      if (folio) {
        const item: FolioItem = {
          id: `fi-${Date.now()}`,
          folioId: folio.id,
          type: data.category === 'Activity' ? 'Amenity' : 'Spa/Wellness',
          description: `${data.serviceType} (x${data.quantity}) - ${data.guestOrCustomerName}`,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          discount: 0,
          tax,
          total: grandTotal,
          postedBy: `${state.currentUser.name} (${data.category})`,
          createdAt: new Date().toISOString()
        };
        folio.items.push(item);
        folio.subtotal += subtotal;
        folio.taxTotal += tax;
        folio.grandTotal += grandTotal;
        folio.balance = folio.grandTotal - folio.paidTotal;
      }
    }

    // Auto-generate double-entry Journal Voucher
    const debitAccountCode = data.paymentType === 'Billed to Room Folio' ? '1100' : '1020';
    const debitAccountName = data.paymentType === 'Billed to Room Folio' ? 'Guest Ledger (In-House Active Receivables)' : 'Front Desk & Outlet Cashier Drawers';
    const creditRevenueCode = data.category === 'Activity' ? '4050' : '4060';
    const creditRevenueName = data.category === 'Activity' ? 'Resort Activities & Sports Facilities' : 'Spa & Wellness Center Revenue';

    this.createJournalVoucher({
      date: state.settings.currentBusinessDate || new Date().toISOString().split('T')[0],
      sourceModule: data.category === 'Activity' ? 'Activities' : 'Amenities',
      sourceReference: chargeNumber,
      narration: `${data.serviceType} (Qty: ${data.quantity}) for ${data.guestOrCustomerName} ${data.roomNumber ? `[Room ${data.roomNumber}]` : ''} - Paid via ${data.paymentType}`,
      entries: [
        { id: `jve-${Date.now()}-1`, accountCode: debitAccountCode, accountName: debitAccountName, debit: grandTotal, credit: 0, memo: `${data.paymentType} charge` },
        { id: `jve-${Date.now()}-2`, accountCode: creditRevenueCode, accountName: creditRevenueName, debit: 0, credit: subtotal, memo: `${data.serviceType} revenue` },
        { id: `jve-${Date.now()}-3`, accountCode: '2100', accountName: 'VAT / Government Tax Payable (15%)', debit: 0, credit: tax, memo: `15% VAT on ${data.serviceType}` }
      ]
    });

    this.logAudit('Activity Charge Created', 'Folio', newCharge.id, chargeNumber, `${data.serviceType} ৳${grandTotal.toLocaleString()} for ${data.guestOrCustomerName}`);
    notify();

    return {
      success: true,
      charge: newCharge,
      message: `Charge ${chargeNumber} of ৳${grandTotal.toLocaleString()} successfully recorded (${data.paymentType}).`
    };
  },

  // ----------------------------------------------------
  // ACCOUNTING, GENERAL LEDGER & CITY LEDGER SERVICES
  // ----------------------------------------------------
  getGLAccounts(): GLAccount[] {
    return state.glAccounts || [];
  },

  createGLAccount(accountData: Omit<GLAccount, 'balance' | 'isSystem'> & { balance?: number; isSystem?: boolean }): { success: boolean; message: string } {
    if (!state.glAccounts) state.glAccounts = [];
    if (state.glAccounts.some(a => a.code === accountData.code)) {
      return { success: false, message: `Account code ${accountData.code} already exists in Chart of Accounts.` };
    }

    const newAcc: GLAccount = {
      code: accountData.code,
      name: accountData.name,
      type: accountData.type,
      category: accountData.category,
      description: accountData.description,
      balance: accountData.balance || 0,
      isSystem: accountData.isSystem || false
    };

    state.glAccounts.push(newAcc);
    state.glAccounts.sort((a, b) => a.code.localeCompare(b.code));
    this.logAudit('GL Account Created', 'SystemSettings', newAcc.code, newAcc.name, `New ${newAcc.type} account added to Chart of Accounts`);
    notify();

    return { success: true, message: `Account ${newAcc.code} - ${newAcc.name} created successfully.` };
  },

  updateGLAccount(code: string, updates: Partial<GLAccount>): { success: boolean; message: string } {
    const acc = state.glAccounts?.find(a => a.code === code);
    if (!acc) return { success: false, message: 'GL Account not found.' };

    Object.assign(acc, updates);
    this.logAudit('GL Account Updated', 'SystemSettings', code, acc.name, `Account parameters updated`);
    notify();
    return { success: true, message: `GL Account ${code} updated.` };
  },

  getJournalVouchers(): JournalVoucher[] {
    return state.journalVouchers || [];
  },

  createJournalVoucher(data: {
    date: string;
    sourceModule: JournalVoucher['sourceModule'];
    sourceReference: string;
    narration: string;
    entries: JournalEntryItem[];
  }): { success: boolean; voucher?: JournalVoucher; message: string } {
    const totalDebit = data.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = data.entries.reduce((sum, e) => sum + (e.credit || 0), 0);

    if (totalDebit !== totalCredit) {
      return {
        success: false,
        message: `Voucher is out of balance! Total Debits (৳${totalDebit.toLocaleString()}) must equal Total Credits (৳${totalCredit.toLocaleString()}). Difference: ৳${Math.abs(totalDebit - totalCredit).toLocaleString()}`
      };
    }

    const voucherNumber = `JV-${new Date().getFullYear()}-${String((state.journalVouchers?.length || 0) + 1).padStart(4, '0')}`;
    const voucher: JournalVoucher = {
      id: `jv-${Date.now()}`,
      voucherNumber,
      date: data.date,
      sourceModule: data.sourceModule,
      sourceReference: data.sourceReference,
      narration: data.narration,
      entries: data.entries,
      totalDebit,
      totalCredit,
      isBalanced: true,
      postedBy: state.currentUser?.name || 'Accounts Engine',
      postedAt: new Date().toISOString()
    };

    if (!state.journalVouchers) state.journalVouchers = [];
    state.journalVouchers.unshift(voucher);

    // Update GL account balances
    data.entries.forEach(entry => {
      const gl = state.glAccounts?.find(a => a.code === entry.accountCode);
      if (gl) {
        // Asset & Expense normal balance: Debit increases (+), Credit decreases (-)
        // Liability, Equity & Revenue normal balance: Credit increases (+), Debit decreases (-)
        if (gl.type === 'Asset' || gl.type === 'Expense') {
          gl.balance += (entry.debit - entry.credit);
        } else {
          gl.balance += (entry.credit - entry.debit);
        }
      }
    });

    this.logAudit('Journal Voucher Posted', 'NightAudit', voucher.id, voucherNumber, `${data.sourceModule}: ${data.narration.substring(0, 50)}... [Debit: ৳${totalDebit.toLocaleString()}]`);
    notify();

    return {
      success: true,
      voucher,
      message: `Journal Voucher ${voucherNumber} (৳${totalDebit.toLocaleString()}) successfully posted to General Ledger.`
    };
  },

  getCityLedgerAccounts(): CityLedgerAccount[] {
    return state.cityLedgerAccounts || [];
  },

  createCityLedgerAccount(data: Omit<CityLedgerAccount, 'id' | 'createdAt' | 'currentBalance' | 'accountNumber'> & { accountNumber?: string }): { success: boolean; account?: CityLedgerAccount; message: string } {
    if (!state.cityLedgerAccounts) state.cityLedgerAccounts = [];
    const accountNumber = data.accountNumber || `CL-${new Date().getFullYear()}-${String(state.cityLedgerAccounts.length + 1).padStart(3, '0')}`;
    
    const account: CityLedgerAccount = {
      id: `cla-${Date.now()}`,
      accountNumber,
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      creditLimit: data.creditLimit,
      currentBalance: 0,
      paymentTerms: data.paymentTerms,
      status: 'Active',
      taxNumber: data.taxNumber,
      address: data.address,
      notes: data.notes,
      createdAt: new Date().toISOString()
    };

    state.cityLedgerAccounts.push(account);
    this.logAudit('City Ledger Account Created', 'Guest', account.id, accountNumber, `Corporate client ${account.companyName} added with Credit Limit ৳${account.creditLimit.toLocaleString()}`);
    notify();

    return { success: true, account, message: `Corporate account ${account.companyName} (${accountNumber}) registered.` };
  },

  updateCityLedgerAccount(id: string, updates: Partial<CityLedgerAccount>): { success: boolean; message: string } {
    const acc = state.cityLedgerAccounts?.find(a => a.id === id);
    if (!acc) return { success: false, message: 'City Ledger Account not found.' };

    Object.assign(acc, updates);
    this.logAudit('City Ledger Account Updated', 'Guest', id, acc.accountNumber, `Corporate credit parameters updated`);
    notify();
    return { success: true, message: `Account ${acc.companyName} updated.` };
  },

  recordCityLedgerPayment(accountId: string, amount: number, method: string, reference: string, notes?: string): { success: boolean; message: string } {
    const acc = state.cityLedgerAccounts?.find(a => a.id === accountId);
    if (!acc) return { success: false, message: 'City Ledger Account not found.' };

    if (amount <= 0) return { success: false, message: 'Payment amount must be greater than zero.' };

    acc.currentBalance = Math.max(0, acc.currentBalance - amount);
    if (acc.currentBalance < acc.creditLimit * 0.9 && acc.status === 'Credit Warning') {
      acc.status = 'Active';
    }

    // Auto-create Journal Voucher
    this.createJournalVoucher({
      date: state.settings.currentBusinessDate || new Date().toISOString().split('T')[0],
      sourceModule: 'Cashier Settlement',
      sourceReference: reference || `CL-PAY-${Date.now()}`,
      narration: `Corporate settlement received from ${acc.companyName} (${acc.accountNumber}) via ${method}. Ref: ${reference}`,
      entries: [
        { id: `jve-${Date.now()}-1`, accountCode: '1010', accountName: 'Cash in Vault & Commercial Bank Accounts', debit: amount, credit: 0, memo: `Receipt from ${acc.companyName}` },
        { id: `jve-${Date.now()}-2`, accountCode: '1150', accountName: 'City Ledger (Corporate Accounts Receivable)', debit: 0, credit: amount, memo: `AR balance reduction` }
      ]
    });

    this.addAlert('success', `City Ledger Payment: ${acc.companyName}`, `Received ৳${amount.toLocaleString()} via ${method}. Outstanding balance: ৳${acc.currentBalance.toLocaleString()}.`, 'Accounting', 'accounting');
    this.logAudit('City Ledger Payment Received', 'Folio', acc.id, acc.accountNumber, `৳${amount.toLocaleString()} received via ${method}`);
    notify();

    return {
      success: true,
      message: `Payment of ৳${amount.toLocaleString()} successfully recorded for ${acc.companyName}. Current balance is ৳${acc.currentBalance.toLocaleString()}.`
    };
  },

  getDepartmentalSyncStatuses(): DepartmentalSyncStatus[] {
    return state.departmentalSyncs || [];
  },

  syncDepartmentToGL(department: string): { success: boolean; message: string } {
    const dept = state.departmentalSyncs?.find(d => d.department === department);
    if (!dept) return { success: false, message: 'Department not found.' };

    dept.syncStatus = 'In Sync';
    dept.unmappedCount = 0;
    dept.syncedCount = dept.totalBills;
    dept.lastSyncTime = new Date().toISOString();

    this.logAudit('Departmental GL Sync', 'NightAudit', department, dept.glAccountMapping.creditAccount, `${department} transactions reconciled to General Ledger`);
    this.addAlert('info', `Department Synchronized: ${department}`, `All operational transactions mapped and reconciled to General Ledger.`, 'Accounting', 'accounting');
    notify();

    return { success: true, message: `${department} successfully synchronized with the General Ledger.` };
  }
};
