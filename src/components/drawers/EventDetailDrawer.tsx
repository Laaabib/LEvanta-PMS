import React, { useState } from 'react';
import {
  X, PartyPopper, Calendar, Clock, Users, Building, Phone,
  CreditCard, Printer, FileText, CheckCircle2, AlertCircle, Plus
} from 'lucide-react';
import { pmsService } from '../../services/pmsService';
import { EventBooking, PaymentMethod } from '../../types/pms';

interface EventDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onPrintContract?: (event: EventBooking) => void;
  onSuccess?: () => void;
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  isOpen,
  onClose,
  eventId,
  onPrintContract,
  onSuccess
}) => {
  const db = pmsService.getState();
  const event = db.eventBookings.find(e => e.id === eventId);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState(10000);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank Transfer');
  const [payRef, setPayRef] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen || !event) return null;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;

    try {
      pmsService.recordEventPayment(event.id, {
        amount: payAmount,
        method: payMethod,
        reference: payRef || 'Event Advance Payment'
      });
      setShowPaymentForm(false);
      setMessage(`Received payment of ৳${payAmount.toLocaleString()} for event booking.`);
      onSuccess?.();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-150">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl text-xs text-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center border border-purple-500/30">
              <PartyPopper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">{event.eventName}</h3>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  event.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300' :
                  event.status === 'Ongoing' ? 'bg-blue-500/20 text-blue-300' :
                  event.status === 'Completed' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {event.status}
                </span>
              </div>
              <p className="text-[11px] font-mono text-purple-300">
                {event.eventNumber} • {event.hallName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {message && (
            <div className="p-2.5 bg-slate-800 border border-slate-700 rounded text-amber-300 text-[11px]">
              {message}
            </div>
          )}

          {/* Event Overview Card */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Client / Organization</span>
                <p className="font-bold text-slate-100 mt-0.5">{event.clientName}</p>
                {event.clientCompany && <p className="text-slate-400">{event.clientCompany}</p>}
                <p className="text-slate-400 font-mono flex items-center space-x-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{event.clientPhone}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Hall & Schedule</span>
                <p className="font-bold text-purple-400 mt-0.5">{event.hallName}</p>
                <p className="text-slate-300 flex items-center space-x-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{event.eventDate}</span>
                </p>
                <p className="text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{event.startTime} - {event.endTime}</span>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
              <span className="text-slate-400 flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Guaranteed Guests: <strong className="text-slate-200">{event.guestCount} Pax</strong></span>
              </span>
              {event.packageName && (
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                  {event.packageName}
                </span>
              )}
            </div>
          </div>

          {/* Payment Form Sub-Drawer */}
          {showPaymentForm && (
            <form onSubmit={handleRecordPayment} className="bg-slate-950 p-3.5 rounded-lg border border-emerald-500/40 space-y-3">
              <span className="font-bold text-emerald-400 text-xs block">Record Event Payment / Installment</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Amount (৳ BDT):</span>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Payment Channel:</span>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                  >
                    <option value="Bank Transfer">Bank Transfer (Corporate)</option>
                    <option value="Cheque">Corporate Cheque</option>
                    <option value="bKash">bKash Merchant</option>
                    <option value="Credit Card">Credit Card POS</option>
                    <option value="Cash">Cash at Counter</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Bank Reference / Cheque No:</span>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="e.g. CITY-CHQ-9941 / SCB-ONLINE-TXN"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[11px]"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          )}

          {/* Itemized Breakdown Table */}
          <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Banquet Itemized Bill</span>
              <button
                onClick={() => setShowPaymentForm(true)}
                className="flex items-center space-x-1 text-emerald-400 hover:underline text-[11px] font-semibold"
              >
                <CreditCard className="w-3 h-3" />
                <span>+ Record Payment</span>
              </button>
            </div>

            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Service / Component</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Unit Price</th>
                  <th className="py-2 px-3 text-right">Total (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {event.items.map(it => (
                  <tr key={it.id}>
                    <td className="py-2 px-3">
                      <span className="font-medium text-slate-200 block">{it.description}</span>
                      <span className="text-[10px] text-slate-500">{it.itemType}</span>
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-400">{it.quantity}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-400">৳{it.unitPrice.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-200">৳{it.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Ledger */}
            <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Hall Rent & Catering Subtotal:</span>
                <span className="font-mono">৳{event.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Service Charge (10%):</span>
                <span className="font-mono">৳{event.serviceCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>VAT / Tax (15%):</span>
                <span className="font-mono">৳{event.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-100 border-t border-slate-800 pt-1 text-xs">
                <span>Grand Total:</span>
                <span className="font-mono text-purple-300">৳{event.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Advance Paid:</span>
                <span className="font-mono">৳{event.deposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-sm bg-slate-950 p-2.5 rounded border border-slate-800">
                <span>Payable Balance:</span>
                <span className={`font-mono ${event.balance <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ৳{event.balance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onPrintContract?.(event)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-xs transition-colors shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Event Contract</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
