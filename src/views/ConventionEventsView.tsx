import React, { useState, useEffect } from 'react';
import {
  PartyPopper, PlusCircle, Search, Calendar, Users, Building,
  FileSpreadsheet, Printer, CreditCard, CheckCircle2, Clock
} from 'lucide-react';
import { pmsService } from '../services/pmsService';
import { PmsDatabaseState } from '../services/mockPmsDatabase';
import { EventBooking } from '../types/pms';

interface ConventionEventsViewProps {
  onSelectEvent: (eventId: string) => void;
  onPrintContract: (event: EventBooking) => void;
}

export const ConventionEventsView: React.FC<ConventionEventsViewProps> = ({
  onSelectEvent,
  onPrintContract
}) => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Event Form State
  const [hallId, setHallId] = useState(db.halls[0]?.id || '');
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState<EventBooking['eventType']>('Corporate');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('16:00');
  const [guestCount, setGuestCount] = useState(150);
  const [packageId, setPackageId] = useState<string>('');
  const [deposit, setDeposit] = useState(30000);
  const [conflictError, setConflictError] = useState('');

  useEffect(() => {
    return pmsService.subscribe(setDb);
  }, []);

  const filteredEvents = db.eventBookings.filter(evt => {
    const matchesSearch =
      evt.eventName.toLowerCase().includes(search.toLowerCase()) ||
      evt.clientName.toLowerCase().includes(search.toLowerCase()) ||
      evt.eventNumber.toLowerCase().includes(search.toLowerCase()) ||
      evt.hallName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || evt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportExcel = () => {
    const exportData = filteredEvents.map(e => ({
      'Event Number': e.eventNumber,
      'Event Name': e.eventName,
      'Hall': e.hallName,
      'Date': e.eventDate,
      'Timing': `${e.startTime} - ${e.endTime}`,
      'Client': e.clientName,
      'Company': e.clientCompany || 'N/A',
      'Phone': e.clientPhone,
      'Guests (Pax)': e.guestCount,
      'Package': e.packageName || 'Custom',
      'Grand Total': e.total,
      'Deposit Paid': e.deposit,
      'Balance Payable': e.balance,
      'Status': e.status
    }));
    pmsService.exportTableToExcel(exportData, 'CCULB_Convention_Events');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError('');

    try {
      const selectedHall = db.halls.find(h => h.id === hallId);
      const hallRate = selectedHall ? selectedHall.baseRatePerDay : 50000;

      const newEvt = pmsService.createEventBooking({
        hallId,
        eventName,
        eventType,
        clientName,
        clientPhone,
        clientEmail: clientEmail || `${clientPhone.replace(/[^0-9]/g, '')}@client.cculb.org`,
        clientCompany,
        eventDate,
        startTime,
        endTime,
        guestCount,
        packageId: packageId || undefined,
        depositAmount: deposit,
        items: [
          {
            itemType: 'Hall Rent',
            description: `${selectedHall?.name || 'Convention'} Hall Daily Rental & Stage`,
            quantity: 1,
            unitPrice: hallRate
          }
        ]
      });
      setShowNewModal(false);
      onSelectEvent(newEvt.id);
    } catch (err: any) {
      setConflictError(err.message);
    }
  };

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center border border-purple-500/30">
            <PartyPopper className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">Convention & Banquet Event Bookings</h1>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                {filteredEvents.length} Events
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Convention halls, corporate conferences, wedding banquets, buffet catering, and deposits.
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
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors shadow-sm text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book Convention Hall</span>
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
            placeholder="Search by event, client, hall, event #..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-center">
          <span className="text-slate-400 text-[11px]">Event Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Event #</th>
                <th className="py-3 px-4">Event Name</th>
                <th className="py-3 px-4">Convention Hall</th>
                <th className="py-3 px-4">Schedule Date & Time</th>
                <th className="py-3 px-4">Client / Organization</th>
                <th className="py-3 px-4 text-center">Pax</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No convention bookings match current criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(event => (
                  <tr
                    key={event.id}
                    onClick={() => onSelectEvent(event.id)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-purple-400">
                      {event.eventNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-100 block">{event.eventName}</span>
                      {event.packageName && (
                        <span className="text-[10px] text-purple-300">{event.packageName}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {event.hallName}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{event.eventDate}</div>
                      <div className="text-[10px] text-slate-500">{event.startTime} - {event.endTime}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{event.clientName}</div>
                      <div className="text-[10px] text-slate-400">{event.clientCompany || event.clientPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                      {event.guestCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                      ৳{event.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={event.balance <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        ৳{event.balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        event.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        event.status === 'Ongoing' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        event.status === 'Completed' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onPrintContract(event)}
                          title="Print Banquet Contract"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded border border-slate-700"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectEvent(event.id)}
                          className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-[10.5px]"
                        >
                          Details
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

      {/* New Convention Hall Booking Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-4 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <PartyPopper className="w-4 h-4 text-purple-400" />
              <span>Book Convention Hall / Banquet</span>
            </h3>

            {conflictError && (
              <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded text-[11px]">
                {conflictError}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Select Convention Hall *</span>
                <select
                  value={hallId}
                  onChange={(e) => setHallId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs"
                >
                  {db.halls.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name} (Cap: {h.capacity} Pax, Rent: ৳{h.baseRatePerDay.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Event Title / Purpose *</span>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Annual Summit 2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Event Type</span>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs"
                  >
                    <option value="Corporate">Corporate Conference</option>
                    <option value="Wedding">Wedding Banquet</option>
                    <option value="Annual General Meeting (AGM)">AGM Meeting</option>
                    <option value="Seminar">Training / Seminar</option>
                    <option value="Birthday / Social">Birthday / Social</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Event Date *</span>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Expected Guests (Pax) *</span>
                  <input
                    type="number"
                    min="10"
                    required
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value) || 10)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Start Time</span>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="10:00"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">End Time</span>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="16:00"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Client / Organizer Name *</span>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Md. Jahangir Kabir"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Client Phone *</span>
                  <input
                    type="text"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+880 1711-..."
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Company / Organization</span>
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="e.g. CCULB Credit Society"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Advance Deposit (৳)</span>
                  <input
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-xs"
                >
                  Confirm Banquet Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
