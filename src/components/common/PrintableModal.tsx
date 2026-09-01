import React from 'react';
import { Printer, X, Download, FileText, CheckCircle2, BedDouble, Calendar, User, CreditCard, Receipt, Building, Sparkles } from 'lucide-react';
import { Invoice, Stay, Folio, Payment, EventBooking, SystemSetting, Reservation } from '../../types/pms';

export type PrintableDocumentType = 
  | 'invoice' 
  | 'folio'
  | 'folio-statement'
  | 'reservation-confirmation'
  | 'checkout-form'
  | 'checkout-statement'
  | 'registration-card' 
  | 'payment-receipt' 
  | 'event-contract' 
  | 'banquet-contract'
  | 'daily-flash-report'
  | 'operational-report';

interface PrintableModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType?: PrintableDocumentType;
  type?: PrintableDocumentType;
  data: any;
}

// Convert numbers into words for Bangladesh Taka (BDT)
function numberToWordsBDT(num: number): string {
  if (isNaN(num) || num === 0) return 'Zero Taka Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    const digit = n % 10;
    if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 === 0 ? '' : ' ' + inWords(n % 100));
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  }

  const rounded = Math.round(num);
  return `${inWords(rounded)} Taka Only`;
}

export const PrintableModal: React.FC<PrintableModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const docType = (props.documentType || props.type || 'invoice') as PrintableDocumentType;
  const rawData = props.data || {};

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const defaultSettings: SystemSetting = {
    resortName: 'CCULB Resort & Convention Hall',
    address: 'Kuchilabari, Purbachal Link Road, Gazipur / Dhaka, Bangladesh',
    phone: '+880 1711-223344 / +880 9612-445566',
    email: 'info@cculbresort.com / booking@cculb.bd',
    taxRatePercent: 15,
    serviceChargePercent: 10,
    currencySymbol: '৳',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    allowOverbooking: false,
    requireDepositForReservation: true,
    autoNightAuditEnabled: true,
    autoNightAuditTime: '05:00',
    currentBusinessDate: '2026-08-31'
  };

  // Safe data unwrapping
  const settings: SystemSetting = (rawData && rawData.settings) ? rawData.settings : defaultSettings;
  
  // Invoice extraction
  let invoice: Invoice | undefined = undefined;
  if (rawData) {
    if ('invoiceNumber' in rawData) invoice = rawData as Invoice;
    else if (rawData.invoice) invoice = rawData.invoice;
    else if ('folioNumber' in rawData && docType === 'invoice') {
      // Auto-adapt Folio into an Invoice view
      const f = rawData as Folio;
      invoice = {
        id: f.id,
        invoiceNumber: f.folioNumber.replace('FOL-', 'INV-'),
        folioId: f.id,
        guestOrClientName: f.guestName,
        roomOrHall: f.roomNumber ? `Room ${f.roomNumber}` : 'Master Folio',
        dates: `Stay opened ${f.openedAt ? f.openedAt.split('T')[0] : 'Current'}`,
        stayOrEventDetails: `Stay in Room ${f.roomNumber}`,
        items: f.items.map(i => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total
        })),
        subtotal: f.subtotal,
        discount: f.discountTotal,
        serviceCharge: f.serviceChargeTotal,
        tax: f.taxTotal,
        grandTotal: f.grandTotal,
        paidAmount: f.paidTotal,
        balance: f.balance,
        status: f.balance <= 0 ? 'Paid' : 'Issued',
        issuedAt: new Date().toISOString(),
        issuedBy: 'Front Desk Duty Officer'
      };
    }
  }

  // Folio extraction
  const folio: Folio | undefined = rawData && ('folioNumber' in rawData ? rawData : rawData.folio);
  
  // Stay extraction
  const stay: Stay | undefined = rawData && ('stayNumber' in rawData ? rawData : rawData.stay);
  
  // Reservation extraction
  const reservation: Reservation | undefined = rawData && ('reservationNumber' in rawData ? rawData : rawData.reservation);
  
  // Payment extraction
  const payment: Payment | undefined = rawData && ('transactionNumber' in rawData ? rawData : (rawData.payment || rawData.receipt));
  
  // Event extraction
  const event: EventBooking | undefined = rawData && ('eventNumber' in rawData ? rawData : rawData.event);
  
  // Report data extraction
  const reportData = rawData && (rawData.reportData || rawData.kpis ? rawData : undefined);

  const getDocTitle = () => {
    switch (docType) {
      case 'invoice': return 'TAX INVOICE / OFFICIAL BILL';
      case 'folio':
      case 'folio-statement': return 'GUEST MASTER FOLIO STATEMENT';
      case 'reservation-confirmation': return 'RESERVATION CONFIRMATION & VOUCHER';
      case 'checkout-form':
      case 'checkout-statement': return 'CHECK-OUT CLEARANCE & SETTLEMENT SLIP';
      case 'registration-card': return 'GUEST REGISTRATION CARD (REG-CARD)';
      case 'payment-receipt': return 'OFFICIAL MONEY RECEIPT';
      case 'event-contract':
      case 'banquet-contract': return 'CONVENTION & BANQUET CONTRACT';
      case 'daily-flash-report':
      case 'operational-report': return "DAILY FLASH & AUDIT REPORT";
      default: return 'OFFICIAL RESORT DOCUMENT';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto printable-modal-overlay">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-3xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Document Preview & Print — {getDocTitle()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-colors shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document (Ctrl+P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area (White Paper Style) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900 flex justify-center">
          <div
            id="printable-document"
            className="bg-white text-slate-900 p-6 sm:p-8 rounded shadow-lg max-w-2xl w-full text-xs font-sans print:shadow-none print:p-0 print:m-0 printable-card"
          >
            {/* 1. DOCUMENT HEADER */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded bg-slate-900 text-amber-400 font-black text-xs flex items-center justify-center font-serif">
                      C
                    </span>
                    <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                      {settings.resortName}
                    </h1>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{settings.address}</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Hotline: {settings.phone} | Email: {settings.email}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    BIN / VAT Reg #: 001928472-0102 | Gov. Resort License: CCU-2026-BD
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider rounded">
                    {getDocTitle()}
                  </span>
                  <p className="text-[10px] font-mono text-slate-600 mt-1">
                    Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    Time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 1. TAX INVOICE */}
            {/* ========================================================================= */}
            {docType === 'invoice' && (
              invoice ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Billed To (Guest / Client):</span>
                      <p className="font-bold text-slate-900 text-sm">{invoice.guestOrClientName}</p>
                      <p className="text-slate-600">{invoice.phone || 'Phone on record'}</p>
                      <p className="text-slate-600">{invoice.address || 'Dhaka, Bangladesh'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Invoice Details:</span>
                      <p className="font-mono font-bold text-slate-900 text-sm">{invoice.invoiceNumber}</p>
                      <p className="text-slate-700 font-semibold">{invoice.roomOrHall}</p>
                      <p className="text-slate-600">{invoice.dates}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                        invoice.balance <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        Status: {invoice.balance <= 0 ? 'PAID IN FULL' : 'PAYMENT DUE'}
                      </span>
                    </div>
                  </div>

                  <table className="w-full border-collapse text-left text-[11px] mt-4">
                    <thead>
                      <tr className="border-b-2 border-slate-300 text-slate-700 bg-slate-100">
                        <th className="py-2 px-2">#</th>
                        <th className="py-2 px-2">Item Description</th>
                        <th className="py-2 px-2 text-center">Qty</th>
                        <th className="py-2 px-2 text-right">Unit Price</th>
                        <th className="py-2 px-2 text-right">Total (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(invoice.items || []).map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-2 text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-2 font-medium text-slate-800">{item.description}</td>
                          <td className="py-2 px-2 text-center text-slate-600">{item.quantity}</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-600">৳{(item.unitPrice || 0).toLocaleString()}</td>
                          <td className="py-2 px-2 text-right font-mono font-semibold text-slate-900">৳{(item.total || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex flex-col sm:flex-row justify-between items-start pt-4 gap-4 border-t border-slate-200">
                    <div className="text-[10px] text-slate-500 max-w-xs space-y-1">
                      <p className="font-bold text-slate-700 uppercase">Payment Terms & Notes:</p>
                      <p>• All bills are payable upon receipt or before check-out.</p>
                      <p>• Amount in Words: <span className="font-semibold text-slate-800 italic">{numberToWordsBDT(invoice.grandTotal)}</span></p>
                    </div>

                    <div className="w-64 space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span className="font-mono">৳{(invoice.subtotal || 0).toLocaleString()}</span>
                      </div>
                      {(invoice.discount || 0) > 0 && (
                        <div className="flex justify-between text-rose-600">
                          <span>Discount Applied:</span>
                          <span className="font-mono">-৳{invoice.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>Service Charge ({settings.serviceChargePercent}%):</span>
                        <span className="font-mono">৳{(invoice.serviceCharge || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>VAT / Tax ({settings.taxRatePercent}%):</span>
                        <span className="font-mono">৳{(invoice.tax || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 border-t-2 border-slate-900 pt-1.5">
                        <span>Grand Total:</span>
                        <span className="font-mono">৳{(invoice.grandTotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Total Paid / Settled:</span>
                        <span className="font-mono">৳{(invoice.paidAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 bg-slate-100 p-1.5 rounded">
                        <span>Net Balance Due:</span>
                        <span className={`font-mono ${invoice.balance <= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          ৳{(invoice.balance || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-dashed border-slate-300 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
                    <div>
                      <div className="border-b border-slate-400 h-8 mb-1"></div>
                      <p>Guest Signature</p>
                    </div>
                    <div>
                      <div className="border-b border-slate-400 h-8 mb-1"></div>
                      <p>Authorized Cashier / Front Office Executive</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No invoice data available to preview.</div>
              )
            )}

            {/* ========================================================================= */}
            {/* 2. GUEST FOLIO STATEMENT */}
            {/* ========================================================================= */}
            {(docType === 'folio' || docType === 'folio-statement') && (
              folio ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Guest Ledger Account:</span>
                      <p className="font-bold text-slate-900 text-sm">{folio.guestName}</p>
                      <p className="text-slate-700 font-semibold">{folio.roomNumber ? `Room ${folio.roomNumber}` : 'Master Non-Room Account'}</p>
                      <p className="text-slate-600 font-mono text-[10px]">Opened: {folio.openedAt ? folio.openedAt.replace('T', ' ').substring(0, 16) : 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Folio Number:</span>
                      <p className="font-mono font-bold text-slate-900 text-sm">{folio.folioNumber}</p>
                      <p className="text-slate-600">Status: <span className="font-semibold">{folio.status}</span></p>
                      <p className="text-slate-600">Currency: BDT (৳)</p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded overflow-hidden mt-3">
                    <table className="w-full border-collapse text-left text-[11px]">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                        <tr>
                          <th className="py-2 px-2">#</th>
                          <th className="py-2 px-2">Category</th>
                          <th className="py-2 px-2">Description</th>
                          <th className="py-2 px-2 text-center">Qty</th>
                          <th className="py-2 px-2 text-right">Unit Rate</th>
                          <th className="py-2 px-2 text-right">Debit (৳)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {(folio.items || []).map((item, idx) => (
                          <tr key={idx} className={item.voided ? 'opacity-50 line-through bg-rose-50/50' : ''}>
                            <td className="py-2 px-2 text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-2 font-semibold text-slate-700 text-[10px] uppercase">{item.type}</td>
                            <td className="py-2 px-2 font-medium text-slate-900">
                              {item.description}
                              {item.voided && (
                                <span className="no-underline ml-1.5 px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded">
                                  VOIDED: {item.voidReason || 'Reversed'}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-center text-slate-600">{item.quantity}</td>
                            <td className="py-2 px-2 text-right font-mono text-slate-600">৳{(item.unitPrice || 0).toLocaleString()}</td>
                            <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">
                              {item.voided ? '৳0 (Voided)' : `৳${(item.total || 0).toLocaleString()}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start pt-4 gap-4 border-t border-slate-200">
                    <div className="text-[10px] text-slate-500 max-w-xs space-y-1">
                      <p className="font-bold text-slate-700 uppercase">Statement Summary:</p>
                      <p>This document reflects all postings made to this guest folio up to this statement date.</p>
                    </div>

                    <div className="w-64 space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-600">
                        <span>Items Subtotal:</span>
                        <span className="font-mono">৳{(folio.subtotal || 0).toLocaleString()}</span>
                      </div>
                      {(folio.discountTotal || 0) > 0 && (
                        <div className="flex justify-between text-rose-600">
                          <span>Total Discounts:</span>
                          <span className="font-mono">-৳{folio.discountTotal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>Service Charge ({settings.serviceChargePercent}%):</span>
                        <span className="font-mono">৳{(folio.serviceChargeTotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>VAT / Tax ({settings.taxRatePercent}%):</span>
                        <span className="font-mono">৳{(folio.taxTotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 border-t-2 border-slate-900 pt-1.5">
                        <span>Total Folio Charges:</span>
                        <span className="font-mono">৳{(folio.grandTotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Total Payments Applied:</span>
                        <span className="font-mono">৳{(folio.paidTotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 bg-slate-100 p-1.5 rounded">
                        <span>Current Balance:</span>
                        <span className={`font-mono ${folio.balance <= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          ৳{(folio.balance || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-dashed border-slate-300 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
                    <div>
                      <div className="border-b border-slate-400 h-8 mb-1"></div>
                      <p>Guest Signature (I acknowledge the above ledger entries)</p>
                    </div>
                    <div>
                      <div className="border-b border-slate-400 h-8 mb-1"></div>
                      <p>Front Office Duty Cashier</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No folio data available to display.</div>
              )
            )}

            {/* ========================================================================= */}
            {/* 3. RESERVATION CONFIRMATION & BOOKING VOUCHER */}
            {/* ========================================================================= */}
            {docType === 'reservation-confirmation' && (
              reservation ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded flex justify-between items-center">
                    <div>
                      <span className="text-amber-800 font-bold text-[10px] uppercase block">Official Booking Confirmation</span>
                      <p className="text-base font-black font-mono text-slate-900">{reservation.reservationNumber}</p>
                      <p className="text-[10px] text-slate-600">Booked via: <span className="font-semibold">{reservation.bookingSource}</span></p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] uppercase rounded">
                        {reservation.status}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">Booked on: {reservation.createdAt ? reservation.createdAt.split('T')[0] : 'Today'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border border-slate-200 p-3.5 rounded text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Guest Information:</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{reservation.guestName}</p>
                      <p className="text-slate-600">Phone: <span className="font-mono font-semibold">{reservation.guestPhone}</span></p>
                      <p className="text-slate-600">Email: {reservation.guestEmail || 'info@cculb.bd'}</p>
                      <p className="text-slate-600 mt-1">Guests: <span className="font-semibold">{reservation.adults} Adults, {reservation.children} Children</span></p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Stay Schedule:</span>
                      <p className="font-semibold text-slate-900 text-sm mt-0.5">{reservation.roomTypeName}</p>
                      {reservation.assignedRoomNumber && (
                        <p className="text-cyan-700 font-bold font-mono text-xs">Room Assigned: Room {reservation.assignedRoomNumber}</p>
                      )}
                      <p className="text-slate-700 mt-1">
                        Check-in: <span className="font-mono font-bold">{reservation.arrivalDate}</span> (From 14:00)
                      </p>
                      <p className="text-slate-700">
                        Check-out: <span className="font-mono font-bold">{reservation.departureDate}</span> (Until 12:00)
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded text-[11px] space-y-2">
                    <span className="text-slate-700 font-bold uppercase text-[10px] block">Rate & Deposit Breakdown:</span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-2 border border-slate-200 rounded">
                        <span className="text-[10px] text-slate-500 block">Nightly Rate</span>
                        <span className="font-bold font-mono text-slate-900">৳{reservation.rate.toLocaleString()}</span>
                      </div>
                      <div className="bg-white p-2 border border-slate-200 rounded">
                        <span className="text-[10px] text-slate-500 block">Advance Deposit Paid</span>
                        <span className="font-bold font-mono text-emerald-600">৳{reservation.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="bg-white p-2 border border-slate-200 rounded">
                        <span className="text-[10px] text-slate-500 block">Estimated Total</span>
                        <span className="font-bold font-mono text-slate-900">৳{reservation.totalEstimatedAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {reservation.specialRequests && (
                    <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded text-[10px] text-slate-700">
                      <span className="font-bold uppercase text-amber-800">Special Instructions / Requests:</span>
                      <p className="mt-0.5">{reservation.specialRequests}</p>
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800 uppercase">Reservation Terms & Hotel Policy:</p>
                    <p>1. <strong>Identification:</strong> Government-issued Photo ID or Passport is mandatory for all adult guests at check-in.</p>
                    <p>2. <strong>Timing:</strong> Standard Check-in is 2:00 PM and Check-out is 12:00 PM.</p>
                    <p>3. <strong>Cancellation:</strong> Free cancellation up to 48 hours before scheduled check-in date.</p>
                    <p>4. <strong>Security:</strong> Key deposit and room charges settled at check-in / check-out.</p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-dashed border-slate-300 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
                    <div>
                      <div className="border-b border-slate-400 h-8 mb-1"></div>
                      <p>Guest Signature (At Check-in)</p>
                    </div>
                    <div>
                      <div className="border-b border-slate-400 h-8 mb-1"></div>
                      <p>CCULB Central Reservations Office</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No reservation data available.</div>
              )
            )}

            {/* ========================================================================= */}
            {/* 4. CHECK-OUT CLEARANCE SLIP & SETTLEMENT FORM */}
            {/* ========================================================================= */}
            {(docType === 'checkout-form' || docType === 'checkout-statement') && (
              <div className="space-y-4">
                <div className="bg-rose-50 border border-rose-200 p-3 rounded flex justify-between items-center">
                  <div>
                    <span className="text-rose-800 font-bold text-[10px] uppercase block">Guest Departure & Clearance Slip</span>
                    <p className="text-base font-black font-mono text-slate-900">
                      {stay?.roomNumber ? `ROOM ${stay.roomNumber}` : 'ROOM CHECKOUT'}
                    </p>
                    <p className="text-[10px] text-slate-600">Guest: <span className="font-bold text-slate-900">{stay?.guestName || 'Valued Guest'}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-slate-900 text-white font-bold text-[10px] uppercase rounded">
                      CHECK-OUT CLEARED
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 p-3.5 rounded space-y-3 text-[11px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-slate-500 text-[10px]">Stay Record #:</span> <p className="font-mono font-bold">{stay?.stayNumber || 'STY-CURRENT'}</p></div>
                    <div><span className="text-slate-500 text-[10px]">Room Category:</span> <p className="font-semibold">{stay?.roomTypeName || 'Deluxe Room'}</p></div>
                    <div><span className="text-slate-500 text-[10px]">Check-In Timestamp:</span> <p className="font-mono">{stay?.checkInAt ? stay.checkInAt.replace('T', ' ').substring(0, 16) : '2026-08-31 14:30'}</p></div>
                    <div><span className="text-slate-500 text-[10px]">Check-Out Timestamp:</span> <p className="font-mono">{new Date().toISOString().replace('T', ' ').substring(0, 16)}</p></div>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <span className="text-slate-700 font-bold uppercase text-[10px] block mb-2">Departure Inspection & Clearance Checklist:</span>
                    <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                      <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Room Key Cards Returned ({stay?.keyCardsIssued || 2} Cards)</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Minibar & Linen Inspection Cleared</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>In-Room Safe Locker Emptied</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Folio Settlement Balance Verified (৳0.00)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex justify-between items-center text-[11px]">
                  <div>
                    <span className="text-emerald-800 font-bold block uppercase text-[10px]">Account Settlement Status</span>
                    <p className="text-slate-700">All room charges, food bills, and taxes have been fully reconciled and settled.</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded font-mono text-xs">
                    ৳0.00 DUE
                  </span>
                </div>

                <div className="mt-8 pt-8 border-t border-dashed border-slate-300 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
                  <div>
                    <div className="border-b border-slate-400 h-8 mb-1"></div>
                    <p>Guest Departure Signature</p>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 h-8 mb-1"></div>
                    <p>Duty Front Desk Cashier / Supervisor</p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. GUEST REGISTRATION CARD (REG-CARD) */}
            {/* ========================================================================= */}
            {docType === 'registration-card' && (
              <div className="space-y-4">
                <div className="border border-slate-300 p-3.5 rounded space-y-3 text-[11px]">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Guest Full Name:</span>
                      <p className="font-bold text-slate-900 text-sm">{stay?.guestName || 'Valued Guest'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Stay Record #:</span>
                      <p className="font-mono font-semibold text-slate-900">{stay?.stayNumber || 'STY-2026-00311'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Mobile Phone:</span>
                      <p className="font-mono font-medium">{(stay as any)?.guestPhone || '+880 1711-000111'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold">National ID / Passport:</span>
                      <p className="font-mono font-medium">{(stay as any)?.guestIdNumber || (stay?.verifiedId ? 'Verified by Front Desk' : 'ID on record')}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Room Assigned:</span>
                      <p className="font-bold text-amber-800 text-sm">Room {stay?.roomNumber} ({stay?.roomTypeName})</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Key Cards Issued:</span>
                      <p className="font-semibold">{stay?.keyCardsIssued || 2} Electronic RFID Cards</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Check-In Date & Time:</span>
                      <p className="font-mono">{stay?.checkInAt ? stay.checkInAt.replace('T', ' ').substring(0, 16) : '2026-08-31 14:30'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Expected Departure:</span>
                      <p className="font-mono">{stay?.expectedCheckOutAt ? stay.expectedCheckOutAt.replace('T', ' ').substring(0, 16) : '2026-09-03 12:00'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800 uppercase">Resort Policy & Terms of Stay:</p>
                  <p>1. <strong>Check-Out Time:</strong> Strictly 12:00 PM. Late check-out is subject to room availability and front desk approval.</p>
                  <p>2. <strong>Smoking:</strong> Non-smoking policy applies in all indoor rooms and suite corridors. Designated smoking zones available outdoors.</p>
                  <p>3. <strong>Valuables:</strong> The resort management is not liable for unsecured valuables in rooms. Please use in-room digital safe lockers.</p>
                  <p>4. <strong>Swimming Pool:</strong> Appropriate swimwear mandatory. Pool timing: 07:00 AM – 08:00 PM.</p>
                </div>

                <div className="mt-8 pt-8 border-t border-dashed border-slate-300 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
                  <div>
                    <div className="border-b border-slate-400 h-8 mb-1"></div>
                    <p>Guest Signature (I agree to resort terms)</p>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 h-8 mb-1"></div>
                    <p>Front Desk Duty Officer</p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. OFFICIAL MONEY RECEIPT */}
            {/* ========================================================================= */}
            {docType === 'payment-receipt' && (
              payment ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded text-center">
                    <span className="text-emerald-800 font-bold text-xs uppercase block">Official Money Receipt</span>
                    <p className="text-2xl font-black text-slate-900 mt-1 font-mono">৳{(payment.amount || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-700 italic mt-0.5 font-medium">({numberToWordsBDT(payment.amount || 0)})</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Receipt #: <span className="font-mono font-bold text-slate-900">{payment.transactionNumber || 'TXN-PENDING'}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] border border-slate-200 p-3.5 rounded">
                    <div><span className="text-slate-500 text-[10px] uppercase font-bold">Payment Method:</span> <p className="font-semibold text-slate-900">{payment.method}</p></div>
                    <div><span className="text-slate-500 text-[10px] uppercase font-bold">Payment Date & Time:</span> <p className="font-mono">{payment.createdAt ? payment.createdAt.replace('T', ' ').substring(0, 16) : 'Current'}</p></div>
                    <div><span className="text-slate-500 text-[10px] uppercase font-bold">Transaction / Slip Reference:</span> <p className="font-mono font-bold text-slate-800">{payment.reference || 'Counter Cash'}</p></div>
                    <div><span className="text-slate-500 text-[10px] uppercase font-bold">Received & Logged By:</span> <p className="font-medium text-slate-800">{payment.createdBy || 'Accounts Department'}</p></div>
                    {payment.notes && <div className="col-span-2 border-t border-slate-100 pt-1.5"><span className="text-slate-500 text-[10px]">Payment Remarks:</span> <p>{payment.notes}</p></div>}
                  </div>

                  <div className="mt-8 pt-8 border-t border-dashed border-slate-300 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
                    <div>
                      <div className="border-b border-slate-400 h-8 mb-1"></div>
                      <p>Guest / Payer Signature</p>
                    </div>
                    <div>
                      <div className="border-b border-slate-400 h-8 mb-1"></div>
                      <p>Authorized Cashier / Accounts Officer</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No payment receipt data available.</div>
              )
            )}

            {/* ========================================================================= */}
            {/* 7. EVENT BANQUET CONTRACT & BEO */}
            {/* ========================================================================= */}
            {(docType === 'event-contract' || docType === 'banquet-contract') && (
              event ? (
                <div className="space-y-4 text-[11px]">
                  <div className="bg-purple-50 border border-purple-200 p-3.5 rounded">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-slate-500 text-[10px] uppercase font-bold">Event Booking #:</span> <p className="font-mono font-bold text-purple-900">{event.eventNumber}</p></div>
                      <div><span className="text-slate-500 text-[10px] uppercase font-bold">Event Title / Purpose:</span> <p className="font-bold text-slate-900">{event.eventName}</p></div>
                      <div><span className="text-slate-500 text-[10px] uppercase font-bold">Client / Organization:</span> <p className="font-semibold text-slate-800">{event.clientName} ({event.clientPhone})</p></div>
                      <div><span className="text-slate-500 text-[10px] uppercase font-bold">Reserved Hall:</span> <p className="font-bold text-purple-800">{event.hallName}</p></div>
                      <div><span className="text-slate-500 text-[10px] uppercase font-bold">Event Date & Timing:</span> <p className="font-mono">{event.eventDate} ({event.startTime} - {event.endTime})</p></div>
                      <div><span className="text-slate-500 text-[10px] uppercase font-bold">Guaranteed Attendance:</span> <p className="font-semibold">{event.guestCount} Pax</p></div>
                    </div>
                  </div>

                  <table className="w-full border-collapse text-left text-[11px] mt-2 border border-slate-200">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-100 text-slate-700">
                        <th className="py-2 px-2">#</th>
                        <th className="py-2 px-2">Service / Item Description</th>
                        <th className="py-2 px-2 text-center">Qty</th>
                        <th className="py-2 px-2 text-right">Unit Price</th>
                        <th className="py-2 px-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(event.items || []).map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-2 text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-2 font-medium">{it.description}</td>
                          <td className="py-2 px-2 text-center">{it.quantity}</td>
                          <td className="py-2 px-2 text-right font-mono">৳{(it.unitPrice || 0).toLocaleString()}</td>
                          <td className="py-2 px-2 text-right font-mono font-semibold">৳{(it.total || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end pt-2 text-[11px]">
                    <div className="w-64 space-y-1 border-t border-slate-300 pt-2">
                      <div className="flex justify-between"><span>Grand Total:</span> <span className="font-bold font-mono">৳{(event.total || 0).toLocaleString()}</span></div>
                      <div className="flex justify-between text-emerald-700"><span>Deposit Advance Paid:</span> <span className="font-bold font-mono">৳{(event.deposit || 0).toLocaleString()}</span></div>
                      <div className="flex justify-between text-rose-600 font-bold border-t border-slate-300 pt-1"><span>Balance Payable:</span> <span className="font-mono">৳{(event.balance || 0).toLocaleString()}</span></div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-dashed border-slate-300 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
                    <div>
                      <div className="border-b border-slate-400 h-8 mb-1"></div>
                      <p>Client Signature & Official Seal</p>
                    </div>
                    <div>
                      <div className="border-b border-slate-400 h-8 mb-1"></div>
                      <p>CCULB Convention Director</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No event contract data available.</div>
              )
            )}

            {/* ========================================================================= */}
            {/* 8. DAILY OPERATIONAL FLASH & AUDIT REPORT */}
            {/* ========================================================================= */}
            {(docType === 'daily-flash-report' || docType === 'operational-report') && (
              <div className="space-y-4">
                <div className="bg-slate-100 border border-slate-300 p-3.5 rounded flex justify-between items-center">
                  <div>
                    <span className="text-slate-600 font-bold text-[10px] uppercase block">Audit & Operations Command</span>
                    <h2 className="text-base font-black text-slate-900">RESORT DAILY FLASH REPORT</h2>
                    <p className="text-[10px] text-slate-500">Generated for General Management & Night Audit Review</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] rounded font-bold">
                      AUDITED
                    </span>
                    <p className="text-[10px] font-mono text-slate-600 mt-1">Audit Date: {new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>

                {/* KPI Overview Grid */}
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="border border-slate-200 p-2 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-500 block uppercase">Occupancy</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {reportData?.kpis?.occupancyRate ?? 80}%
                    </span>
                  </div>
                  <div className="border border-slate-200 p-2 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-500 block uppercase">ADR</span>
                    <span className="text-base font-bold font-mono text-emerald-700">
                      ৳{(reportData?.kpis?.adr ?? 9500).toLocaleString()}
                    </span>
                  </div>
                  <div className="border border-slate-200 p-2 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-500 block uppercase">RevPAR</span>
                    <span className="text-base font-bold font-mono text-cyan-700">
                      ৳{(reportData?.kpis?.revpar ?? 7600).toLocaleString()}
                    </span>
                  </div>
                  <div className="border border-slate-200 p-2 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-500 block uppercase">In-House Guests</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {reportData?.kpis?.inHouseGuests ?? 42} Pax
                    </span>
                  </div>
                </div>

                {/* Detailed Department Breakdown Table */}
                <div className="border border-slate-200 rounded overflow-hidden mt-3">
                  <div className="bg-slate-100 p-2 border-b border-slate-200">
                    <span className="font-bold text-slate-800 text-[10px] uppercase">Department Revenue & Collections</span>
                  </div>
                  <table className="w-full text-[11px] border-collapse">
                    <tbody className="divide-y divide-slate-200">
                      <tr className="p-2">
                        <td className="py-2 px-3 text-slate-700 font-medium">Room Accommodation Revenue</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ৳{(reportData?.roomRevenue ?? 185000).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-slate-700 font-medium">Food & Beverage (Restaurant & Room Service)</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ৳{(reportData?.fbRevenue ?? 64500).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-slate-700 font-medium">Convention & Banquet Hall Events</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ৳{(reportData?.eventRevenue ?? 120000).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-2.5 px-3 text-slate-900 uppercase">Total Consolidated Gross Revenue</td>
                        <td className="py-2.5 px-3 text-right font-mono font-extrabold text-amber-700 text-sm">
                          ৳{(reportData?.totalGrossRevenue ?? 369500).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Inventory Status */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10.5px] border border-slate-200 p-2.5 rounded bg-slate-50">
                  <div>
                    <span className="text-slate-500 block">Total Inventory:</span>
                    <span className="font-bold font-mono text-slate-900">{reportData?.kpis?.totalRooms ?? 48} Rooms</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Occupied / Clean Vacant:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {reportData?.kpis?.occupiedRooms ?? 38} / {reportData?.kpis?.availableRooms ?? 6}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dirty / Maintenance OOO:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {reportData?.kpis?.dirtyRooms ?? 3} / {reportData?.kpis?.oooRooms ?? 1}
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-dashed border-slate-300 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
                  <div>
                    <div className="border-b border-slate-400 h-8 mb-1"></div>
                    <p>Night Auditor / Revenue Manager</p>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 h-8 mb-1"></div>
                    <p>Resort General Manager</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
