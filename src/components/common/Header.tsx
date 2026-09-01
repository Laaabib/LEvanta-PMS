import React, { useState, useEffect } from 'react';
import {
  Search, Bell, HelpCircle, User as UserIcon,
  RefreshCw, PlusCircle, LogIn, Calendar, LayoutGrid, Sparkles, CheckCircle2,
  X
} from 'lucide-react';
import { pmsService } from '../../services/pmsService';
import { PmsDatabaseState } from '../../services/mockPmsDatabase';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenQuickReservation?: () => void;
  onOpenQuickCheckIn?: () => void;
  onNavigate: (route: string) => void;
  activeRoute?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenQuickReservation,
  onOpenQuickCheckIn,
  onNavigate,
  activeRoute
}) => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [showAlerts, setShowAlerts] = useState<boolean>(false);
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  useEffect(() => {
    const unsub = pmsService.subscribe(setDb);
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    }, 1000);

    const now = new Date();
    setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setDateStr(now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const unreadAlerts = db.alerts.filter(a => !a.read);
  const kpis = pmsService.getOperationalKPIs();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 select-none shadow-xs">
      {/* Left: Global Search Input */}
      <div className="relative w-72 md:w-96">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          onClick={onOpenSearch}
          readOnly
          className="block w-full pl-9 pr-12 py-2 border border-gray-200 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 text-gray-800 placeholder-gray-400 cursor-pointer shadow-xs"
          placeholder="Search Guests, Reservations, Rooms..."
        />
        <kbd className="absolute right-2.5 top-2.5 text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono border border-gray-300">
          Ctrl+K
        </kbd>
      </div>

      {/* Right: Technical Meters, Live Clock & User Controls */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Live Header Operational KPI Meters */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="text-center border-r border-gray-200 pr-4">
            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Occupancy</p>
            <p className="text-base sm:text-lg font-bold text-blue-600 font-mono leading-none mt-0.5">
              {kpis.occupancyRate}%
            </p>
          </div>
          <div className="text-center border-r border-gray-200 pr-4">
            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">In-House</p>
            <p className="text-base sm:text-lg font-bold text-gray-800 font-mono leading-none mt-0.5">
              {kpis.inHouseGuests}
            </p>
          </div>
          <div className="text-center border-r border-gray-200 pr-4">
            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Daily Revenue</p>
            <p className="text-base sm:text-lg font-bold text-gray-900 font-mono leading-none mt-0.5">
              ৳{kpis.todayRevenue.toLocaleString()}
            </p>
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-gray-700">{time}</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">{dateStr}</p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="hidden sm:flex items-center space-x-2">
          {onOpenQuickReservation && (
            <button
              onClick={onOpenQuickReservation}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Reservation</span>
            </button>
          )}
          {onOpenQuickCheckIn && (
            <button
              onClick={onOpenQuickCheckIn}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-md border border-gray-200 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
              <span>Walk-in</span>
            </button>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 relative transition-colors"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {showAlerts && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Operational Alerts</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-200 text-gray-700 font-mono font-bold">
                    {db.alerts.length}
                  </span>
                </div>
                <button
                  onClick={() => pmsService.clearAllAlerts()}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {db.alerts.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs">No active operational alerts</div>
                ) : (
                  db.alerts.map(alt => (
                    <div
                      key={alt.id}
                      className={`p-3 text-xs transition-colors hover:bg-gray-50 ${alt.read ? 'opacity-60' : 'bg-blue-50/30'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <span
                            className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                              alt.type === 'urgent' ? 'bg-red-500' :
                              alt.type === 'warning' ? 'bg-orange-500' :
                              alt.type === 'vip' ? 'bg-purple-500' :
                              alt.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                          />
                          <div>
                            <p className="font-semibold text-gray-800">{alt.title}</p>
                            <p className="text-gray-500 mt-0.5 text-[11px] leading-relaxed">{alt.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">{alt.timestamp}</span>
                          </div>
                        </div>
                        {alt.actionRoute && (
                          <button
                            onClick={() => {
                              setShowAlerts(false);
                              onNavigate(alt.actionRoute!);
                            }}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] rounded font-bold shrink-0 ml-2 shadow-xs"
                          >
                            {alt.actionLabel || 'View'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-md bg-gray-50 hover:bg-gray-100 text-xs text-gray-700 border border-gray-200 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
              {db.currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden md:block">
              <span className="font-bold block text-[11px] leading-tight text-gray-800 truncate max-w-[90px]">{db.currentUser.name}</span>
              <span className="text-[9px] text-blue-600 font-mono font-semibold block leading-none">{db.currentUser.role}</span>
            </div>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2 text-xs">
              <div className="p-2 border-b border-gray-100 mb-1">
                <p className="font-bold text-gray-800">{db.currentUser.name}</p>
                <p className="text-[11px] text-gray-500">{db.currentUser.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-bold border border-blue-200">
                  Role: {db.currentUser.role}
                </span>
              </div>
              <p className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Switch Staff Role (Test RBAC)
              </p>
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                {db.users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      pmsService.setCurrentUser(u.id);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between text-xs transition-colors ${
                      u.id === db.currentUser.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{u.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{u.role}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    pmsService.resetToSeed();
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-2 py-1 text-[11px] text-red-600 hover:bg-red-50 rounded flex items-center space-x-1.5 font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Database to Default Seed</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Guide / Help */}
        <button
          onClick={() => setShowHelp(true)}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          title="Operational Guide & Keyboard Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Operational Guide Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl max-w-lg w-full p-6 text-xs text-gray-700 shadow-2xl relative">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-gray-900">CCULB PMS Operational Guide</h3>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-gray-800">Keyboard Shortcuts:</h4>
                <div className="grid grid-cols-2 gap-2 mt-1 font-mono text-[11px]">
                  <div className="bg-gray-50 p-2 rounded border border-gray-200 flex justify-between">
                    <span className="text-gray-500">Global Search:</span>
                    <span className="text-blue-600 font-bold">Ctrl + K</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-200 flex justify-between">
                    <span className="text-gray-500">Close Drawer:</span>
                    <span className="text-blue-600 font-bold">Esc</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Operational Philosophy:</h4>
                <p className="text-gray-600 leading-relaxed text-[11px] mt-1">
                  CCULB PMS provides a technical data grid workflow for front-desk arrivals, room rack status, multi-hall banquet collision prevention, restaurant order posting, and cashiering folios.
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-[11px] text-blue-900">
                <span className="font-bold">Staff Role Testing:</span> Switch between <span className="font-bold">Front Desk, Housekeeping, Accounts, Event Manager</span> using the user menu at top right.
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
