import React, { useState, useEffect } from 'react';
import {
  ConciergeBell, LogIn, LogOut, BedDouble, Users, ArrowRightLeft,
  Receipt, FileText, Search, PlusCircle, Printer, Filter, ShieldCheck,
  ShieldAlert, Lock, Unlock, AlertTriangle, X, CheckCircle2, Info
} from 'lucide-react';
import { pmsService } from '../services/pmsService';
import { PmsDatabaseState } from '../services/mockPmsDatabase';
import { Stay, Reservation, Room } from '../types/pms';

interface FrontDeskViewProps {
  onOpenCheckIn: (reservationId?: string) => void;
  onOpenCheckout: (stayId: string) => void;
  onOpenFolio: (folioId: string) => void;
  onOpenRoomDetail: (roomId: string) => void;
  onPrintRegCard: (stay: Stay) => void;
  onOpenNewReservation: () => void;
}

export const FrontDeskView: React.FC<FrontDeskViewProps> = ({
  onOpenCheckIn,
  onOpenCheckout,
  onOpenFolio,
  onOpenRoomDetail,
  onPrintRegCard,
  onOpenNewReservation
}) => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());
  const [activeTab, setActiveTab] = useState<'in-house' | 'arrivals' | 'departures'>('in-house');
  const [search, setSearch] = useState('');
  const [stopPostFilter, setStopPostFilter] = useState<'all' | 'restricted-only' | 'normal-only'>('all');

  // Stop Post modal state
  const [stopPostTargetStay, setStopPostTargetStay] = useState<Stay | null>(null);
  const [stopPostReasonPreset, setStopPostReasonPreset] = useState('Credit Limit Exceeded — Direct Pay Only');
  const [stopPostCustomReason, setStopPostCustomReason] = useState('');
  const [stopPostActionSuccess, setStopPostActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    return pmsService.subscribe(setDb);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const inHouseStays = db.stays.filter(s => s.status === 'Active');
  const arrivals = db.reservations.filter(r => r.status === 'Confirmed' && r.arrivalDate <= todayStr);
  const departures = inHouseStays.filter(s => (s.expectedCheckOutAt ? s.expectedCheckOutAt.startsWith(todayStr) : false));

  const filteredStays = inHouseStays.filter(s => {
    const matchesSearch =
      s.guestName.toLowerCase().includes(search.toLowerCase()) ||
      s.roomNumber.includes(search) ||
      s.stayNumber.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (stopPostFilter === 'restricted-only') return !!s.stopPost;
    if (stopPostFilter === 'normal-only') return !s.stopPost;
    return true;
  });

  const filteredArrivals = arrivals.filter(r =>
    r.guestName.toLowerCase().includes(search.toLowerCase()) ||
    r.reservationNumber.toLowerCase().includes(search.toLowerCase()) ||
    (r.guestPhone && r.guestPhone.includes(search))
  );

  const stopPostCount = inHouseStays.filter(s => s.stopPost).length;

  const handleOpenStopPostModal = (stay: Stay) => {
    setStopPostTargetStay(stay);
    setStopPostActionSuccess(null);
    if (stay.stopPost) {
      setStopPostCustomReason(stay.stopPostReason || '');
    } else {
      setStopPostReasonPreset('Credit Limit Exceeded — Direct Pay Only');
      setStopPostCustomReason('');
    }
  };

  const handleConfirmStopPostToggle = (enable: boolean) => {
    if (!stopPostTargetStay) return;
    try {
      const reasonToUse = stopPostReasonPreset === 'Other'
        ? (stopPostCustomReason.trim() || 'Restricted by Front Office')
        : (stopPostCustomReason.trim() ? `${stopPostReasonPreset} (${stopPostCustomReason.trim()})` : stopPostReasonPreset);

      pmsService.toggleStopPost(stopPostTargetStay.id, enable, reasonToUse);
      setStopPostActionSuccess(enable ? `Stop Post restriction activated on Room ${stopPostTargetStay.roomNumber}` : `Stop Post lock removed from Room ${stopPostTargetStay.roomNumber}`);
      setTimeout(() => {
        setStopPostTargetStay(null);
        setStopPostActionSuccess(null);
      }, 900);
    } catch (err: any) {
      alert(err.message || 'Failed to update Stop Post status');
    }
  };

  return (
    <div className="space-y-4 text-xs text-gray-900">
      {/* Front Desk Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow-xs">
            <ConciergeBell className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-gray-900 uppercase tracking-tight">Front Desk Operations Command</h1>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200 font-mono">
                DUTY DESK
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-0.5">
              Live guest in-house rack, arrivals check-in, registration cards, and checkout folio settling.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenCheckIn()}
            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors shadow-xs text-xs"
          >
            <LogIn className="w-4 h-4" />
            <span>Walk-in Check-In</span>
          </button>
          <button
            onClick={onOpenNewReservation}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-md transition-colors border border-gray-300 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Tabs, Filter Chips and Live Counts */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 bg-white border border-gray-200 p-2.5 rounded-lg shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-md border border-gray-200">
            <button
              onClick={() => setActiveTab('in-house')}
              className={`px-3.5 py-1.5 rounded-md font-bold text-xs transition-colors flex items-center space-x-2 ${
                activeTab === 'in-house'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BedDouble className="w-3.5 h-3.5" />
              <span>In-House Guests</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                activeTab === 'in-house' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {inHouseStays.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('arrivals')}
              className={`px-3.5 py-1.5 rounded-md font-bold text-xs transition-colors flex items-center space-x-2 ${
                activeTab === 'arrivals'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Expected Arrivals</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                activeTab === 'arrivals' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {arrivals.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('departures')}
              className={`px-3.5 py-1.5 rounded-md font-bold text-xs transition-colors flex items-center space-x-2 ${
                activeTab === 'departures'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Departures Today</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                activeTab === 'departures' ? 'bg-red-800 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {departures.length}
              </span>
            </button>
          </div>

          {/* In-House Stop Post Quick Filter */}
          {activeTab === 'in-house' && (
            <div className="flex items-center space-x-1 bg-gray-50 border border-gray-200 p-1 rounded-md text-[11px]">
              <button
                onClick={() => setStopPostFilter('all')}
                className={`px-2 py-1 rounded font-medium transition ${
                  stopPostFilter === 'all' ? 'bg-white text-gray-900 shadow-xs font-bold border border-gray-200' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                All Rooms ({inHouseStays.length})
              </button>
              <button
                onClick={() => setStopPostFilter('restricted-only')}
                className={`px-2 py-1 rounded font-medium transition flex items-center gap-1 ${
                  stopPostFilter === 'restricted-only'
                    ? 'bg-amber-500 text-white shadow-xs font-bold'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                Stop Post ({stopPostCount})
              </button>
            </div>
          )}
        </div>

        {/* Search filter input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search room, guest name, phone..."
            className="w-full bg-white border border-gray-300 rounded-md pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* 1. IN-HOUSE STAYS TABLE */}
      {activeTab === 'in-house' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-4">Room #</th>
                  <th className="py-2.5 px-4">Guest Name & Code</th>
                  <th className="py-2.5 px-4">Room Category</th>
                  <th className="py-2.5 px-4">Posting Status</th>
                  <th className="py-2.5 px-4">Check-In</th>
                  <th className="py-2.5 px-4">Expected Departure</th>
                  <th className="py-2.5 px-4 text-right">Live Folio Balance</th>
                  <th className="py-2.5 px-4 text-center">Desk Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStays.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      No matching in-house guest records found.
                    </td>
                  </tr>
                ) : (
                  filteredStays.map(stay => {
                    const folio = db.folios.find(f => f.id === stay.folioId);
                    const room = db.rooms.find(r => r.id === stay.roomId);
                    const isStopPost = !!stay.stopPost;

                    return (
                      <tr key={stay.id} className={`hover:bg-blue-50/60 transition-colors ${isStopPost ? 'bg-amber-50/30' : ''}`}>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => onOpenRoomDetail(stay.roomId)}
                            className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            Room {stay.roomNumber}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 block">{stay.guestName}</span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">{stay.stayNumber} • {stay.keyCardsIssued} Cards</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-medium">
                          {stay.roomTypeName}
                        </td>
                        <td className="py-3 px-4">
                          {isStopPost ? (
                            <div className="flex flex-col gap-0.5">
                              <span
                                onClick={() => handleOpenStopPostModal(stay)}
                                className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition"
                                title="Click to view or remove Stop Post"
                              >
                                <ShieldAlert className="w-3 h-3 text-amber-700" />
                                STOP POST ACTIVE
                              </span>
                              {stay.stopPostReason && (
                                <span className="text-[10px] text-amber-800 font-medium truncate max-w-[150px]" title={stay.stopPostReason}>
                                  {stay.stopPostReason}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span
                              onClick={() => handleOpenStopPostModal(stay)}
                              className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                              title="Click to lock / restrict room posting"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Posting Allowed
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-mono">
                          {stay.checkInAt ? stay.checkInAt.split('T')[0] : 'N/A'} <span className="text-gray-400 text-[10px]">14:30</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-800 font-medium font-mono">{stay.expectedCheckOutAt ? stay.expectedCheckOutAt.split('T')[0] : 'N/A'}</span>
                          <span className="text-gray-400 text-[10px] block">12:00 PM</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          {folio ? (
                            <span className={folio.balance <= 0 ? 'text-green-600' : 'text-red-500'}>
                              ৳{folio.balance.toLocaleString()}
                            </span>
                          ) : '৳0'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* Stop Post Action Button */}
                            <button
                              onClick={() => handleOpenStopPostModal(stay)}
                              title={isStopPost ? "Stop Post is Active (Click to unlock)" : "Stop Post in Room (Restrict outlet billing)"}
                              className={`p-1.5 rounded font-medium border transition-colors ${
                                isStopPost
                                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300'
                                  : 'bg-gray-100 hover:bg-amber-50 text-gray-600 hover:text-amber-700 border-gray-200'
                              }`}
                            >
                              {isStopPost ? <Lock className="w-3.5 h-3.5 text-amber-700" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>

                            {folio && (
                              <button
                                onClick={() => onOpenFolio(folio.id)}
                                title="Open Folio Statement"
                                className="p-1.5 bg-gray-100 hover:bg-blue-50 text-blue-600 rounded font-medium border border-gray-200 transition-colors"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onPrintRegCard(stay)}
                              title="Print Guest Registration Card"
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium border border-gray-200 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenCheckout(stay.id)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[11px] transition-colors shadow-xs"
                            >
                              Check-Out
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. EXPECTED ARRIVALS TABLE */}
      {activeTab === 'arrivals' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-4">Res #</th>
                  <th className="py-2.5 px-4">Guest Full Name</th>
                  <th className="py-2.5 px-4">Phone / Contact</th>
                  <th className="py-2.5 px-4">Category & Nights</th>
                  <th className="py-2.5 px-4">Dates</th>
                  <th className="py-2.5 px-4 text-right">Advance Paid</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredArrivals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No pending confirmed arrivals waiting for check-in.
                    </td>
                  </tr>
                ) : (
                  filteredArrivals.map(res => (
                    <tr key={res.id} className="hover:bg-blue-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {res.reservationNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{res.guestName}</span>
                        <span className="text-[10px] text-gray-400">Source: {res.bookingSource}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {res.guestPhone}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800 block">{res.roomTypeName}</span>
                        <span className="text-[10px] text-gray-400">{res.adults} Adults, {res.children} Kids</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono">
                        {res.arrivalDate} → {res.departureDate}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-green-600">
                        ৳{res.paidAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onOpenCheckIn(res.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-colors shadow-xs"
                        >
                          Check-In Guest
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. DEPARTURES TABLE */}
      {activeTab === 'departures' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-4">Room #</th>
                  <th className="py-2.5 px-4">Guest Name</th>
                  <th className="py-2.5 px-4">Stay Record</th>
                  <th className="py-2.5 px-4 text-right">Balance Due</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {departures.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No stays scheduled for departure today.
                    </td>
                  </tr>
                ) : (
                  departures.map(s => {
                    const folio = db.folios.find(f => f.id === s.folioId);
                    return (
                      <tr key={s.id} className="hover:bg-blue-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          Room {s.roomNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {s.guestName}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500">
                          {s.stayNumber}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          {folio ? (
                            <span className={folio.balance <= 0 ? 'text-green-600' : 'text-red-500'}>
                              ৳{folio.balance.toLocaleString()}
                            </span>
                          ) : '৳0'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => onOpenCheckout(s.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs transition-colors shadow-xs"
                          >
                            Fast Check-Out
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STOP POST MANAGEMENT MODAL */}
      {stopPostTargetStay && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className={`p-4 text-white flex items-center justify-between ${
              stopPostTargetStay.stopPost ? 'bg-amber-600' : 'bg-slate-800'
            }`}>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  {stopPostTargetStay.stopPost ? <ShieldAlert className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">
                    {stopPostTargetStay.stopPost ? 'Manage Stop Post Restriction' : 'Set Stop Post on Room'}
                  </h3>
                  <p className="text-[11px] text-white/80">
                    Room {stopPostTargetStay.roomNumber} — {stopPostTargetStay.guestName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStopPostTargetStay(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {stopPostActionSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{stopPostActionSuccess}</span>
                </div>
              )}

              {/* Current Status Info Box */}
              <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                stopPostTargetStay.stopPost
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <Info className={`w-4 h-4 shrink-0 mt-0.5 ${stopPostTargetStay.stopPost ? 'text-amber-600' : 'text-slate-500'}`} />
                <div>
                  <span className="font-bold block">
                    {stopPostTargetStay.stopPost ? '⛔ STOP POST ACTIVE' : '✅ Standard Posting Allowed'}
                  </span>
                  <p className="text-[11px] mt-0.5 text-slate-600">
                    {stopPostTargetStay.stopPost
                      ? `Active restriction: "${stopPostTargetStay.stopPostReason || 'Restricted by Front Office'}". Outlet billing from Restaurant POS and In-Room Dining is blocked.`
                      : 'Activating Stop Post prevents all outlets (Restaurant POS, In-Room Dining, Minibar, Spa) from posting unpaid charges to this guest\'s room folio.'}
                  </p>
                </div>
              </div>

              {/* Reason Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Select Restriction Reason / Policy Preset *
                </label>
                <select
                  value={stopPostReasonPreset}
                  onChange={(e) => setStopPostReasonPreset(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="Credit Limit Exceeded — Direct Pay Only">Credit Limit Exceeded — Direct Pay Only</option>
                  <option value="Cash / MFS Only (No Card Pre-Auth on file)">Cash / MFS Only (No Card Pre-Auth on file)</option>
                  <option value="Guest Request — Block Outlet Charges to Room">Guest Request — Block Outlet Charges to Room</option>
                  <option value="Corporate Master Account — Settle Separately">Corporate Master Account — Settle Separately</option>
                  <option value="Pending Advance Deposit Clearance">Pending Advance Deposit Clearance</option>
                  <option value="Disputed Charges — Under FO Review">Disputed Charges — Under FO Review</option>
                  <option value="Checkout in Progress / Settlement Lock">Checkout in Progress / Settlement Lock</option>
                  <option value="Other">Other / Custom Reason</option>
                </select>
              </div>

              {/* Custom Notes / Specifics */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Additional Reason Details or Staff Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={stopPostCustomReason}
                  onChange={(e) => setStopPostCustomReason(e.target.value)}
                  placeholder="e.g. Guest requested cash payment for all dining; or deposit pending at bank."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 placeholder-slate-400"
                />
              </div>

              {/* Folio Preview Snapshot */}
              {(() => {
                const stayFolio = db.folios.find(f => f.id === stopPostTargetStay.folioId);
                return stayFolio ? (
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div>
                      <span className="text-slate-500 font-mono text-[11px] block">{stayFolio.folioNumber}</span>
                      <span className="font-semibold text-slate-800">Total Billed: ৳{stayFolio.grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Current Balance</span>
                      <span className={`font-mono font-bold ${stayFolio.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ৳{stayFolio.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setStopPostTargetStay(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition text-xs"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {stopPostTargetStay.stopPost ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleConfirmStopPostToggle(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition text-xs shadow-xs"
                    >
                      Update Reason
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmStopPostToggle(false)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition flex items-center gap-1.5 text-xs shadow-xs"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlock / Allow Posting</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConfirmStopPostToggle(true)}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition flex items-center gap-1.5 text-xs shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Confirm Stop Post</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
