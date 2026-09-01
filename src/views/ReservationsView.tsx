import React, { useState, useEffect } from 'react';
import {
  CalendarDays, PlusCircle, Search, Download, Filter,
  CheckCircle2, XCircle, LogIn, Clock, FileSpreadsheet, Eye, Printer
} from 'lucide-react';
import { pmsService } from '../services/pmsService';
import { PmsDatabaseState } from '../services/mockPmsDatabase';
import { Reservation } from '../types/pms';

interface ReservationsViewProps {
  onOpenNewReservation: () => void;
  onOpenCheckIn: (reservationId: string) => void;
  onSelectGuest?: (guestId: string) => void;
  onPrintReservation?: (reservation: Reservation) => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  onOpenNewReservation,
  onOpenCheckIn,
  onSelectGuest,
  onPrintReservation
}) => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');

  useEffect(() => {
    return pmsService.subscribe(setDb);
  }, []);

  const filteredReservations = db.reservations.filter(res => {
    const matchesSearch =
      res.reservationNumber.toLowerCase().includes(search.toLowerCase()) ||
      res.guestName.toLowerCase().includes(search.toLowerCase()) ||
      res.guestPhone.includes(search) ||
      (res.assignedRoomNumber && res.assignedRoomNumber.includes(search));

    const matchesStatus = statusFilter === 'All' || res.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || res.bookingSource === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleExportExcel = () => {
    const exportData = filteredReservations.map(r => ({
      'Res Number': r.reservationNumber,
      'Guest Name': r.guestName,
      'Phone': r.guestPhone,
      'Room Type': r.roomTypeName,
      'Assigned Room': r.assignedRoomNumber || 'Unassigned',
      'Arrival': r.arrivalDate,
      'Departure': r.departureDate,
      'Adults': r.adults,
      'Children': r.children,
      'Status': r.status,
      'Booking Source': r.bookingSource,
      'Rate/Night': r.rate,
      'Deposit Paid': r.paidAmount,
      'Total Estimated': r.totalEstimatedAmount,
      'Created At': r.createdAt
    }));
    pmsService.exportTableToExcel(exportData, 'CCULB_Reservations');
  };

  const handleCancelReservation = (resId: string) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      pmsService.cancelReservation(resId, 'Cancelled from Reservations Desk');
    }
  };

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">Room Reservations Directory</h1>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                {filteredReservations.length} Bookings
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Advance bookings, deposit settlements, OTA channels, and walk-in records.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors border border-slate-700 text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={onOpenNewReservation}
            className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors shadow-sm text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by res #, guest, phone, room..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-[11px]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-In">Checked-In</option>
            <option value="Checked-Out">Checked-Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Source Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-[11px]">Channel:</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Booking Channels</option>
            <option value="Direct Phone">Direct Phone</option>
            <option value="Front Desk Walk-in">Walk-in</option>
            <option value="Corporate / CCULB Member">Corporate Member</option>
            <option value="Website Direct">Website Direct</option>
            <option value="OTA (Booking.com/Agoda)">OTA Partners</option>
          </select>
        </div>
      </div>

      {/* Main Reservations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Res #</th>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Room Category</th>
                <th className="py-3 px-4">Stay Dates</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Advance Paid</th>
                <th className="py-3 px-4 text-right">Total Est.</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No reservations matching current filters.
                  </td>
                </tr>
              ) : (
                filteredReservations.map(res => (
                  <tr key={res.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {res.reservationNumber}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectGuest?.(res.guestId)}
                        className="font-bold text-slate-100 hover:text-amber-300 transition-colors block text-left"
                      >
                        {res.guestName}
                      </button>
                      <span className="text-[10px] text-slate-400">{res.bookingSource}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {res.guestPhone}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200 block">{res.roomTypeName}</span>
                      {res.assignedRoomNumber && (
                        <span className="text-[10px] text-cyan-400 font-mono">Assigned: Room {res.assignedRoomNumber}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span>{res.arrivalDate} → {res.departureDate}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10.5px] px-2 py-0.5 rounded font-semibold ${
                        res.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        res.status === 'Checked-In' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        res.status === 'Checked-Out' ? 'bg-slate-800 text-slate-400' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                      ৳{res.paidAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                      ৳{res.totalEstimatedAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onPrintReservation?.(res)}
                          title="Print Reservation Confirmation Voucher"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded font-medium border border-slate-700 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {res.status === 'Confirmed' && (
                          <button
                            onClick={() => onOpenCheckIn(res.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[11px] transition-colors"
                          >
                            Check-In
                          </button>
                        )}
                        {res.status === 'Confirmed' && (
                          <button
                            onClick={() => handleCancelReservation(res.id)}
                            title="Cancel Reservation"
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
