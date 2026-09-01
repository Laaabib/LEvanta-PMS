import React, { useState } from 'react';
import {
  LayoutDashboard, ConciergeBell, CalendarDays, CalendarRange,
  BedDouble, Grid3X3, Layers, Users, Sparkles, Wrench,
  Building2, PartyPopper, CalendarCheck, Package as PackageIcon,
  UtensilsCrossed, Receipt, CreditCard, FileText, BarChart3,
  Bell, ShieldCheck, Settings, ChevronDown, ChevronRight, Menu,
  X, CheckSquare, Moon
} from 'lucide-react';
import { pmsService } from '../../services/pmsService';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  children?: { id: string; label: string; icon?: React.ElementType }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    reservations: true,
    rooms: true,
    convention: true,
    billing: true,
    administration: false
  });

  const db = pmsService.getState();

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'front-desk',
      label: 'Front Desk',
      icon: ConciergeBell,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'reservations-group',
      label: 'Reservations',
      icon: CalendarDays,
      children: [
        { id: 'reservations', label: 'All Reservations', icon: CalendarDays },
        { id: 'reservation-calendar', label: 'Room Calendar', icon: CalendarRange }
      ]
    },
    {
      id: 'rooms-group',
      label: 'Room Rack',
      icon: BedDouble,
      children: [
        { id: 'room-rack', label: 'Live Grid Rack', icon: Grid3X3 },
        { id: 'room-types', label: 'Room Types & Rates', icon: Layers }
      ]
    },
    {
      id: 'guests',
      label: 'Guest Profiles',
      icon: Users
    },
    {
      id: 'housekeeping',
      label: 'Housekeeping',
      icon: Sparkles
    },
    {
      id: 'maintenance',
      label: 'Engineering / Work Orders',
      icon: Wrench
    },
    {
      id: 'convention-group',
      label: 'Convention & Banquet',
      icon: Building2,
      children: [
        { id: 'convention-events', label: 'Hall Bookings', icon: PartyPopper },
        { id: 'convention-calendar', label: 'Banquet Schedule', icon: CalendarCheck },
        { id: 'convention-packages', label: 'Catering Packages', icon: PackageIcon }
      ]
    },
    {
      id: 'restaurant',
      label: 'Restaurant POS',
      icon: UtensilsCrossed
    },
    {
      id: 'billing-group',
      label: 'Billing & Folios',
      icon: Receipt,
      children: [
        { id: 'billing-folios', label: 'Guest Folios', icon: Receipt },
        { id: 'billing-payments', label: 'Payment Transactions', icon: CreditCard },
        { id: 'billing-invoices', label: 'Invoices & Invoicing', icon: FileText }
      ]
    },
    {
      id: 'night-audit',
      label: 'Night Audit (05:00 AM)',
      icon: Moon,
      badge: 'Auto',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3
    },
    {
      id: 'alerts',
      label: 'Operational Alerts',
      icon: Bell
    },
    {
      id: 'administration-group',
      label: 'Administration',
      icon: ShieldCheck,
      children: [
        { id: 'admin-rooms', label: 'Room Inventory Setup', icon: BedDouble },
        { id: 'admin-halls', label: 'Convention Halls & Venues', icon: Building2 },
        { id: 'admin-users', label: 'Staff & RBAC Permissions', icon: Users },
        { id: 'admin-audit', label: 'Security Audit Trail', icon: CheckSquare }
      ]
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings
    }
  ];

  const handleItemClick = (id: string, isParentWithChildren?: boolean) => {
    if (isParentWithChildren) {
      toggleSection(id);
    } else {
      onNavigate(id);
      onCloseMobile();
    }
  };

  const isChildActive = (children?: { id: string }[]) => {
    return children?.some(c => c.id === currentRoute);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#111827] text-white border-r border-gray-800 transition-all duration-200 flex flex-col ${
          collapsed ? 'w-16' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Brand & Resort Title */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          {!collapsed ? (
            <div>
              <h1 className="text-xl font-bold tracking-tight text-blue-400">
                CCULB <span className="text-white">PMS</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">
                Resort & Convention
              </p>
            </div>
          ) : (
            <div className="mx-auto w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              C
            </div>
          )}
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 text-sm">
          {navItems.map(item => {
            const Icon = item.icon;
            const hasChildren = !!item.children;
            const active = currentRoute === item.id || (hasChildren && isChildActive(item.children));
            const isOpen = openSections[item.id];

            if (hasChildren && !collapsed) {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => toggleSection(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'text-white bg-gray-800/80 font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="pl-6 pr-1 py-1 space-y-1 border-l border-gray-800 ml-4">
                      {item.children?.map(sub => {
                        const SubIcon = sub.icon || Icon;
                        const subActive = currentRoute === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              onNavigate(sub.id);
                              onCloseMobile();
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center space-x-2 text-xs transition-colors ${
                              subActive
                                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                            }`}
                          >
                            <SubIcon className="w-3.5 h-3.5 opacity-80" />
                            <span className="truncate">{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id, hasChildren)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  collapsed ? 'justify-center px-0' : 'justify-between px-3'
                } py-2 rounded-md transition-colors text-sm ${
                  active
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50 font-medium'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Account / Profile Footer */}
        <div className="p-3 border-t border-gray-800 bg-[#0B0F17]">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs">
                  {db.currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{db.currentUser.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">Shift: Morning • {db.currentUser.role}</p>
                </div>
              </div>
              <button
                onClick={onToggleCollapse}
                className="text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-gray-800"
                title="Collapse sidebar"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center text-gray-400 hover:text-white py-1"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
