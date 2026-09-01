import React, { useState, useEffect, useRef } from 'react';
import {
  Search, X, User, Calendar, BedDouble, FileText,
  PartyPopper, Receipt, Phone, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { pmsService } from '../../services/pmsService';
import {
  Guest, Reservation, Room, Invoice, EventBooking, Folio
} from '../../types/pms';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (type: 'guest' | 'reservation' | 'room' | 'invoice' | 'event' | 'folio', id: string, entity?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    guests: Guest[];
    reservations: Reservation[];
    rooms: Room[];
    invoices: Invoice[];
    events: EventBooking[];
    folios: Folio[];
  }>({ guests: [], reservations: [], rooms: [], invoices: [], events: [], folios: [] });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults({ guests: [], reservations: [], rooms: [], invoices: [], events: [], folios: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle search
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (q.trim().length > 0) {
      setResults(pmsService.searchGlobal(q));
    } else {
      setResults({ guests: [], reservations: [], rooms: [], invoices: [], events: [], folios: [] });
    }
  };

  if (!isOpen) return null;

  const hasAnyResults =
    results.guests.length > 0 ||
    results.reservations.length > 0 ||
    results.rooms.length > 0 ||
    results.invoices.length > 0 ||
    results.events.length > 0 ||
    results.folios.length > 0;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Type guest name, phone, reservation number, room, invoice #, folio..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults({ guests: [], reservations: [], rooms: [], invoices: [], events: [], folios: [] });
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[65vh] overflow-y-auto p-3 divide-y divide-slate-800/80 text-xs">
          {!query && (
            <div className="py-8 text-center text-slate-500">
              <p className="font-medium text-slate-400">Search CCULB PMS Enterprise Database</p>
              <p className="text-[11px] mt-1">Try searching "Rahman", "201", "RES-2026", "INV", "Padma", or phone "+880"</p>
            </div>
          )}

          {query && !hasAnyResults && (
            <div className="py-8 text-center text-slate-500">
              <p>No matching PMS records found for "<span className="text-amber-400">{query}</span>"</p>
              <p className="text-[11px] mt-1">Verify spelling or search by room number or phone digits</p>
            </div>
          )}

          {/* GUESTS GROUP */}
          {results.guests.length > 0 && (
            <div className="py-2.5">
              <div className="flex items-center space-x-2 text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5" />
                <span>Guests ({results.guests.length})</span>
              </div>
              <div className="space-y-1">
                {results.guests.map(g => (
                  <div
                    key={g.id}
                    onClick={() => {
                      onSelectResult('guest', g.id, g);
                      onClose();
                    }}
                    className="p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-200 group-hover:text-amber-300">{g.fullName}</span>
                        <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400 font-mono">{g.guestCode}</span>
                        {g.vipStatus && <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300 font-bold">VIP</span>}
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{g.phone}</span>
                        </span>
                        {g.company && <span>• {g.company}</span>}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESERVATIONS GROUP */}
          {results.reservations.length > 0 && (
            <div className="py-2.5">
              <div className="flex items-center space-x-2 text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Reservations ({results.reservations.length})</span>
              </div>
              <div className="space-y-1">
                {results.reservations.map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      onSelectResult('reservation', r.id, r);
                      onClose();
                    }}
                    className="p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-emerald-300">{r.reservationNumber}</span>
                        <span className="text-slate-200">{r.guestName}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          r.status === 'Checked-In' ? 'bg-blue-500/20 text-blue-300' :
                          r.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {r.roomTypeName} {r.assignedRoomNumber ? `(Room ${r.assignedRoomNumber})` : ''} • {r.arrivalDate} → {r.departureDate}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROOMS GROUP */}
          {results.rooms.length > 0 && (
            <div className="py-2.5">
              <div className="flex items-center space-x-2 text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-2">
                <BedDouble className="w-3.5 h-3.5" />
                <span>Rooms ({results.rooms.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {results.rooms.map(rm => (
                  <div
                    key={rm.id}
                    onClick={() => {
                      onSelectResult('room', rm.id, rm);
                      onClose();
                    }}
                    className="p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-base text-slate-100 group-hover:text-cyan-300">
                          {rm.roomNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{rm.roomTypeName}</span>
                      </div>
                      <span className={`text-[10px] px-1 rounded font-semibold ${
                        rm.operationalStatus === 'Occupied' ? 'bg-rose-500/20 text-rose-300' :
                        rm.operationalStatus === 'Available' ? 'bg-emerald-500/20 text-emerald-300' :
                        rm.operationalStatus === 'Reserved' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {rm.operationalStatus}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INVOICES & FOLIOS GROUP */}
          {(results.invoices.length > 0 || results.folios.length > 0) && (
            <div className="py-2.5">
              <div className="flex items-center space-x-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Invoices & Folios ({results.invoices.length + results.folios.length})</span>
              </div>
              <div className="space-y-1">
                {results.invoices.map(inv => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      onSelectResult('invoice', inv.id, inv);
                      onClose();
                    }}
                    className="p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-indigo-300">{inv.invoiceNumber}</span>
                        <span className="text-slate-200">{inv.guestOrClientName}</span>
                        <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-300 font-mono">
                          ৳{inv.grandTotal.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{inv.stayOrEventDetails} • {inv.roomOrHall}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                ))}
                {results.folios.map(f => (
                  <div
                    key={f.id}
                    onClick={() => {
                      onSelectResult('folio', f.id, f);
                      onClose();
                    }}
                    className="p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-amber-300">{f.folioNumber}</span>
                        <span className="text-slate-200">{f.guestName} (Room {f.roomNumber})</span>
                        <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">
                          Bal: ৳{f.balance.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Status: {f.status} • Total: ৳{f.grandTotal.toLocaleString()}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EVENTS GROUP */}
          {results.events.length > 0 && (
            <div className="py-2.5">
              <div className="flex items-center space-x-2 text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2">
                <PartyPopper className="w-3.5 h-3.5" />
                <span>Convention Events ({results.events.length})</span>
              </div>
              <div className="space-y-1">
                {results.events.map(ev => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      onSelectResult('event', ev.id, ev);
                      onClose();
                    }}
                    className="p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-purple-300">{ev.eventNumber}</span>
                        <span className="text-slate-200 font-semibold">{ev.eventName}</span>
                        <span className="text-[10px] px-1 rounded bg-purple-500/20 text-purple-300">{ev.hallName}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{ev.clientName} • {ev.eventDate} ({ev.startTime} - {ev.endTime}) • {ev.guestCount} Pax</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">ESC</kbd> to exit</span>
          </div>
          <span className="font-mono text-slate-400">CCULB Unified Enterprise Lookup</span>
        </div>
      </div>
    </div>
  );
};
