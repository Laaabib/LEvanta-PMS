import React, { useState, useEffect } from 'react';
import {
  Sparkles, CheckCircle2, Clock, User, ShieldAlert,
  ArrowRight, Filter, RefreshCw, CheckSquare, Wrench
} from 'lucide-react';
import { pmsService } from '../services/pmsService';
import { PmsDatabaseState } from '../services/mockPmsDatabase';
import { Room, HousekeepingStatus } from '../types/pms';

interface HousekeepingViewProps {
  onSelectRoom: (roomId: string) => void;
}

export const HousekeepingView: React.FC<HousekeepingViewProps> = ({ onSelectRoom }) => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());
  const [activeTab, setActiveTab] = useState<HousekeepingStatus | 'All'>('All');

  useEffect(() => {
    return pmsService.subscribe(setDb);
  }, []);

  const handleUpdateStatus = (roomId: string, status: HousekeepingStatus) => {
    pmsService.updateHousekeepingStatus(roomId, status);
  };

  const dirtyRooms = db.rooms.filter(r => r.housekeepingStatus === 'Dirty');
  const cleaningRooms = db.rooms.filter(r => r.housekeepingStatus === 'Cleaning');
  const cleanRooms = db.rooms.filter(r => r.housekeepingStatus === 'Clean');
  const inspectedRooms = db.rooms.filter(r => r.housekeepingStatus === 'Inspected');

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">Housekeeping & Room Turnover Board</h1>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                {dirtyRooms.length + cleaningRooms.length} Pending Actions
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Live floor turnover tracking: Dirty → Cleaning → Clean → Supervisor Inspected.
            </p>
          </div>
        </div>
      </div>

      {/* 4-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* COLUMN 1: DIRTY */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-bold text-slate-100 text-xs">Dirty / Vacant</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px]">
              {dirtyRooms.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {dirtyRooms.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-[11px]">No dirty rooms pending cleaning</div>
            ) : (
              dirtyRooms.map(room => (
                <div
                  key={room.id}
                  className="bg-slate-950 p-3 rounded-lg border border-amber-500/30 space-y-2 hover:border-amber-400 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <button
                      onClick={() => onSelectRoom(room.id)}
                      className="font-mono font-bold text-sm text-slate-100 hover:text-amber-400"
                    >
                      Room {room.roomNumber}
                    </button>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      Floor {room.floor}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px] block">{room.roomTypeName}</span>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">Awaiting Cleaner</span>
                    <button
                      onClick={() => handleUpdateStatus(room.id, 'Cleaning')}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10.5px] transition-colors"
                    >
                      <span>Start Cleaning</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: IN-PROGRESS (CLEANING) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="font-bold text-slate-100 text-xs">In-Progress</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-bold text-[10px]">
              {cleaningRooms.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {cleaningRooms.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-[11px]">No rooms currently being cleaned</div>
            ) : (
              cleaningRooms.map(room => (
                <div
                  key={room.id}
                  className="bg-slate-950 p-3 rounded-lg border border-blue-500/30 space-y-2 hover:border-blue-400 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <button
                      onClick={() => onSelectRoom(room.id)}
                      className="font-mono font-bold text-sm text-slate-100 hover:text-blue-400"
                    >
                      Room {room.roomNumber}
                    </button>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      Floor {room.floor}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px] block">{room.roomTypeName}</span>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-blue-400 animate-pulse">Staff in room...</span>
                    <button
                      onClick={() => handleUpdateStatus(room.id, 'Clean')}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10.5px] transition-colors"
                    >
                      <span>Mark Clean</span>
                      <CheckCircle2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: CLEAN */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-100 text-xs">Clean (Ready for Inspection)</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
              {cleanRooms.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {cleanRooms.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-[11px]">No clean rooms awaiting inspection</div>
            ) : (
              cleanRooms.map(room => (
                <div
                  key={room.id}
                  className="bg-slate-950 p-3 rounded-lg border border-emerald-500/30 space-y-2 hover:border-emerald-400 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <button
                      onClick={() => onSelectRoom(room.id)}
                      className="font-mono font-bold text-sm text-slate-100 hover:text-emerald-400"
                    >
                      Room {room.roomNumber}
                    </button>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      Floor {room.floor}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px] block">{room.roomTypeName}</span>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Needs Supervisor</span>
                    <button
                      onClick={() => handleUpdateStatus(room.id, 'Inspected')}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-[10.5px] transition-colors"
                    >
                      <span>Approve (Inspect)</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 4: INSPECTED */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="font-bold text-slate-100 text-xs">Inspected & Ready</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono font-bold text-[10px]">
              {inspectedRooms.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {inspectedRooms.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-[11px]">No inspected rooms</div>
            ) : (
              inspectedRooms.map(room => (
                <div
                  key={room.id}
                  className="bg-slate-950 p-3 rounded-lg border border-purple-500/30 space-y-2 hover:border-purple-400 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <button
                      onClick={() => onSelectRoom(room.id)}
                      className="font-mono font-bold text-sm text-slate-100 hover:text-purple-400"
                    >
                      Room {room.roomNumber}
                    </button>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      room.operationalStatus === 'Occupied' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {room.operationalStatus}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px] block">{room.roomTypeName}</span>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-purple-300 font-semibold">
                    <span>Supervisor Verified</span>
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
