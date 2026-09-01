import React, { useState, useEffect, useCallback } from 'react';
import { pmsService } from './services/pmsService';
import { PmsDatabaseState } from './services/mockPmsDatabase';
import { Stay, Folio, Guest, EventBooking, Invoice, Room, Reservation, Payment } from './types/pms';

// Layout Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { PrintableModal } from './components/common/PrintableModal';

// Interactive Action Drawers & Modals
import { QuickCheckInDrawer } from './components/drawers/QuickCheckInDrawer';
import { QuickCheckOutDrawer } from './components/drawers/QuickCheckOutDrawer';
import { NewReservationModal } from './components/drawers/NewReservationModal';
import { RoomDetailDrawer } from './components/drawers/RoomDetailDrawer';
import { FolioDrawer } from './components/drawers/FolioDrawer';
import { GuestDetailDrawer } from './components/drawers/GuestDetailDrawer';
import { EventDetailDrawer } from './components/drawers/EventDetailDrawer';

// Primary Feature Views
import { DashboardView } from './views/DashboardView';
import { FrontDeskView } from './views/FrontDeskView';
import { ReservationsView } from './views/ReservationsView';
import { ReservationCalendarView } from './views/ReservationCalendarView';
import { RoomRackView } from './views/RoomRackView';
import { RoomTypesView } from './views/RoomTypesView';
import { GuestsView } from './views/GuestsView';
import { HousekeepingView } from './views/HousekeepingView';
import { MaintenanceView } from './views/MaintenanceView';
import { ConventionEventsView } from './views/ConventionEventsView';
import { ConventionCalendarView } from './views/ConventionCalendarView';
import { ConventionPackagesView } from './views/ConventionPackagesView';
import { RestaurantView } from './views/RestaurantView';
import { BillingFoliosView } from './views/BillingFoliosView';
import { BillingPaymentsView } from './views/BillingPaymentsView';
import { BillingInvoicesView } from './views/BillingInvoicesView';
import { ReportsView } from './views/ReportsView';
import { AlertsView } from './views/AlertsView';
import { AdminUsersView } from './views/AdminUsersView';
import { AdminAuditView } from './views/AdminAuditView';
import { AdminRoomsView } from './views/AdminRoomsView';
import { AdminHallsView } from './views/AdminHallsView';
import { NightAuditView } from './views/NightAuditView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());
  const [activeRoute, setActiveRoute] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Modal / Drawer States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInReservationId, setCheckInReservationId] = useState<string | undefined>(undefined);

  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [checkOutStayId, setCheckOutStayId] = useState<string | undefined>(undefined);

  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [reservationInitialRoomId, setReservationInitialRoomId] = useState<string | undefined>(undefined);
  const [reservationInitialDate, setReservationInitialDate] = useState<string | undefined>(undefined);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedFolioId, setSelectedFolioId] = useState<string | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Print Document State
  const [printModal, setPrintModal] = useState<{
    isOpen: boolean;
    type: 'invoice' | 'registration-card' | 'banquet-contract';
    data: any;
  }>({
    isOpen: false,
    type: 'invoice',
    data: null
  });

  // Subscribe to service state and Auto Night Audit monitor (05:00 AM)
  useEffect(() => {
    pmsService.checkAndTriggerAutoNightAudit();
    const timer = setInterval(() => {
      pmsService.checkAndTriggerAutoNightAudit();
    }, 60000);
    const unsub = pmsService.subscribe(setDb);
    return () => {
      clearInterval(timer);
      unsub();
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or / opens Global Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.altKey && e.key === '1') {
        setActiveRoute('dashboard');
      } else if (e.altKey && e.key === '2') {
        setActiveRoute('front-desk');
      } else if (e.altKey && e.key === '3') {
        setActiveRoute('room-rack');
      } else if (e.altKey && e.key === '4') {
        setIsNewReservationOpen(true);
      } else if (e.altKey && e.key === '5') {
        setIsCheckInOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Action Triggers
  const openCheckIn = useCallback((reservationId?: string) => {
    setCheckInReservationId(reservationId);
    setIsCheckInOpen(true);
  }, []);

  const openCheckout = useCallback((stayId: string) => {
    setCheckOutStayId(stayId);
    setIsCheckOutOpen(true);
  }, []);

  const openNewReservation = useCallback((roomId?: string, date?: string) => {
    setReservationInitialRoomId(roomId);
    setReservationInitialDate(date);
    setIsNewReservationOpen(true);
  }, []);

  const openRoomDetail = useCallback((roomId: string) => {
    setSelectedRoomId(roomId);
  }, []);

  const openFolio = useCallback((folioId: string) => {
    setSelectedFolioId(folioId);
  }, []);

  const openGuest = useCallback((guestId: string) => {
    setSelectedGuestId(guestId);
  }, []);

  const openEvent = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
  }, []);

  // Print Handlers
  const handlePrintInvoice = useCallback((folioOrInvoice: Folio | Invoice) => {
    setPrintModal({
      isOpen: true,
      type: 'invoice',
      data: folioOrInvoice
    });
  }, []);

  const handlePrintFolio = useCallback((folio: Folio) => {
    setPrintModal({
      isOpen: true,
      type: 'folio',
      data: folio
    });
  }, []);

  const handlePrintReservation = useCallback((reservation: Reservation) => {
    setPrintModal({
      isOpen: true,
      type: 'reservation-confirmation',
      data: reservation
    });
  }, []);

  const handlePrintCheckoutForm = useCallback((data: { stay: Stay; folio?: Folio; invoice?: Invoice }) => {
    setPrintModal({
      isOpen: true,
      type: 'checkout-form',
      data: data
    });
  }, []);

  const handlePrintRegCard = useCallback((stay: Stay) => {
    setPrintModal({
      isOpen: true,
      type: 'registration-card',
      data: stay
    });
  }, []);

  const handlePrintPaymentReceipt = useCallback((payment: Payment) => {
    setPrintModal({
      isOpen: true,
      type: 'payment-receipt',
      data: payment
    });
  }, []);

  const handlePrintBanquetContract = useCallback((event: EventBooking) => {
    setPrintModal({
      isOpen: true,
      type: 'banquet-contract',
      data: event
    });
  }, []);

  const handlePrintOperationalReport = useCallback((reportData: any) => {
    setPrintModal({
      isOpen: true,
      type: 'daily-flash-report',
      data: reportData
    });
  }, []);

  return (
    <div className="flex h-screen bg-[#F3F4F6] text-gray-900 font-sans overflow-hidden antialiased select-none">
      {/* 1. Left Enterprise Navigation Sidebar */}
      <Sidebar
        currentRoute={activeRoute}
        onNavigate={setActiveRoute}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        mobileOpen={false}
        onCloseMobile={() => {}}
      />

      {/* 2. Main Content View Area */}
      <div className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F3F4F6] transition-all duration-200 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Top Header Bar */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQuickReservation={() => openNewReservation()}
          onOpenQuickCheckIn={() => openCheckIn()}
          onNavigate={setActiveRoute}
          activeRoute={activeRoute}
        />

        {/* Dynamic View Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F3F4F6]">
          <div className="max-w-7xl mx-auto pb-12">
            {activeRoute === 'dashboard' && (
              <DashboardView
                onNavigate={setActiveRoute}
                onOpenCheckIn={() => openCheckIn()}
                onOpenNewReservation={() => openNewReservation()}
                onSelectRoom={openRoomDetail}
                onSelectStay={openCheckout}
              />
            )}

            {activeRoute === 'front-desk' && (
              <FrontDeskView
                onOpenCheckIn={openCheckIn}
                onOpenCheckout={openCheckout}
                onOpenFolio={openFolio}
                onOpenRoomDetail={openRoomDetail}
                onPrintRegCard={handlePrintRegCard}
                onOpenNewReservation={() => openNewReservation()}
              />
            )}

            {activeRoute === 'reservations' && (
              <ReservationsView
                onOpenNewReservation={() => openNewReservation()}
                onOpenCheckIn={openCheckIn}
                onSelectGuest={openGuest}
                onPrintReservation={handlePrintReservation}
              />
            )}

            {activeRoute === 'reservation-calendar' && (
              <ReservationCalendarView
                onOpenNewReservation={openNewReservation}
                onOpenCheckIn={openCheckIn}
                onSelectRoom={openRoomDetail}
              />
            )}

            {activeRoute === 'room-rack' && (
              <RoomRackView
                onSelectRoom={openRoomDetail}
                onOpenNewReservation={openNewReservation}
              />
            )}

            {activeRoute === 'room-types' && (
              <RoomTypesView />
            )}

            {activeRoute === 'guests' && (
              <GuestsView
                onSelectGuest={openGuest}
              />
            )}

            {activeRoute === 'housekeeping' && (
              <HousekeepingView
                onSelectRoom={openRoomDetail}
              />
            )}

            {activeRoute === 'maintenance' && (
              <MaintenanceView />
            )}

            {activeRoute === 'convention-events' && (
              <ConventionEventsView
                onSelectEvent={openEvent}
                onPrintContract={handlePrintBanquetContract}
              />
            )}

            {activeRoute === 'convention-calendar' && (
              <ConventionCalendarView
                onSelectEvent={openEvent}
              />
            )}

            {activeRoute === 'convention-packages' && (
              <ConventionPackagesView />
            )}

            {activeRoute === 'restaurant' && (
              <RestaurantView />
            )}

            {activeRoute === 'billing-folios' && (
              <BillingFoliosView
                onOpenFolio={openFolio}
                onPrintInvoice={handlePrintInvoice}
                onPrintFolio={handlePrintFolio}
              />
            )}

            {activeRoute === 'billing-payments' && (
              <BillingPaymentsView
                onPrintReceipt={handlePrintPaymentReceipt}
              />
            )}

            {activeRoute === 'billing-invoices' && (
              <BillingInvoicesView
                onPrintInvoiceDirect={handlePrintInvoice}
              />
            )}

            {activeRoute === 'night-audit' && (
              <NightAuditView />
            )}

            {activeRoute === 'reports' && (
              <ReportsView
                onPrintReport={handlePrintOperationalReport}
              />
            )}

            {activeRoute === 'alerts' && (
              <AlertsView />
            )}

            {activeRoute === 'admin-rooms' && (
              <AdminRoomsView />
            )}

            {activeRoute === 'admin-halls' && (
              <AdminHallsView />
            )}

            {activeRoute === 'admin-users' && (
              <AdminUsersView />
            )}

            {activeRoute === 'admin-audit' && (
              <AdminAuditView />
            )}

            {activeRoute === 'settings' && (
              <SettingsView />
            )}
          </div>
        </main>
      </div>

      {/* 3. Global Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectRoom={openRoomDetail}
        onSelectGuest={openGuest}
        onSelectReservation={openCheckIn}
        onSelectStay={openCheckout}
        onSelectEvent={openEvent}
        onSelectFolio={openFolio}
      />

      {/* 4. Action Drawers & Transaction Modals */}
      <QuickCheckInDrawer
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        preselectedReservationId={checkInReservationId}
        onSuccess={() => {
          setIsCheckInOpen(false);
          setActiveRoute('front-desk');
        }}
      />

      <QuickCheckOutDrawer
        isOpen={isCheckOutOpen}
        onClose={() => setIsCheckOutOpen(false)}
        stayId={checkOutStayId}
        onSuccess={() => {
          setIsCheckOutOpen(false);
          setActiveRoute('front-desk');
        }}
      />

      <NewReservationModal
        isOpen={isNewReservationOpen}
        onClose={() => setIsNewReservationOpen(false)}
        preselectedRoomId={reservationInitialRoomId}
        preselectedDate={reservationInitialDate}
        onSuccess={(resId) => {
          setIsNewReservationOpen(false);
          setActiveRoute('reservations');
        }}
      />

      {selectedRoomId && (
        <RoomDetailDrawer
          isOpen={!!selectedRoomId}
          onClose={() => setSelectedRoomId(null)}
          roomId={selectedRoomId}
          onOpenCheckIn={openCheckIn}
          onOpenCheckout={openCheckout}
        />
      )}

      {selectedFolioId && (
        <FolioDrawer
          isOpen={!!selectedFolioId}
          onClose={() => setSelectedFolioId(null)}
          folioId={selectedFolioId}
          onPrintInvoice={handlePrintInvoice}
        />
      )}

      {selectedGuestId && (
        <GuestDetailDrawer
          isOpen={!!selectedGuestId}
          onClose={() => setSelectedGuestId(null)}
          guestId={selectedGuestId}
          onBookForGuest={(guest) => {
            setSelectedGuestId(null);
            openNewReservation();
          }}
        />
      )}

      {selectedEventId && (
        <EventDetailDrawer
          isOpen={!!selectedEventId}
          onClose={() => setSelectedEventId(null)}
          eventId={selectedEventId}
          onPrintContract={handlePrintBanquetContract}
        />
      )}

      {/* 5. High Fidelity Printable Modal (Invoices, Reg Cards, Banquet Contracts) */}
      <PrintableModal
        isOpen={printModal.isOpen}
        onClose={() => setPrintModal({ isOpen: false, type: 'invoice', data: null })}
        documentType={printModal.type}
        type={printModal.type}
        data={printModal.data}
      />
    </div>
  );
}
