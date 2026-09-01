import React, { useState, useEffect } from 'react';
import {
  BedDouble, Users, Calendar, LogIn, LogOut, DollarSign,
  TrendingUp, Sparkles, Wrench, AlertCircle, ArrowUpRight,
  PlusCircle, Search, RefreshCw, PartyPopper, CheckCircle2,
  CalendarDays, Building2, Receipt
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { pmsService } from '../services/pmsService';
import { PmsDatabaseState } from '../services/mockPmsDatabase';

interface DashboardViewProps {
  onNavigate: (route: string) => void;
  onOpenCheckIn: () => void;
  onOpenNewReservation: () => void;
  onSelectRoom: (roomId: string) => void;
  onSelectStay: (stayId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenCheckIn,
  onOpenNewReservation,
  onSelectRoom,
  onSelectStay
}) => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());

  useEffect(() => {
    return pmsService.subscribe(setDb);
  }, []);

  const kpis = pmsService.getOperationalKPIs();
  const todayStr = new Date().toISOString().split('T')[0];

  // Room Status Distribution for Pie Chart
  const statusData = [
    { name: 'Occupied', value: kpis.occupiedRooms, color: '#2563eb' },
    { name: 'Available', value: kpis.availableRooms, color: '#10b981' },
    { name: 'Reserved', value: kpis.reservedRooms, color: '#f59e0b' },
    { name: 'Dirty / Turnover', value: kpis.dirtyRooms, color: '#ef4444' },
    { name: 'Out of Order', value: kpis.oooRooms, color: '#64748b' }
  ].filter(d => d.value > 0);

  // 7-Day Revenue Trend
  const revenueTrend = [
    { day: 'Mon', revenue: 145000, occupancy: 72 },
    { day: 'Tue', revenue: 180000, occupancy: 80 },
    { day: 'Wed', revenue: 165000, occupancy: 75 },
    { day: 'Thu', revenue: 210000, occupancy: 88 },
    { day: 'Fri', revenue: 290000, occupancy: 95 },
    { day: 'Sat', revenue: 340000, occupancy: 100 },
    { day: 'Sun', revenue: kpis.todayRevenue > 0 ? kpis.todayRevenue : 220000, occupancy: kpis.occupancyRate }
  ];

  // Active in-house stays and arrivals
  const activeStays = db.stays.filter(s => s.status === 'Active');
  const todayArrivals = db.reservations.filter(r => r.arrivalDate === todayStr && r.status === 'Confirmed');
  const todayDepartures = db.stays.filter(s => s.expectedCheckOutAt.startsWith(todayStr) && s.status === 'Active');
  const checkedInToday = db.stays.filter(s => s.checkInAt.startsWith(todayStr));

  return (
    <div className="space-y-6 text-gray-900">
      {/* 1. Primary Technical KPI Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Arrivals Today */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Arrivals Today</p>
            <p className="text-2xl font-bold mt-1 text-blue-600 font-mono">{todayArrivals.length + checkedInToday.length}</p>
          </div>
          <div className="mt-2 text-[10px] text-green-600 font-medium">
            {checkedInToday.length} Checked In • {todayArrivals.length} Pending
          </div>
        </div>

        {/* Departures */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Departures</p>
            <p className="text-2xl font-bold mt-1 text-orange-600 font-mono">
              {todayDepartures.length.toString().padStart(2, '0')}
            </p>
          </div>
          <div className="mt-2 text-[10px] text-gray-500 font-medium">
            {todayDepartures.length} In-House Pending Checkout
          </div>
        </div>

        {/* Room Status */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Room Status</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[10px] font-bold text-gray-700">{kpis.availableRooms} AVAILABLE</span>
              <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
              <span className="text-[10px] font-bold text-gray-700">{kpis.dirtyRooms} DIRTY</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-blue-600 font-medium font-mono">
            {kpis.occupiedRooms} OCCUPIED ({kpis.occupancyRate}%)
          </div>
        </div>

        {/* Daily Revenue */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Daily Revenue</p>
            <p className="text-2xl font-bold mt-1 text-gray-900 font-mono">৳{kpis.todayRevenue.toLocaleString()}</p>
          </div>
          <div className="mt-2 text-[10px] text-blue-600 font-medium">
            ADR: ৳{kpis.adr.toLocaleString()} • RevPAR: ৳{kpis.revpar.toLocaleString()}
          </div>
        </div>
      </section>

      {/* 2. Technical Data Grid + Quick Operations & Alerts Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Cols: Pending Arrivals Data Grid */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-sm text-gray-700 uppercase tracking-tight">Pending Arrivals (Today)</h2>
              <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-mono font-bold border border-blue-200">
                {todayArrivals.length} Queued
              </span>
            </div>
            <button
              onClick={() => onNavigate('reservations')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              VIEW ALL
            </button>
          </div>

          <div className="flex-1 overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2.5 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">Guest Name</th>
                  <th className="px-4 py-2.5 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">Room Type</th>
                  <th className="px-4 py-2.5 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">Stay</th>
                  <th className="px-4 py-2.5 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">Balance</th>
                  <th className="px-4 py-2.5 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {todayArrivals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-400">
                      All expected arrivals for today have been checked in or none scheduled.
                    </td>
                  </tr>
                ) : (
                  todayArrivals.map(res => {
                    const balance = res.totalAmount - res.paidAmount;
                    return (
                      <tr key={res.id} className="hover:bg-blue-50/60 cursor-pointer transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900">{res.guestName}</p>
                          <p className="text-[11px] text-gray-400">{res.guestPhone}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 font-medium">
                          {res.roomTypeName}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                          {res.departureDate}
                        </td>
                        <td className="px-4 py-3 text-xs font-bold font-mono">
                          {balance > 0 ? (
                            <span className="text-red-500">৳{balance.toLocaleString()}</span>
                          ) : (
                            <span className="text-green-600">PAID</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onOpenCheckIn()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-[10px] font-bold shadow-xs transition-colors"
                          >
                            CHECK IN
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

        {/* Right 1-Col: Quick Operations & Operational Alerts Widget */}
        <div className="flex flex-col gap-6">
          {/* Quick Operations Box */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs flex flex-col p-4">
            <h2 className="font-bold text-sm text-gray-700 uppercase tracking-tight mb-4">Quick Operations</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onOpenNewReservation}
                className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-blue-300 group transition-all"
              >
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase text-gray-700">Reservation</span>
              </button>

              <button
                onClick={onOpenCheckIn}
                className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-blue-300 group transition-all"
              >
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center text-green-600 mb-2 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <LogIn className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase text-gray-700">Walk-in</span>
              </button>

              <button
                onClick={() => onNavigate('convention-events')}
                className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-blue-300 group transition-all"
              >
                <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center text-purple-600 mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase text-gray-700">Event Hall</span>
              </button>

              <button
                onClick={() => onNavigate('front-desk')}
                className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-blue-300 group transition-all"
              >
                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center text-red-600 mb-2 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase text-gray-700">Check-out</span>
              </button>
            </div>
          </div>

          {/* Operational Alerts Dark Technical Box */}
          <div className="bg-[#1E293B] rounded-lg shadow-xs p-4 text-white overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[10px] uppercase tracking-widest text-blue-400">Operational Alerts</h2>
              <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black">
                {db.alerts.filter(a => !a.read).length} URGENT
              </span>
            </div>
            <div className="space-y-3">
              {db.alerts.slice(0, 3).map((alt, idx) => (
                <div
                  key={alt.id}
                  className={`flex gap-3 items-start border-l-2 pl-3 py-1 ${
                    idx === 0 ? 'border-red-500' : idx === 1 ? 'border-orange-500' : 'border-blue-500'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-100">{alt.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{alt.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Revenue Analytics & Active In-House Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-xs p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-gray-800 uppercase tracking-tight">Revenue & Occupancy Velocity</h3>
              <p className="text-gray-400 text-xs mt-0.5">Daily room tariffs, catering events, and restaurant billings</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center space-x-1"
            >
              <span>Full Reports</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `৳${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', color: '#1e293b' }}
                  formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live In-House Quick List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
            <div className="flex items-center space-x-2">
              <BedDouble className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-xs uppercase text-gray-700">In-House Stays ({activeStays.length})</h3>
            </div>
            <button
              onClick={() => onNavigate('front-desk')}
              className="text-[11px] text-blue-600 font-bold hover:underline"
            >
              Front Desk
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-60">
            {activeStays.slice(0, 5).map(stay => (
              <div
                key={stay.id}
                onClick={() => onSelectStay(stay.id)}
                className="p-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-md flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                    {stay.roomNumber}
                  </span>
                  <div>
                    <p className="font-semibold text-xs text-gray-800 leading-tight">{stay.guestName}</p>
                    <p className="text-[10px] text-gray-400">{stay.roomTypeName}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">Out: {stay.expectedCheckOutAt ? stay.expectedCheckOutAt.split('T')[0] : 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
