import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Printer, FileSpreadsheet, Eye, CheckCircle2
} from 'lucide-react';
import { pmsService } from '../services/pmsService';
import { PmsDatabaseState } from '../services/mockPmsDatabase';
import { Invoice } from '../types/pms';

interface BillingInvoicesViewProps {
  onPrintInvoiceDirect: (invoice: Invoice) => void;
}

export const BillingInvoicesView: React.FC<BillingInvoicesViewProps> = ({
  onPrintInvoiceDirect
}) => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());
  const [search, setSearch] = useState('');

  useEffect(() => {
    return pmsService.subscribe(setDb);
  }, []);

  const filteredInvoices = db.invoices.filter(inv => {
    return (
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.guestOrClientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.stayOrEventDetails.toLowerCase().includes(search.toLowerCase()) ||
      inv.roomOrHall.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleExportExcel = () => {
    const exportData = filteredInvoices.map(i => ({
      'Invoice Number': i.invoiceNumber,
      'Guest / Client': i.guestOrClientName,
      'Room / Hall': i.roomOrHall,
      'Stay / Event Details': i.stayOrEventDetails,
      'Subtotal': i.subtotal,
      'Service Charge': i.serviceCharge,
      'VAT / Tax': i.tax,
      'Grand Total': i.grandTotal,
      'Paid Total': i.paidAmount,
      'Status': i.status,
      'Issued Date': i.issuedAt ? i.issuedAt.split('T')[0] : ''
    }));
    pmsService.exportTableToExcel(exportData, 'CCULB_Tax_Invoices');
  };

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">Official Hotel & Banquet Tax Invoices</h1>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                {filteredInvoices.length} Invoices
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              NBR compliant resort tax invoices with itemized VAT (15%) and service charges (10%).
            </p>
          </div>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors border border-slate-700 text-xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice #, guest, room, hall..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Guest / Corporate Client</th>
                <th className="py-3 px-4">Room / Convention Hall</th>
                <th className="py-3 px-4">Stay / Event Details</th>
                <th className="py-3 px-4 text-right">Tax (15%)</th>
                <th className="py-3 px-4 text-right">Grand Total (৳)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No tax invoices generated yet.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-300">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-100">
                      {inv.guestOrClientName}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-semibold">
                      {inv.roomOrHall}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      <div>{inv.stayOrEventDetails}</div>
                      <div className="text-[10px] text-slate-500">Issued: {inv.issuedAt ? inv.issuedAt.split('T')[0] : 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      ৳{inv.tax.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400 text-sm">
                      ৳{inv.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onPrintInvoiceDirect(inv)}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded font-medium text-[11px] border border-slate-700 transition-colors mx-auto"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Invoice</span>
                      </button>
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
