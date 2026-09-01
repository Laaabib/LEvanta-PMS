import React, { useState, useEffect } from 'react';
import {
  X, Calendar, User, BedDouble, CreditCard, CheckCircle2,
  AlertCircle, Sparkles, Plus, Search, ShieldCheck
} from 'lucide-react';
import { pmsService } from '../../services/pmsService';
import { Guest, RoomType, Package, PaymentMethod, Reservation } from '../../types/pms';

type BookingSourceType = Reservation['bookingSource'];

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialRoomId?: string;
  initialArrivalDate?: string;
}

export const NewReservationModal: React.FC<NewReservationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRoomId,
  initialArrivalDate
}) => {
  const db = pmsService.getState();

  // Step 1: Guest selection / creation
  const [guestMode, setGuestMode] = useState<'existing' | 'new'>('existing');
  const [guestSearch, setGuestSearch] = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState('');

  // New Guest Fields
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestIdType, setNewGuestIdType] = useState<Guest['idType']>('National ID');
  const [newGuestIdNumber, setNewGuestIdNumber] = useState('');
  const [newGuestVip, setNewGuestVip] = useState(false);

  // Step 2: Stay details
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [arrivalDate, setArrivalDate] = useState(initialArrivalDate || todayStr);
  const [departureDate, setDepartureDate] = useState(tomorrowStr);
  const [roomTypeId, setRoomTypeId] = useState<string>(db.roomTypes[0]?.id || '');
  const [assignedRoomId, setAssignedRoomId] = useState<string>(initialRoomId || '');
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [bookingSource, setBookingSource] = useState<BookingSourceType>('Phone / Direct');
  const [packageId, setPackageId] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Step 3: Deposit & Payment
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [paymentRef, setPaymentRef] = useState<string>('');

  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (initialRoomId) {
        const room = db.rooms.find(r => r.id === initialRoomId);
        if (room) {
          setRoomTypeId(room.roomTypeId);
          setAssignedRoomId(room.id);
        }
      } else {
        setRoomTypeId(db.roomTypes[0]?.id || '');
      }
      if (initialArrivalDate) setArrivalDate(initialArrivalDate);
      if (db.guests.length > 0) setSelectedGuestId(db.guests[0].id);
    }
  }, [isOpen, initialRoomId, initialArrivalDate]);

  if (!isOpen) return null;

  // Nights calculation
  const arr = new Date(arrivalDate);
  const dep = new Date(departureDate);
  const nights = Math.max(1, Math.round((dep.getTime() - arr.getTime()) / (1000 * 60 * 60 * 24)));

  const selectedRoomType = db.roomTypes.find(rt => rt.id === roomTypeId);
  const selectedPkg = packageId ? db.packages.find(p => p.id === packageId) : undefined;
  const ratePerNight = selectedPkg ? selectedPkg.price : (selectedRoomType?.baseRate || 5000);
  const totalEstimated = ratePerNight * nights;

  // Filter available rooms
  const candidateRooms = db.rooms.filter(r => {
    if (r.roomTypeId !== roomTypeId) return false;
    const avail = pmsService.checkRoomAvailability(r.id, arrivalDate, departureDate);
    return avail.isAvailable;
  });

  const filteredGuests = db.guests.filter(g =>
    g.fullName.toLowerCase().includes(guestSearch.toLowerCase()) ||
    g.phone.includes(guestSearch) ||
    g.guestCode.toLowerCase().includes(guestSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let guestIdToUse = selectedGuestId;

    // 1. Create new guest if needed
    if (guestMode === 'new') {
      if (!newGuestName.trim() || !newGuestPhone.trim()) {
        setError('Please enter guest full name and phone number.');
        return;
      }
      try {
        const newGuest = pmsService.createGuest({
          fullName: newGuestName.trim(),
          phone: newGuestPhone.trim(),
          email: newGuestEmail.trim() || `${newGuestPhone.replace(/[^0-9]/g, '')}@guest.cculb.bd`,
          gender: 'Male',
          nationality: 'Bangladeshi',
          city: 'Dhaka',
          country: 'Bangladesh',
          idType: 'National ID (NID)',
          idNumber: newGuestIdNumber.trim() || 'NID-PENDING',
          address: 'Dhaka, Bangladesh',
          vipStatus: newGuestVip,
          notes: 'Registered during new reservation'
        });
        guestIdToUse = newGuest.id;
      } catch (err: any) {
        setError(err.message || 'Could not register new guest');
        return;
      }
    }

    if (!guestIdToUse) {
      setError('Please select or create a guest profile.');
      return;
    }

    if (!roomTypeId) {
      setError('Please select a room type.');
      return;
    }

    try {
      pmsService.createReservation({
        guestId: guestIdToUse,
        roomTypeId,
        assignedRoomId: assignedRoomId || undefined,
        arrivalDate,
        departureDate,
        adults,
        children,
        bookingSource,
        packageId: packageId || undefined,
        specialRequests,
        depositAmount,
        paymentMethod: depositAmount > 0 ? paymentMethod : undefined,
        paymentReference: paymentRef
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create reservation.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs text-slate-200">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Create New Reservation</h3>
              <p className="text-[11px] text-slate-400">Enterprise Room Booking & Inventory Allocation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Guest Profile */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5" />
                <span>1. Guest Profile</span>
              </span>
              <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setGuestMode('existing')}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                    guestMode === 'existing' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Existing Guest
                </button>
                <button
                  type="button"
                  onClick={() => setGuestMode('new')}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                    guestMode === 'new' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  + New Guest
                </button>
              </div>
            </div>

            {guestMode === 'existing' ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={guestSearch}
                      onChange={(e) => setGuestSearch(e.target.value)}
                      placeholder="Filter guest by name, phone or code..."
                      className="w-full bg-slate-900 border border-slate-700 rounded pl-8 pr-2 py-1.5 text-slate-200 placeholder-slate-500"
                    />
                  </div>
                </div>
                <select
                  value={selectedGuestId}
                  onChange={(e) => setSelectedGuestId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-medium"
                >
                  {filteredGuests.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.fullName} — {g.phone} ({g.guestCode}) {g.vipStatus ? '[VIP]' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Full Name *</span>
                  <input
                    type="text"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder="e.g. Engr. Tanvir Ahmed"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Phone Number *</span>
                  <input
                    type="text"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    placeholder="+880 17XX XXXXXX"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Email Address</span>
                  <input
                    type="email"
                    value={newGuestEmail}
                    onChange={(e) => setNewGuestEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">National ID / Passport #</span>
                  <input
                    type="text"
                    value={newGuestIdNumber}
                    onChange={(e) => setNewGuestIdNumber(e.target.value)}
                    placeholder="1989XXXXXXXXXX"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="vipCheck"
                    checked={newGuestVip}
                    onChange={(e) => setNewGuestVip(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 w-4 h-4"
                  />
                  <label htmlFor="vipCheck" className="text-slate-300 cursor-pointer font-medium">
                    Mark as Resort VIP Profile
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Room & Dates */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
              <BedDouble className="w-3.5 h-3.5" />
              <span>2. Stay Dates & Room Selection</span>
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Arrival Date:</span>
                <input
                  type="date"
                  value={arrivalDate}
                  min={todayStr}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Departure Date:</span>
                <input
                  type="date"
                  value={departureDate}
                  min={arrivalDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Duration:</span>
                <div className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-bold font-mono text-amber-400">
                  {nights} {nights === 1 ? 'Night' : 'Nights'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Room Category:</span>
                <select
                  value={roomTypeId}
                  onChange={(e) => {
                    setRoomTypeId(e.target.value);
                    setAssignedRoomId('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-semibold"
                >
                  {db.roomTypes.map(rt => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name} — ৳{rt.baseRate.toLocaleString()}/nt (Max {rt.maxAdults + rt.maxChildren} Pax)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Specific Room # (Optional):</span>
                <select
                  value={assignedRoomId}
                  onChange={(e) => setAssignedRoomId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                >
                  <option value="">-- Assign Later at Check-In --</option>
                  {candidateRooms.map(rm => (
                    <option key={rm.id} value={rm.id}>
                      Room {rm.roomNumber} (Floor {rm.floor}) - {rm.operationalStatus}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Adults:</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Children:</span>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Booking Source:</span>
                <select
                  value={bookingSource}
                  onChange={(e) => setBookingSource(e.target.value as BookingSourceType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                >
                  <option value="Direct Phone">Direct Phone</option>
                  <option value="Front Desk Walk-in">Front Desk Walk-in</option>
                  <option value="Corporate / CCULB Member">Corporate / Member</option>
                  <option value="Website Direct">Website Direct</option>
                  <option value="OTA (Booking.com/Agoda)">OTA Partner</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Advance Deposit & Billing */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>3. Financials & Advance Deposit</span>
              </span>
              <div className="text-right">
                <span className="text-[10px] text-slate-400">Total Estimated: </span>
                <span className="font-mono font-bold text-amber-400 text-sm">৳{totalEstimated.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Advance Deposit (৳ BDT):</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Payment Method:</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  disabled={depositAmount <= 0}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 disabled:opacity-50"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            {depositAmount > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Payment Transaction Reference:</span>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. BKASH-TXN-8849 / POS-SLIP-102"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 text-xs"
                />
              </div>
            )}

            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Special Requests / VIP Instructions:</span>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Quiet room requested, early check-in at 11 AM, honeymoon bed setup"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs placeholder-slate-600"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center space-x-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Reserve Room</span>
          </button>
        </div>
      </div>
    </div>
  );
};
