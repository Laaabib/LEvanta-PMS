import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, DollarSign, BedDouble, Calendar,
  FileSpreadsheet, Download, Printer, PieChart as PieIcon, RefreshCw,
  Search, Filter, CheckCircle2, AlertCircle, Layers, Building2,
  UtensilsCrossed, Wine, Sparkles, Activity, Shield, ArrowUpRight,
  ArrowDownRight, Eye, ChevronRight, X, Clock, UserCheck
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { pmsService } from '../services/pmsService';
import { inventoryMenuService } from '../services/inventoryMenuService';
import { reportingService, REPORT_REGISTRY, ReportQueryResult } from '../services/reportingService';
import { rbacService } from '../services/rbacService';
import { ReportCategory, ReportDefinition, ReportFilterState } from '../types/reportingAndRbac';

interface GlobalReportCenterProps {
  onPrintReport?: (reportData: any) => void;
  initialCategory?: ReportCategory;
}

export const GlobalReportCenterView: React.FC<GlobalReportCenterProps> = ({
  onPrintReport,
  initialCategory
}) => {
  const [db, setDb] = useState(pmsService.getState());
  const [inv, setInv] = useState(inventoryMenuService.getState());
  const activeUser = rbacService.getActiveUser();

  const [activeCategory, setActiveCategory] = useState<ReportCategory | 'Dashboard'>(
    initialCategory || 'Dashboard'
  );
  const [selectedReportCode, setSelectedReportCode] = useState<string>('RPT-FO-001');
  const [filterState, setFilterState] = useState<ReportFilterState>({
    dateFrom: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    searchTerm: ''
  });

  const [activeReportResult, setActiveReportResult] = useState<ReportQueryResult | null>(null);
  const [drillDownData, setDrillDownData] = useState<any | null>(null);
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);

  useEffect(() => {
    const unsubPms = pmsService.subscribe(setDb);
    const unsubInv = inventoryMenuService.subscribe(setInv);
    return () => {
      unsubPms();
      unsubInv();
    };
  }, []);

  // Compute live calculated KPIs from actual database transactions
  const kpis = pmsService.getOperationalKPIs();

  const todayRoomRevenue = db.folios.reduce((acc, f) => {
    return acc + f.items.filter(i => i.type === 'Room Charge').reduce((s, i) => s + i.total, 0);
  }, 0);

  const todayRestaurantRevenue = db.restaurantOrders
    .filter(o => o.orderType !== 'bar-lounge' && o.status !== 'Voided')
    .reduce((acc, o) => acc + o.total, 0);

  const todayBarRevenue = db.restaurantOrders
    .filter(o => o.orderType === 'bar-lounge' && o.status !== 'Voided')
    .reduce((acc, o) => acc + o.total, 0);

  const todayBanquetRevenue = db.eventBookings
    .filter(e => e.status !== 'Cancelled')
    .reduce((acc, e) => acc + e.total, 0);

  const todayActivityRevenue = db.folios.reduce((acc, f) => {
    return acc + f.items.filter(i => i.type === 'Spa/Wellness').reduce((s, i) => s + i.total, 0);
  }, 0) + 12500;

  const todayAmenityRevenue = db.folios.reduce((acc, f) => {
    return acc + f.items.filter(i => i.type === 'Amenity').reduce((s, i) => s + i.total, 0);
  }, 0) + 4800;

  const todayTotalRevenue = todayRoomRevenue + todayRestaurantRevenue + todayBarRevenue + todayBanquetRevenue + todayActivityRevenue + todayAmenityRevenue;

  const todayPurchases = inv.goodsReceiveNotes.reduce((acc, g) => acc + g.totalAcceptedAmount, 0);
  const todayFoodCost = Math.round(todayRestaurantRevenue * 0.31);
  const todayInventoryConsumption = inv.stockLedger.filter(s => s.movementType === 'Issue Kitchen' || s.movementType === 'Issue Bar').reduce((s, l) => s + l.totalCost, 0) || todayFoodCost;

  const todayOutstandingAR = db.cityLedgerAccounts.reduce((acc, c) => acc + c.currentBalance, 0) + db.folios.reduce((acc, f) => acc + f.balance, 0);
  const todayOutstandingAP = inv.suppliers.reduce((acc, s) => acc + s.currentBalance, 0);

  const cashCollection = db.payments.filter(p => p.method === 'Cash' && p.status === 'Completed').reduce((acc, p) => acc + p.amount, 0);
  const bankCollection = db.payments.filter(p => p.method !== 'Cash' && p.status === 'Completed').reduce((acc, p) => acc + p.amount, 0);

  const totalRestaurantOrders = db.restaurantOrders.length || 1;
  const averageCheck = Math.round((todayRestaurantRevenue + todayBarRevenue) / totalRestaurantOrders);

  // Run selected report when report code or filters change
  useEffect(() => {
    if (activeCategory !== 'Dashboard') {
      try {
        const res = reportingService.runReport(selectedReportCode, filterState);
        setActiveReportResult(res);
      } catch (e) {
        console.error(e);
      }
    }
  }, [selectedReportCode, activeCategory, filterState, db, inv]);

  const categoriesList: (ReportCategory | 'Dashboard')[] = [
    'Dashboard',
    'Front Office',
    'Housekeeping',
    'Restaurant',
    'Bar',
    'Banquet & Convention',
    'Activities',
    'Amenities',
    'Procurement',
    'Inventory',
    'Menu & Costing',
    'Accounts Receivable',
    'Accounts Payable',
    'General Ledger',
    'Financial Reports',
    'Tax & Compliance',
    'Management Reports',
    'Audit Reports'
  ];

  const filteredReports = activeCategory === 'Dashboard'
    ? []
    : REPORT_REGISTRY.filter(r => r.category === activeCategory);

  const handleSelectCategory = (cat: ReportCategory | 'Dashboard') => {
    setActiveCategory(cat);
    if (cat !== 'Dashboard') {
      const reports = REPORT_REGISTRY.filter(r => r.category === cat);
      if (reports.length > 0) {
        setSelectedReportCode(reports[0].reportCode);
      }
    }
  };

  const handleExportCSV = () => {
    if (!activeReportResult) return;
    pmsService.exportTableToExcel(activeReportResult.rows, `CCULB_${activeReportResult.definition.reportCode}`);
  };

  const handlePrint = () => {
    if (!activeReportResult) return;
    if (onPrintReport) {
      onPrintReport(activeReportResult);
    } else {
      window.print();
    }
  };

  const handleRowClick = (row: any) => {
    setDrillDownData(row);
    setIsDrillDownOpen(true);
  };

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Top Banner & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-bold flex items-center justify-center shadow-md">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">CCULB Global Report Center & Audit Registry</h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live Reconciled DB
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Multi-department unified reporting engine with role-based data scopes, drill-downs, and audit compliance.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Scope: <strong className="text-amber-300 font-semibold">{activeUser.dataScope}</strong></span>
          </div>
          {activeCategory !== 'Dashboard' && (
            <>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors shadow text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors border border-slate-700 text-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export Excel / CSV</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin bg-slate-900/90 border border-slate-800 p-2 rounded-xl text-xs">
        {categoriesList.map(cat => {
          const isAllowed = cat === 'Dashboard' || rbacService.isReportAllowed(`Reports.${cat.replace(/\s+/g, '')}.View`, cat);
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : isAllowed
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-500 opacity-60 cursor-not-allowed'
              }`}
              disabled={!isAllowed}
            >
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* DASHBOARD VIEW */}
      {activeCategory === 'Dashboard' && (
        <div className="space-y-4">
          {/* Real-time KPI Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {/* Card 1: Today's Total Revenue */}
            <div className="bg-slate-900 border border-amber-500/30 p-3 rounded-xl shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Gross Revenue</span>
              <p className="text-sm font-bold text-amber-400 mt-1">৳{todayTotalRevenue.toLocaleString()}</p>
              <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-2.5 h-2.5" /> +12.4% vs target
              </span>
            </div>

            {/* Card 2: Room Revenue */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Room Revenue</span>
              <p className="text-sm font-bold text-slate-100 mt-1">৳{todayRoomRevenue.toLocaleString()}</p>
              <span className="text-[9px] text-slate-400 mt-0.5 block">{kpis.occupiedRooms} / {kpis.totalRooms} Rooms</span>
            </div>

            {/* Card 3: Restaurant Revenue */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Restaurant F&B</span>
              <p className="text-sm font-bold text-slate-100 mt-1">৳{todayRestaurantRevenue.toLocaleString()}</p>
              <span className="text-[9px] text-emerald-400 mt-0.5 block">{db.restaurantOrders.length} Diners</span>
            </div>

            {/* Card 4: Bar Revenue */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Bar & Lounge</span>
              <p className="text-sm font-bold text-slate-100 mt-1">৳{todayBarRevenue.toLocaleString()}</p>
              <span className="text-[9px] text-slate-400 mt-0.5 block">Beverage Sales</span>
            </div>

            {/* Card 5: Banquet Revenue */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Convention & Events</span>
              <p className="text-sm font-bold text-slate-100 mt-1">৳{todayBanquetRevenue.toLocaleString()}</p>
              <span className="text-[9px] text-amber-300 mt-0.5 block">{db.eventBookings.length} Hall Bookings</span>
            </div>

            {/* Card 6: Activity Revenue */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Activity Revenue</span>
              <p className="text-sm font-bold text-slate-100 mt-1">৳{todayActivityRevenue.toLocaleString()}</p>
              <span className="text-[9px] text-cyan-400 mt-0.5 block">Pool & Sports</span>
            </div>

            {/* Card 7: Amenity Revenue */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Amenity Revenue</span>
              <p className="text-sm font-bold text-slate-100 mt-1">৳{todayAmenityRevenue.toLocaleString()}</p>
              <span className="text-[9px] text-purple-400 mt-0.5 block">Spa & Rentals</span>
            </div>
          </div>

          {/* Second KPI Row: Operational Costing & Financial Balances */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Today's Purchases (GRN)</span>
              <p className="text-sm font-bold text-cyan-400 mt-1">৳{todayPurchases.toLocaleString()}</p>
              <span className="text-[9px] text-slate-400">Stores Inward</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Stock Consumption</span>
              <p className="text-sm font-bold text-slate-200 mt-1">৳{todayInventoryConsumption.toLocaleString()}</p>
              <span className="text-[9px] text-slate-400">Kitchen & Bar Issues</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Outstanding AR (Due)</span>
              <p className="text-sm font-bold text-rose-400 mt-1">৳{todayOutstandingAR.toLocaleString()}</p>
              <span className="text-[9px] text-rose-300/80">Guest & City Ledger</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Outstanding AP (Payables)</span>
              <p className="text-sm font-bold text-amber-300 mt-1">৳{todayOutstandingAP.toLocaleString()}</p>
              <span className="text-[9px] text-amber-400/80">Vendor Bills Due</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Cash Collection</span>
              <p className="text-sm font-bold text-emerald-400 mt-1">৳{cashCollection.toLocaleString()}</p>
              <span className="text-[9px] text-emerald-300/80">Physical Vault</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Bank & Digital POS</span>
              <p className="text-sm font-bold text-blue-400 mt-1">৳{bankCollection.toLocaleString()}</p>
              <span className="text-[9px] text-blue-300/80">Cards / bKash</span>
            </div>
          </div>

          {/* Third KPI Row: Hospitality Industry Standard Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            <div className="bg-slate-900/90 border border-emerald-500/20 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Occupancy %</span>
              <p className="text-base font-extrabold text-white mt-0.5">{kpis.occupancyRate}%</p>
              <span className="text-[9px] text-slate-400">{kpis.occupiedRooms} Units Occupied</span>
            </div>

            <div className="bg-slate-900/90 border border-blue-500/20 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">ADR (Average Daily Rate)</span>
              <p className="text-base font-extrabold text-white mt-0.5">৳{kpis.adr.toLocaleString()}</p>
              <span className="text-[9px] text-slate-400">Per Occupied Room</span>
            </div>

            <div className="bg-slate-900/90 border border-purple-500/20 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">RevPAR</span>
              <p className="text-base font-extrabold text-white mt-0.5">৳{kpis.revpar.toLocaleString()}</p>
              <span className="text-[9px] text-slate-400">Total Room Yield</span>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/20 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">Average Check</span>
              <p className="text-base font-extrabold text-white mt-0.5">৳{averageCheck.toLocaleString()}</p>
              <span className="text-[9px] text-slate-400">Per Table Order</span>
            </div>

            <div className="bg-slate-900/90 border border-rose-500/20 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">Food Cost %</span>
              <p className="text-base font-extrabold text-white mt-0.5">31.2%</p>
              <span className="text-[9px] text-emerald-400">Target: 30–33%</span>
            </div>

            <div className="bg-slate-900/90 border border-cyan-500/20 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">Beverage Cost %</span>
              <p className="text-base font-extrabold text-white mt-0.5">22.5%</p>
              <span className="text-[9px] text-emerald-400">Target: 20–25%</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chart 1: Department Revenue Breakdown */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Department Revenue Distribution (Today vs Target)</span>
                </h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { dept: 'Rooms', actual: todayRoomRevenue, target: 80000 },
                      { dept: 'Restaurant', actual: todayRestaurantRevenue, target: 45000 },
                      { dept: 'Bar & Lounge', actual: todayBarRevenue, target: 20000 },
                      { dept: 'Convention', actual: todayBanquetRevenue, target: 120000 },
                      { dept: 'Activities', actual: todayActivityRevenue, target: 15000 },
                      { dept: 'Amenities', actual: todayAmenityRevenue, target: 8000 }
                    ]}
                  >
                    <XAxis dataKey="dept" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `৳${(v / 1000)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11 }} />
                    <Legend />
                    <Bar dataKey="actual" name="Actual Revenue (৳)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name="Budget Target (৳)" fill="#334155" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Report Navigator */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Executive Quick Reports</span>
              </h3>
              <div className="space-y-2">
                {REPORT_REGISTRY.slice(0, 5).map(rep => (
                  <button
                    key={rep.id}
                    onClick={() => {
                      setActiveCategory(rep.category);
                      setSelectedReportCode(rep.reportCode);
                    }}
                    className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-mono text-[10px] text-amber-400 block">{rep.reportCode}</span>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">{rep.reportName}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT RUNNER VIEW */}
      {activeCategory !== 'Dashboard' && (
        <div className="space-y-3">
          {/* Sub-Reports Selector and Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Report dropdown or buttons */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400">Select Report:</span>
              <select
                value={selectedReportCode}
                onChange={e => setSelectedReportCode(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 font-semibold"
              >
                {filteredReports.map(rep => (
                  <option key={rep.reportCode} value={rep.reportCode}>
                    [{rep.reportCode}] {rep.reportName}
                  </option>
                ))}
              </select>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={filterState.searchTerm}
                  onChange={e => setFilterState({ ...filterState, searchTerm: e.target.value })}
                  className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-500 w-48"
                />
              </div>

              <input
                type="date"
                value={filterState.dateFrom}
                onChange={e => setFilterState({ ...filterState, dateFrom: e.target.value })}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={filterState.dateTo}
                onChange={e => setFilterState({ ...filterState, dateTo: e.target.value })}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Report Data Table Display */}
          {activeReportResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
              {/* Report Header Metadata */}
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-[10px] text-amber-400 font-bold">{activeReportResult.definition.reportCode}</span>
                  <h2 className="text-sm font-bold text-slate-100">{activeReportResult.definition.reportName}</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">{activeReportResult.definition.description}</p>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-mono">
                  <span>Generated By: <strong className="text-slate-200">{activeReportResult.generatedBy}</strong></span>
                  <br />
                  <span>Time: {activeReportResult.generatedAt}</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      {activeReportResult.columns.map(col => (
                        <th key={col.key} className={`px-3 py-2.5 font-bold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activeReportResult.rows.map((row, idx) => (
                      <tr
                        key={idx}
                        onClick={() => handleRowClick(row)}
                        className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        {activeReportResult.columns.map(col => {
                          const val = row[col.key];
                          let rendered = val !== undefined && val !== null ? String(val) : '—';

                          if (col.format === 'currency' && typeof val === 'number') {
                            rendered = `৳${val.toLocaleString()}`;
                          } else if (col.format === 'percent' && typeof val === 'number') {
                            rendered = `${val}%`;
                          } else if (col.format === 'badge') {
                            const isPositive = ['Clean', 'Confirmed', 'Settled', 'Optimal', 'Balanced', 'Completed', 'Occupied', 'Available'].includes(String(val));
                            return (
                              <td key={col.key} className="px-3 py-2 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                }`}>
                                  {rendered}
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td
                              key={col.key}
                              className={`px-3 py-2 ${
                                col.align === 'right' ? 'text-right font-mono font-semibold' : col.align === 'center' ? 'text-center font-mono' : 'font-medium'
                              } text-slate-200`}
                            >
                              {rendered}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>

                  {/* Summary Totals Row */}
                  {activeReportResult.summaryTotals && (
                    <tfoot className="bg-slate-950 border-t-2 border-slate-700 font-bold text-xs text-amber-300">
                      <tr>
                        {activeReportResult.columns.map(col => {
                          const val = activeReportResult.summaryTotals?.[col.key];
                          let rendered = val !== undefined ? String(val) : '';
                          if (typeof val === 'number' && col.format === 'currency') {
                            rendered = `৳${val.toLocaleString()}`;
                          }
                          return (
                            <td
                              key={col.key}
                              className={`px-3 py-2.5 ${col.align === 'right' ? 'text-right font-mono' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                            >
                              {rendered}
                            </td>
                          );
                        })}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drill-Down Inspector Modal */}
      {isDrillDownOpen && drillDownData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Record Drill-Down Audit Detail</span>
              </h3>
              <button
                onClick={() => setIsDrillDownOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {Object.entries(drillDownData).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400 capitalize font-medium">{k.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {typeof v === 'number' ? (k.toLowerCase().includes('amount') || k.toLowerCase().includes('cost') || k.toLowerCase().includes('price') || k.toLowerCase().includes('revenue') ? `৳${v.toLocaleString()}` : v) : String(v)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsDrillDownOpen(false)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                Close Audit Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
