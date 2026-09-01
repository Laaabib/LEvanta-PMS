import React, { useState, useEffect } from 'react';
import { X, LogIn, CheckCircle2, User, BedDouble, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import { pmsService } from '../../services/pmsService';
import { Reservation, Room, PaymentMethod } from '../../types/pms';

interface QuickCheckInDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialReservationId?: string;
  onSuccess?: () => void;
}

export const QuickCheckInDrawer: React.FC<QuickCheckInDrawerProps> = ({
  isOpen,
  onClose,
  initialReservationId,
  onSuccess
}) => {
  const db = pmsService.getState();
  const [selectedResId, setSelectedResId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [keyCardsCount, setKeyCardsCount] = useState<number>(2);
  const [verifiedId, setVerifiedId] = useState<boolean>(true);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (initialReservationId) {
        setSelectedResId(initialReservationId);
        const res = db.reservations.find(r => r.id === initialReservationId);
        if (res) {
          if (res.assignedRoomId) {
            setSelectedRoomId(res.assignedRoomId);
          } else {
            // Find first available room of matching type
            const avail = db.rooms.find(r => r.roomTypeId === res.roomTypeId && r.operationalStatus === 'Available' && r.active);
            if (avail) setSelectedRoomId(avail.id);
          }
          setSpecialRequests(res.specialRequests || '');
        }
      } else {
        // Pick first un-checked-in confirmed reservation
        const confirmed = db.reservations.filter(r => r.status === 'Confirmed');
        if (confirmed.length > 0) {
          setSelectedResId(confirmed[0].id);
          if (confirmed[0].assignedRoomId) setSelectedRoomId(confirmed[0].assignedRoomId);
        }
      }
    }
  }, [isOpen, initialReservationId]);

  if (!isOpen) return null;

  const currentRes = db.reservations.find(r => r.id === selectedResId);
  const candidateRooms = currentRes
    ? db.rooms.filter(r => r.roomTypeId === currentRes.roomTypeId && r.active && (r.operationalStatus === 'Available' || r.operationalStatus === 'Reserved' || r.id === currentRes.assignedRoomId))
    : db.rooms.filter(r => r.active && r.operationalStatus === 'Available');

  const handleConfirmCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedResId) {
      setError('Please select a reservation to check in.');
      return;
    }
    if (!selectedRoomId) {
      setError('Please assign a clean, available room for this stay.');
      return;
    }

    try {
      pmsService.checkInReservation({
        reservationId: selectedResId,
        roomId: selectedRoomId,
        keyCardsIssued: keyCardsCount,
        verifiedId,
        depositPayment: depositAmount > 0 ? {
          amount: depositAmount,
          method: paymentMethod,
          reference: paymentRef || 'Front Desk Check-in Advance'
        } : undefined,
        specialRequests
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Check-in failed. Please verify room availability.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-150">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full flex flex-col shadow-2xl text-xs text-slate-200">
        {/* Drawer Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Front Desk Quick Check-In</h3>
              <p className="text-[11px] text-slate-400">Single-Screen Guest Arrival & Room Allocation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmCheckIn} className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Reservation Selection */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded border border-slate-800">
            <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span>Select Pending Reservation:</span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {db.reservations.filter(r => r.status === 'Confirmed').length} Confirmed Waiting
              </span>
            </label>
            <select
              value={selectedResId}
              onChange={(e) => {
                setSelectedResId(e.target.value);
                const r = db.reservations.find(res => res.id === e.target.value);
                if (r?.assignedRoomId) setSelectedRoomId(r.assignedRoomId);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {db.reservations.filter(r => r.status === 'Confirmed').map(r => (
                <option key={r.id} value={r.id}>
                  {r.reservationNumber} — {r.guestName} ({r.roomTypeName}) [{r.arrivalDate} to {r.departureDate}]
                </option>
              ))}
            </select>

            {currentRes && (
              <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Guest Name:</span>
                  <span className="font-semibold text-slate-200">{currentRes.guestName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Phone Number:</span>
                  <span className="font-mono text-slate-200">{currentRes.guestPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Room Type & Rate:</span>
                  <span className="text-amber-400 font-semibold">{currentRes.roomTypeName} (৳{currentRes.rate.toLocaleString()}/nt)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Advance Deposit Paid:</span>
                  <span className="font-mono text-emerald-400 font-semibold">৳{currentRes.paidAmount.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Room Assignment */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded border border-slate-800">
            <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <BedDouble className="w-3.5 h-3.5 text-cyan-400" />
                <span>Assign Clean Room:</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {candidateRooms.length} Available in Inventory
              </span>
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono font-semibold"
            >
              <option value="">-- Choose Room --</option>
              {candidateRooms.map(rm => (
                <option key={rm.id} value={rm.id}>
                  Room {rm.roomNumber} (Floor {rm.floor}) — {rm.roomTypeName} [{rm.housekeepingStatus} / {rm.operationalStatus}]
                </option>
              ))}
            </select>
          </div>

          {/* 3. ID Verification & Key Cards */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded border border-slate-800">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Key Cards Issued:</label>
              <input
                type="number"
                min="1"
                max="5"
                value={keyCardsCount}
                onChange={(e) => setKeyCardsCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center space-x-2 cursor-pointer pb-1">
                <input
                  type="checkbox"
                  checked={verifiedId}
                  onChange={(e) => setVerifiedId(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
                />
                <span className="text-[11px] font-medium text-slate-300">National ID / Passport Verified</span>
              </label>
            </div>
          </div>

          {/* 4. Payment / Additional Deposit */}
          <div className="space-y-2 bg-slate-950/60 p-3 rounded border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Collect Advance Deposit (Optional):</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Amount (৳ BDT):</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Method:</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs"
                >
                  <option value="Credit Card">Credit Card (POS)</option>
                  <option value="Cash">Cash at Counter</option>
                  <option value="bKash">bKash Merchant</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
            {depositAmount > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Transaction / Card Auth Ref:</span>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. VISA-4242 / BKASH-TRX"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 text-xs"
                />
              </div>
            )}
          </div>

          {/* 5. Special Requests & Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300">Special Guest Requests:</label>
            <textarea
              rows={2}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Extra pillows, pool view requested, VIP welcome fruits"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmCheckIn}
            className="flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition-colors shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Check-In Guest</span>
          </button>
        </div>
      </div>
    </div>
  );
};
