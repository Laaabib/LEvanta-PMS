import React, { useState, useEffect } from 'react';
import {
  Grid3X3, BedDouble, Sparkles, Wrench, User, Calendar,
  CheckCircle2, RefreshCw, Filter, ArrowRightLeft, PlusCircle, Lock
} from 'lucide-react';
import { pmsService } from '../services/pmsService';
import { PmsDatabaseState } from '../services/mockPmsDatabase';
import { Room, OperationalStatus } from '../types/pms';

interface RoomRackViewProps {
  onSelectRoom: (roomId: string) => void;
  onOpenNewReservation: (roomId?: string) => void;
}

export const RoomRackView: React.FC<RoomRackViewProps> = ({
  onSelectRoom,
  onOpenNewReservation
}) => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [floorFilter, setFloorFilter] = useState<number | 'All'>('All');

  useEffect(() => {
    return pmsService.subscribe(setDb);
  }, []);

  const floors = [1, 2, 3];

  const filteredRooms = db.rooms.filter(r => {
    const matchesStatus = statusFilter === 'All' || r.operationalStatus === statusFilter;
    const matchesFloor = floorFilter === 'All' || r.floor === floorFilter;
    return matchesStatus && matchesFloor;
  });

  return (
    <div className="space-y-4 text-xs text-gray-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-200">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-gray-900 uppercase tracking-tight">Live Room Rack Matrix</h1>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200 font-mono">
                10 ROOMS
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-0.5">
              Visual floor-by-floor hotel room rack showing occupancy, housekeeping, and maintenance.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenNewReservation()}
            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors shadow-xs text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-gray-200 p-3 rounded-lg shadow-xs">
        {/* Operational Status Filters */}
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Available', 'Occupied', 'Reserved', 'Dirty', 'Out of Order'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Floor Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[11px] text-gray-500 font-medium">Floor:</span>
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value === 'All' ? 'All' : parseInt(e.target.value))}
            className="bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
          >
            <option value="All">All Floors</option>
            <option value="1">1st Floor (Garden Wing)</option>
            <option value="2">2nd Floor (Executive Wing)</option>
            <option value="3">3rd Floor (Lake View Suites)</option>
          </select>
        </div>
      </div>

      {/* Room Grid Grouped by Floor */}
      <div className="space-y-4">
        {floors.map(floorNum => {
          const roomsOnFloor = filteredRooms.filter(r => r.floor === floorNum);
          if (roomsOnFloor.length === 0) return null;

          return (
            <div key={floorNum} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-800 text-xs uppercase tracking-tight">
                    {floorNum === 1 ? '1st Floor — Garden Wing' :
                     floorNum === 2 ? '2nd Floor — Executive Wing' :
                     '3rd Floor — Lake View & Presidential Suites'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    ({roomsOnFloor.length} Rooms)
                  </span>
                </div>
              </div>

              {/* Floor Room Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {roomsOnFloor.map(room => {
                  const activeStay = db.stays.find(s => s.roomId === room.id && s.status === 'Active');
                  const upcomingRes = db.reservations.find(r => r.assignedRoomId === room.id && r.status === 'Confirmed');

                  return (
                    <div
                      key={room.id}
                      onClick={() => onSelectRoom(room.id)}
                      className={`p-3.5 rounded-lg border transition-all duration-150 cursor-pointer shadow-xs relative overflow-hidden group hover:border-blue-600 bg-white ${
                        room.operationalStatus === 'Occupied'
                          ? 'border-red-200 hover:shadow-sm'
                          : room.operationalStatus === 'Available'
                          ? 'border-green-200 hover:shadow-sm'
                          : room.operationalStatus === 'Reserved'
                          ? 'border-blue-200 hover:shadow-sm'
                          : room.operationalStatus === 'Dirty'
                          ? 'border-amber-200 hover:shadow-sm'
                          : 'border-gray-200'
                      }`}
                    >
                      {/* Top Bar inside Card */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-lg text-gray-900 tracking-tight">
                            {room.roomNumber}
                          </span>
                          {activeStay?.stopPost && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[9px] font-bold border border-rose-200" title={`Stop Post Active: ${activeStay.stopPostReason || 'No outlet posting'}`}>
                              <Lock className="w-2.5 h-2.5" />
                              <span>STOP POST</span>
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono ${
                          room.operationalStatus === 'Occupied' ? 'bg-red-50 text-red-700 border border-red-200' :
                          room.operationalStatus === 'Available' ? 'bg-green-50 text-green-700 border border-green-200' :
                          room.operationalStatus === 'Reserved' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          room.operationalStatus === 'Dirty' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {room.operationalStatus}
                        </span>
                      </div>

                      {/* Category & Bed info */}
                      <div className="mt-1 text-gray-500 text-[11px]">
                        <span className="font-semibold text-gray-800">{room.roomTypeName}</span>
                        <span className="block text-[10px] text-gray-400">{room.beddingType} Bed</span>
                      </div>

                      {/* Dynamic Content (Guest name if occupied / Res if reserved) */}
                      <div className="mt-3 pt-2.5 border-t border-gray-100 min-h-[44px] flex flex-col justify-center">
                        {activeStay ? (
                          <div>
                            <div className="flex items-center space-x-1.5 text-gray-900 font-bold">
                              <User className="w-3 h-3 text-red-500 shrink-0" />
                              <span className="truncate">{activeStay.guestName}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 block mt-0.5 font-mono">
                              Check-Out: <span className="text-gray-800 font-semibold">{activeStay.expectedCheckOutAt ? activeStay.expectedCheckOutAt.split('T')[0] : 'N/A'}</span>
                            </span>
                          </div>
                        ) : upcomingRes ? (
                          <div>
                            <div className="flex items-center space-x-1.5 text-blue-700 font-medium">
                              <Calendar className="w-3 h-3 text-blue-500 shrink-0" />
                              <span className="truncate">{upcomingRes.guestName}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
                              Arrival: {upcomingRes.arrivalDate}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span>HK Status:</span>
                            <span className={`font-semibold ${
                              room.housekeepingStatus === 'Clean' ? 'text-green-600' :
                              room.housekeepingStatus === 'Inspected' ? 'text-purple-600' : 'text-amber-600'
                            }`}>
                              {room.housekeepingStatus}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Hover action prompt */}
                      <div className="mt-2 text-right">
                        <span className="text-[10px] text-blue-600 group-hover:underline font-bold">
                          Quick Actions →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
