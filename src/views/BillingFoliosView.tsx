import React, { useState, useEffect } from 'react';
import {
  Receipt, Search, Filter, FileSpreadsheet, Eye,
  PlusCircle, CreditCard, CheckCircle2, AlertCircle, Printer, FileText
} from 'lucide-react';
import { pmsService } from '../services/pmsService';
import { PmsDatabaseState } from '../services/mockPmsDatabase';
import { Folio } from '../types/pms';

interface BillingFoliosViewProps {
  onOpenFolio: (folioId: string) => void;
  onPrintInvoice?: (folio: Folio) => void;
  onPrintFolio?: (folio: Folio) => void;
}

export const BillingFoliosView: React.FC<BillingFoliosViewProps> = ({
  onOpenFolio,
  onPrintInvoice,
  onPrintFolio
}) => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    return pmsService.subscribe(setDb);
  }, []);

  const filteredFolios = db.folios.filter(f => {
    const matchesSearch =
      f.folioNumber.toLowerCase().includes(search.toLowerCase()) ||
      f.guestName.toLowerCase().includes(search.toLowerCase()) ||
      (f.roomNumber && f.roomNumber.includes(search));

    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportExcel = () => {
    const exportData = filteredFolios.map(f => ({
      'Folio Number': f.folioNumber,
      'Guest Name': f.guestName,
      'Room': f.roomNumber || 'Non-Room Folio',
      'Status': f.status,
      'Subtotal': f.subtotal,
      'Discounts': f.discountTotal,
      'Service Charge': f.serviceChargeTotal,
      'VAT / Tax': f.taxTotal,
      'Grand Total': f.grandTotal,
      'Paid Total': f.paidTotal,
      'Outstanding Balance': f.balance,
      'Created Date': f.createdAt
    }));
    pmsService.exportTableToExcel(exportData, 'CCULB_Guest_Folios');
  };

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">Guest Folios & Account Statements</h1>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                {filteredFolios.length} Folios
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Live guest ledger balances, itemized room charges, food bills, and payment receipts.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors border border-slate-700 text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by folio #, guest name, room..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-center">
          <span className="text-slate-400 text-[11px]">Folio Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none"
          >
            <option value="All">All Folios</option>
            <option value="Open">Open (Active Stays)</option>
            <option value="Closed">Closed & Settled</option>
          </select>
        </div>
      </div>

      {/* Folios Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Folio #</th>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Room #</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Items</th>
                <th className="py-3 px-4 text-right">Total Charges</th>
                <th className="py-3 px-4 text-right">Paid Total</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredFolios.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No guest folios found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredFolios.map(folio => (
                  <tr
                    key={folio.id}
                    onClick={() => onOpenFolio(folio.id)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {folio.folioNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-100">
                      {folio.guestName}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-300">
                      {folio.roomNumber ? `Room ${folio.roomNumber}` : 'Master Folio'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        folio.status === 'Open' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {folio.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {folio.items.length}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200">
                      ৳{folio.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                      ৳{folio.paidTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={folio.balance <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        ৳{folio.balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => (onPrintFolio || onPrintInvoice)?.(folio)}
                          title="Print Folio Statement"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded font-medium border border-slate-700 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenFolio(folio.id)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px] transition-colors"
                        >
                          Manage Folio
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
