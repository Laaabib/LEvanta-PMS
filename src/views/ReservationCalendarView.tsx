import React, { useState, useEffect } from 'react';
import {
  CalendarRange, ChevronLeft, ChevronRight, Plus,
  BedDouble, User, CheckCircle2, AlertCircle
} from 'lucide-react';
import { pmsService } from '../services/pmsService';
import { PmsDatabaseState } from '../services/mockPmsDatabase';
import { Room, Reservation } from '../types/pms';

interface ReservationCalendarViewProps {
  onOpenNewReservation: (roomId?: string, arrivalDate?: string) => void;
  onOpenCheckIn: (reservationId: string) => void;
  onSelectRoom: (roomId: string) => void;
}

export const ReservationCalendarView: React.FC<ReservationCalendarViewProps> = ({
  onOpenNewReservation,
  onOpenCheckIn,
  onSelectRoom
}) => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());
  const [startDateOffset, setStartDateOffset] = useState<number>(0);

  useEffect(() => {
    return pmsService.subscribe(setDb);
  }, []);

  // Generate 14-day date range starting from base date + offset
  const today = new Date();
  today.setDate(today.getDate() + startDateOffset);

  const days: { dateStr: string; displayDay: string; displayDate: string; isWeekend: boolean }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const displayDay = d.toLocaleDateString('en-US', { weekday: 'short' });
    const displayDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const isWeekend = d.getDay() === 5 || d.getDay() === 6; // Friday & Saturday in Bangladesh
    days.push({ dateStr, displayDay, displayDate, isWeekend });
  }

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Calendar Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center border border-cyan-500/30">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">Room Tape Chart & Calendar</h1>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                14-Day Timeline
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Click any room slot to reserve. Double-booking prevention engine automatically validates overlaps.
            </p>
          </div>
        </div>

        {/* Timeline navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStartDateOffset(prev => prev - 7)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Previous 7 Days"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setStartDateOffset(0)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 transition-colors text-xs"
          >
            Today
          </button>
          <button
            onClick={() => setStartDateOffset(prev => prev + 7)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Next 7 Days"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Tape Chart Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left select-none min-w-[900px]">
            {/* Header: Dates */}
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
              <tr>
                <th className="py-3 px-3 w-40 border-r border-slate-800 font-bold text-slate-300 bg-slate-950">
                  Room / Category
                </th>
                {days.map((day, idx) => (
                  <th
                    key={idx}
                    className={`py-2 px-1 text-center border-r border-slate-800/80 ${
                      day.isWeekend ? 'bg-slate-900/90 text-amber-300' : 'bg-slate-950 text-slate-300'
                    }`}
                  >
                    <span className="block text-[10px] uppercase font-bold">{day.displayDay}</span>
                    <span className="block font-mono text-[11px] text-slate-200">{day.displayDate}</span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body: Rooms Matrix */}
            <tbody className="divide-y divide-slate-800">
              {db.rooms.map(room => {
                return (
                  <tr key={room.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Room Info Cell */}
                    <td
                      onClick={() => onSelectRoom(room.id)}
                      className="py-2.5 px-3 border-r border-slate-800 bg-slate-950/60 cursor-pointer hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-slate-100">{room.roomNumber}</span>
                        <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-semibold ${
                          room.operationalStatus === 'Occupied' ? 'bg-rose-500/20 text-rose-300' :
                          room.operationalStatus === 'Available' ? 'bg-emerald-500/20 text-emerald-300' :
                          room.operationalStatus === 'Reserved' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {room.operationalStatus.charAt(0)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block mt-0.5 max-w-[130px]">
                        {room.roomTypeName}
                      </span>
                    </td>

                    {/* Timeline Day Cells */}
                    {days.map((day, dIdx) => {
                      // Find reservation on this date for this room
                      const resOnDate = db.reservations.find(res => {
                        if (res.assignedRoomId !== room.id) return false;
                        if (res.status === 'Cancelled') return false;
                        return day.dateStr >= res.arrivalDate && day.dateStr < res.departureDate;
                      });

                      const isArrivalDay = resOnDate?.arrivalDate === day.dateStr;

                      if (resOnDate) {
                        return (
                          <td
                            key={dIdx}
                            onClick={() => {
                              if (resOnDate.status === 'Confirmed') onOpenCheckIn(resOnDate.id);
                            }}
                            className={`p-1 border-r border-slate-800/60 cursor-pointer text-center relative ${
                              resOnDate.status === 'Checked-In' ? 'bg-blue-600/30' :
                              resOnDate.status === 'Confirmed' ? 'bg-emerald-600/30' : 'bg-slate-800'
                            }`}
                            title={`${resOnDate.guestName} (${resOnDate.reservationNumber}) — ${resOnDate.arrivalDate} to ${resOnDate.departureDate}`}
                          >
                            <div className={`h-8 rounded flex items-center justify-center px-1 text-[10px] font-medium truncate shadow-sm ${
                              resOnDate.status === 'Checked-In' ? 'bg-blue-600 text-white font-bold' :
                              resOnDate.status === 'Confirmed' ? 'bg-emerald-600 text-white font-semibold' : 'bg-slate-700 text-slate-300'
                            }`}>
                              {isArrivalDay ? (
                                <span className="truncate">{resOnDate.guestName ? resOnDate.guestName.split(' ')[0] : 'Guest'}</span>
                              ) : (
                                <span className="opacity-60 text-[9px]">•</span>
                              )}
                            </div>
                          </td>
                        );
                      }

                      // Empty Slot (Available for click-to-book)
                      return (
                        <td
                          key={dIdx}
                          onClick={() => onOpenNewReservation(room.id, day.dateStr)}
                          className={`p-1 border-r border-slate-800/60 text-center cursor-pointer group transition-colors ${
                            day.isWeekend ? 'bg-slate-900/30 hover:bg-amber-500/20' : 'hover:bg-cyan-500/20'
                          }`}
                          title={`Click to book Room ${room.roomNumber} for ${day.dateStr}`}
                        >
                          <div className="h-8 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 text-slate-400 group-hover:text-amber-400">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
            <span>Checked-In (In-House)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
            <span>Confirmed Booking</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 inline-block" />
            <span>Available Slot</span>
          </div>
        </div>
        <span className="text-[10.5px] font-mono text-slate-500">
          CCULB Multi-Night Grid Engine
        </span>
      </div>
    </div>
  );
};
