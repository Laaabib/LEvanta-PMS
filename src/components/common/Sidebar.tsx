import React, { useState } from 'react';
import {
  LayoutDashboard, ConciergeBell, CalendarDays, CalendarRange,
  BedDouble, Grid3X3, Layers, Users, Sparkles, Wrench,
  Building2, PartyPopper, CalendarCheck, Package as PackageIcon,
  UtensilsCrossed, Receipt, CreditCard, FileText, BarChart3,
  Bell, ShieldCheck, Settings, ChevronDown, ChevronRight, Menu,
  X, CheckSquare, Moon, Palmtree, Landmark, Scale, BookOpen,
  Boxes, ChefHat, Truck, Trash2, ClipboardList, ShoppingCart,
  Clock, ArrowUpDown, ArrowRight, Award, BarChart2, DollarSign,
  Warehouse, Wine, Briefcase, HeartHandshake, UserCheck, Shield,
  Tag, Percent, Gift, Ban, CheckCircle2, Sliders, AlertTriangle
} from 'lucide-react';
import { pmsService } from '../../services/pmsService';
import { rbacService } from '../../services/rbacService';
import { MainModuleName } from '../../types/reportingAndRbac';

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
  moduleKey: MainModuleName;
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
    'front-office': true,
    'restaurant': false,
    'bar': false,
    'housekeeping': false,
    'banquet': false,
    'activities': false,
    'amenities': false,
    'procurement': false,
    'inventory': false,
    'menu-management': false,
    'finance': false,
    'sales-marketing': false,
    'crm': false,
    'hr': false,
    'reports': false,
    'administration': false
  });

  const db = pmsService.getState();
  const activeUser = rbacService.getActiveUser();

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      moduleKey: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'front-office',
      moduleKey: 'front-office',
      label: 'Front Office',
      icon: ConciergeBell,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      children: [
        { id: 'front-desk', label: 'Front Desk', icon: ConciergeBell },
        { id: 'reservations', label: 'Reservations', icon: CalendarDays },
        { id: 'reservation-calendar', label: 'Room Calendar', icon: CalendarRange },
        { id: 'front-desk-checkin', label: 'Check-In', icon: UserCheck },
        { id: 'front-desk-checkout', label: 'Check-Out', icon: ArrowRight },
        { id: 'room-rack', label: 'Room Assignment', icon: Grid3X3 },
        { id: 'guests', label: 'Guest Profile', icon: Users },
        { id: 'billing-folios', label: 'Guest Folio', icon: Receipt },
        { id: 'front-office-wakeup', label: 'Wake-Up Calls', icon: Clock },
        { id: 'room-types', label: 'Room Status', icon: Layers },
        { id: 'night-audit', label: 'Night Audit', icon: Moon },
        { id: 'reports-front-office', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      id: 'housekeeping',
      moduleKey: 'housekeeping',
      label: 'Housekeeping',
      icon: Sparkles,
      children: [
        { id: 'housekeeping-status', label: 'Room Status', icon: BedDouble },
        { id: 'housekeeping-cleaning', label: 'Room Cleaning', icon: Sparkles },
        { id: 'housekeeping-board', label: 'Housekeeping Board', icon: ClipboardList },
        { id: 'housekeeping-lost-found', label: 'Lost & Found', icon: Tag },
        { id: 'housekeeping-linen', label: 'Linen', icon: PackageIcon },
        { id: 'housekeeping-amenities', label: 'Amenities', icon: Palmtree },
        { id: 'housekeeping-requests', label: 'Housekeeping Requests', icon: Bell },
        { id: 'reports-housekeeping', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      id: 'restaurant',
      moduleKey: 'restaurant',
      label: 'Restaurant',
      icon: UtensilsCrossed,
      children: [
        { id: 'restaurant-pos', label: 'POS', icon: UtensilsCrossed },
        { id: 'restaurant-tables', label: 'Tables', icon: Grid3X3 },
        { id: 'restaurant-orders', label: 'Orders', icon: ClipboardList },
        { id: 'restaurant-kot', label: 'KOT', icon: ChefHat },
        { id: 'menu-catalog', label: 'Menu', icon: BookOpen },
        { id: 'menu-modifiers', label: 'Modifiers', icon: Layers },
        { id: 'restaurant-discounts', label: 'Discounts', icon: Percent },
        { id: 'restaurant-complimentary', label: 'Complimentary', icon: Gift },
        { id: 'restaurant-voids', label: 'Voids', icon: Ban },
        { id: 'restaurant-settlements', label: 'Settlements', icon: CreditCard },
        { id: 'reports-restaurant', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      id: 'bar',
      moduleKey: 'bar',
      label: 'Bar',
      icon: Wine,
      children: [
        { id: 'bar-pos', label: 'POS', icon: Wine },
        { id: 'bar-orders', label: 'Orders', icon: ClipboardList },
        { id: 'bar-menu', label: 'Menu', icon: BookOpen },
        { id: 'bar-recipes', label: 'Recipes', icon: ChefHat },
        { id: 'bar-modifiers', label: 'Modifiers', icon: Layers },
        { id: 'bar-discounts', label: 'Discounts', icon: Percent },
        { id: 'bar-voids', label: 'Voids', icon: Ban },
        { id: 'bar-settlements', label: 'Settlements', icon: CreditCard },
        { id: 'reports-bar', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      id: 'banquet',
      moduleKey: 'banquet',
      label: 'Banquet & Convention',
      icon: Building2,
      children: [
        { id: 'convention-events', label: 'Events', icon: PartyPopper },
        { id: 'convention-calendar', label: 'Event Calendar', icon: CalendarCheck },
        { id: 'admin-halls', label: 'Hall Management', icon: Building2 },
        { id: 'convention-packages', label: 'Packages', icon: PackageIcon },
        { id: 'banquet-function-sheets', label: 'Function Sheets', icon: FileText },
        { id: 'banquet-billing', label: 'Event Billing', icon: Receipt },
        { id: 'banquet-deposits', label: 'Deposits', icon: DollarSign },
        { id: 'reports-banquet', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      id: 'activities',
      moduleKey: 'activities',
      label: 'Activities',
      icon: Palmtree,
      children: [
        { id: 'activities-master', label: 'Activity Master', icon: Palmtree },
        { id: 'activities-booking', label: 'Booking', icon: CalendarCheck },
        { id: 'activities-scheduling', label: 'Scheduling', icon: Clock },
        { id: 'activities-capacity', label: 'Capacity', icon: Users },
        { id: 'activities-billing', label: 'Activity Billing', icon: Receipt },
        { id: 'reports-activities', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      id: 'amenities',
      moduleKey: 'amenities',
      label: 'Amenities',
      icon: Gift,
      children: [
        { id: 'amenities-master', label: 'Amenity Master', icon: Gift },
        { id: 'amenities-issuance', label: 'Amenity Issuance', icon: PackageIcon },
        { id: 'amenities-requests', label: 'Guest Requests', icon: Bell },
        { id: 'amenities-billing', label: 'Amenity Billing', icon: Receipt },
        { id: 'reports-amenities', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      id: 'procurement',
      moduleKey: 'procurement',
      label: 'Procurement',
      icon: ShoppingCart,
      children: [
        { id: 'inventory-requisitions', label: 'Requisitions', icon: FileText },
        { id: 'inventory-purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
        { id: 'inventory-grn', label: 'Goods Received', icon: Truck },
        { id: 'procurement-bills', label: 'Purchase Bills', icon: Receipt },
        { id: 'procurement-returns', label: 'Purchase Returns', icon: ArrowUpDown },
        { id: 'inventory-suppliers', label: 'Suppliers', icon: Users },
        { id: 'procurement-approvals', label: 'Approval Center', icon: CheckCircle2 },
        { id: 'reports-procurement', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      id: 'inventory',
      moduleKey: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      children: [
        { id: 'inventory-dashboard', label: 'Inventory Dashboard', icon: LayoutDashboard },
        { id: 'inventory-items', label: 'Items', icon: PackageIcon },
        { id: 'inventory-categories', label: 'Categories', icon: Layers },
        { id: 'inventory-units', label: 'Units', icon: Tag },
        { id: 'inventory-warehouses', label: 'Warehouses', icon: Warehouse },
        { id: 'inventory-stock-levels', label: 'Stock', icon: Boxes },
        { id: 'inventory-ledger', label: 'Stock Ledger', icon: Receipt },
        { id: 'inventory-transfers', label: 'Stock Transfer', icon: ArrowUpDown },
        { id: 'inventory-issue', label: 'Stock Issue', icon: Truck },
        { id: 'inventory-wastage', label: 'Wastage', icon: Trash2 },
        { id: 'inventory-physical-counts', label: 'Physical Count', icon: ClipboardList },
        { id: 'inventory-expiry', label: 'Expiry', icon: Clock },
        { id: 'reports-inventory', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      id: 'menu-management',
      moduleKey: 'menu-management',
      label: 'Menu Management',
      icon: ChefHat,
      children: [
        { id: 'menu-catalog', label: 'Menu Items', icon: BookOpen },
        { id: 'menu-categories', label: 'Categories', icon: Layers },
        { id: 'menu-recipes', label: 'Recipes', icon: ChefHat },
        { id: 'menu-ingredients', label: 'Ingredients', icon: PackageIcon },
        { id: 'menu-modifiers', label: 'Modifiers', icon: Layers },
        { id: 'menu-pricing', label: 'Pricing', icon: DollarSign },
        { id: 'menu-service-charge', label: 'Service Charge', icon: Percent },
        { id: 'menu-tax', label: 'Tax', icon: Scale },
        { id: 'menu-versions', label: 'Menu Versions', icon: Clock },
        { id: 'reports-menu', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      id: 'finance',
      moduleKey: 'finance',
      label: 'Finance & Accounts',
      icon: Landmark,
      children: [
        { id: 'accounting-city-ledger', label: 'Accounts Receivable', icon: Building2 },
        { id: 'finance-ap', label: 'Accounts Payable', icon: ShoppingCart },
        { id: 'billing-folios', label: 'Guest Ledger', icon: Receipt },
        { id: 'inventory-suppliers', label: 'Supplier Ledger', icon: Users },
        { id: 'finance-cash-bank', label: 'Cash & Bank', icon: DollarSign },
        { id: 'accounting-gl', label: 'General Ledger', icon: BookOpen },
        { id: 'accounting-jv', label: 'Journal Entries', icon: Scale },
        { id: 'accounting-chart', label: 'Chart of Accounts', icon: BookOpen },
        { id: 'accounting-mapping', label: 'Accounting Mapping', icon: Layers },
        { id: 'finance-taxes', label: 'Taxes', icon: Percent },
        { id: 'billing-payments', label: 'Payments', icon: CreditCard },
        { id: 'billing-invoices', label: 'Receipts', icon: FileText },
        { id: 'reports-finance', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      id: 'sales-marketing',
      moduleKey: 'sales-marketing',
      label: 'Sales & Marketing',
      icon: Briefcase,
      children: [
        { id: 'sales-corporate', label: 'Corporate Accounts', icon: Building2 },
        { id: 'sales-agents', label: 'Travel Agents', icon: Users },
        { id: 'sales-activities', label: 'Sales Activities', icon: CalendarCheck },
        { id: 'sales-leads', label: 'Leads', icon: Tag },
        { id: 'sales-contracts', label: 'Contracts', icon: FileText },
        { id: 'sales-promotions', label: 'Promotions', icon: Gift },
        { id: 'reports-sales', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      id: 'crm',
      moduleKey: 'crm',
      label: 'CRM',
      icon: HeartHandshake,
      children: [
        { id: 'guests', label: 'Guests', icon: Users },
        { id: 'crm-companies', label: 'Companies', icon: Building2 },
        { id: 'crm-vip', label: 'VIP', icon: Award },
        { id: 'crm-preferences', label: 'Preferences', icon: Sparkles },
        { id: 'crm-feedback', label: 'Feedback', icon: HeartHandshake },
        { id: 'reports-crm', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      id: 'hr',
      moduleKey: 'hr',
      label: 'Human Resources',
      icon: Users,
      children: [
        { id: 'hr-employees', label: 'Employees', icon: Users },
        { id: 'hr-departments', label: 'Departments', icon: Building2 },
        { id: 'hr-attendance', label: 'Attendance', icon: Clock },
        { id: 'hr-leave', label: 'Leave', icon: CalendarCheck },
        { id: 'reports-hr', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      id: 'reports',
      moduleKey: 'reports',
      label: 'Reports',
      icon: BarChart3,
      badge: 'Hub',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      children: [
        { id: 'reports-dashboard', label: 'Report Dashboard', icon: LayoutDashboard },
        { id: 'reports-front-office', label: 'Front Office Reports', icon: ConciergeBell },
        { id: 'reports-housekeeping', label: 'Housekeeping Reports', icon: Sparkles },
        { id: 'reports-restaurant', label: 'Restaurant Reports', icon: UtensilsCrossed },
        { id: 'reports-bar', label: 'Bar Reports', icon: Wine },
        { id: 'reports-banquet', label: 'Banquet Reports', icon: Building2 },
        { id: 'reports-activities', label: 'Activities Reports', icon: Palmtree },
        { id: 'reports-amenities', label: 'Amenities Reports', icon: Gift },
        { id: 'reports-procurement', label: 'Procurement Reports', icon: ShoppingCart },
        { id: 'reports-inventory', label: 'Inventory Reports', icon: Boxes },
        { id: 'reports-menu', label: 'Menu & Costing Reports', icon: ChefHat },
        { id: 'reports-sales', label: 'Sales & Marketing Reports', icon: Briefcase },
        { id: 'reports-ar', label: 'Accounts Receivable Reports', icon: Receipt },
        { id: 'reports-ap', label: 'Accounts Payable Reports', icon: ShoppingCart },
        { id: 'reports-gl', label: 'General Ledger Reports', icon: Landmark },
        { id: 'reports-financial', label: 'Financial Reports', icon: DollarSign },
        { id: 'reports-tax', label: 'Tax Reports', icon: Scale },
        { id: 'reports-management', label: 'Management Reports', icon: Award },
        { id: 'reports-audit', label: 'Audit Reports', icon: CheckSquare },
        { id: 'reports-custom', label: 'Custom Reports', icon: Sliders }
      ]
    },
    {
      id: 'administration',
      moduleKey: 'administration',
      label: 'Administration',
      icon: ShieldCheck,
      children: [
        { id: 'admin-users', label: 'Users', icon: Users },
        { id: 'admin-roles', label: 'Roles', icon: Shield },
        { id: 'admin-permissions', label: 'Permissions', icon: Sliders },
        { id: 'admin-departments', label: 'Departments', icon: Building2 },
        { id: 'admin-outlets', label: 'Outlets', icon: UtensilsCrossed },
        { id: 'admin-approvals', label: 'Approval Rules', icon: CheckCircle2 },
        { id: 'admin-mapping', label: 'Accounting Mapping', icon: Layers },
        { id: 'admin-tax', label: 'Tax Configuration', icon: Percent },
        { id: 'admin-service-charge', label: 'Service Charge', icon: DollarSign },
        { id: 'admin-numbering', label: 'Numbering', icon: Tag },
        { id: 'settings', label: 'System Settings', icon: Settings },
        { id: 'admin-audit', label: 'Audit Log', icon: CheckSquare }
      ]
    }
  ];

  const handleItemClick = (id: string, hasChildren?: boolean) => {
    if (hasChildren) {
      toggleSection(id);
    } else {
      onNavigate(id);
      onCloseMobile();
    }
  };

  const isChildActive = (children?: { id: string }[]) => {
    return children?.some(c => c.id === currentRoute);
  };

  // Filter nav items by RBAC allowed modules
  const allowedNavItems = navItems.filter(item => rbacService.isModuleAllowed(item.moduleKey));

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
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#0F172A] text-slate-100 border-r border-slate-800 transition-all duration-200 flex flex-col ${
          collapsed ? 'w-16' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Brand & Resort Title */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!collapsed ? (
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <h1 className="text-lg font-bold tracking-tight text-amber-400 font-mono">
                  CCULB <span className="text-white">PMS</span>
                </h1>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 mt-0.5 font-semibold">
                Resort & Convention Hall
              </p>
            </div>
          ) : (
            <div className="mx-auto w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-sm">
              C
            </div>
          )}
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto py-2.5 px-2.5 space-y-1 text-xs scrollbar-thin">
          {allowedNavItems.map(item => {
            const Icon = item.icon;
            const hasChildren = !!item.children && item.children.length > 0;
            const active = currentRoute === item.id || (hasChildren && isChildActive(item.children));
            const isOpen = openSections[item.id];

            if (hasChildren && !collapsed) {
              return (
                <div key={item.id} className="space-y-0.5">
                  <button
                    onClick={() => toggleSection(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      active
                        ? 'text-white bg-slate-800/90 font-bold border border-slate-700/60'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="pl-4 pr-1 py-1 space-y-0.5 border-l border-slate-800 ml-3">
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
                            className={`w-full text-left px-2 py-1.5 rounded-md flex items-center space-x-2 text-[11px] transition-colors ${
                              subActive
                                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                            }`}
                          >
                            <SubIcon className="w-3 h-3 opacity-70" />
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
                  collapsed ? 'justify-center px-0' : 'justify-between px-2.5'
                } py-1.5 rounded-lg transition-colors text-xs font-semibold ${
                  active
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Account & Department Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#0B0F17]">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-xs text-amber-300 shrink-0">
                  {activeUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">{activeUser.name}</p>
                  <p className="text-[10px] text-amber-400/90 truncate">{activeUser.roleName}</p>
                  <span className="text-[9px] text-slate-400 truncate block">{activeUser.department}</span>
                </div>
              </div>
              <button
                onClick={onToggleCollapse}
                className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800"
                title="Collapse sidebar"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center text-slate-400 hover:text-white py-1"
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
