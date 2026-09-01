import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Utensils, CheckCircle2, Building, Flame } from 'lucide-react';
import { pmsService } from '../services/pmsService';
import { PmsDatabaseState } from '../services/mockPmsDatabase';

export const ConventionPackagesView: React.FC = () => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());

  useEffect(() => {
    return pmsService.subscribe(setDb);
  }, []);

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center border border-purple-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">Banquet Packages & Convention Halls</h1>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                {db.packages.length} Packages • {db.halls.length} Halls
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Standard per-person catering rates, conference amenities, audio-visual specs, and hall capacities.
            </p>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {db.packages.map(pkg => (
          <div
            key={pkg.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-purple-500/40 transition-colors shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-100 text-sm">{pkg.name}</h3>
                <span className="text-base font-black text-purple-300 font-mono">
                  ৳{pkg.price.toLocaleString()}
                  <span className="text-[10px] text-slate-500 font-normal block">/ package</span>
                </span>
              </div>

              <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">{pkg.description}</p>

              <div className="mt-3 pt-3 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Package Inclusions:
                </span>
                <div className="space-y-1">
                  {pkg.includes.map((inc, i) => (
                    <div key={i} className="flex items-center space-x-2 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Convention Halls Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <h3 className="font-bold text-slate-100 text-sm">Convention Hall Specifications</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {db.halls.map(hall => (
            <div key={hall.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-400 text-xs">{hall.name}</span>
                <span className="font-mono text-slate-200 font-bold text-xs">৳{hall.baseRatePerDay.toLocaleString()}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Max Capacity: <strong className="text-slate-200 font-mono">{hall.capacity} Guests</strong></span>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {hall.amenities.map((am, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {am}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
