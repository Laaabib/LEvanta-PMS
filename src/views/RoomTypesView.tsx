import React from 'react';
import { Layers, Users, BedDouble, CheckCircle2, Sparkles } from 'lucide-react';
import { pmsService } from '../services/pmsService';

export const RoomTypesView: React.FC = () => {
  const db = pmsService.getState();

  return (
    <div className="space-y-4 text-xs text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center border border-cyan-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">Room Categories & Tariff Master</h1>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                {db.roomTypes.length} Configured Types
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Standard base rates, maximum adult/child occupancy limits, and luxury amenities.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {db.roomTypes.map(rt => {
          const roomCount = db.rooms.filter(r => r.roomTypeId === rt.id).length;
          return (
            <div
              key={rt.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{rt.name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">{roomCount} Units Available</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400 font-mono">৳{rt.baseRate.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 block">/ night</span>
                  </div>
                </div>

                <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">{rt.description}</p>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px]">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Max {rt.maxAdults} Adults, {rt.maxChildren} Child</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <BedDouble className="w-3.5 h-3.5 text-amber-400" />
                    <span>Active: {rt.active ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Included Amenities:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {rt.amenities.map((am, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[10.5px] border border-slate-800"
                      >
                        {am}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
