import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed, Plus, Minus, Trash2, CreditCard,
  BedDouble, CheckCircle2, Search, ShoppingBag, Receipt,
  Clock, ShieldAlert, AlertCircle, Printer, Wine, Coffee,
  FileText, History, Check, X, Lock
} from 'lucide-react';
import { pmsService } from '../services/pmsService';
import { PmsDatabaseState } from '../services/mockPmsDatabase';
import { RestaurantOrder } from '../types/pms';

interface MenuItem {
  id: string;
  name: string;
  category: 'Bengali' | 'Continental' | 'Bar & Drinks' | 'Breakfast' | 'Dessert';
  price: number;
  description: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'CCULB Traditional Kacchi Biryani', category: 'Bengali', price: 650, description: 'Fragrant aromatic basmati with mutton, potato & boiled egg' },
  { id: 'm2', name: 'Hilsa Mustard Curry (Shorshe Ilish)', category: 'Bengali', price: 850, description: 'Fresh Meghna river Hilsa with mustard paste & green chili' },
  { id: 'm3', name: 'Grilled Chicken Steak w/ Mashed Potato', category: 'Continental', price: 720, description: 'Herb marinated boneless breast with mushroom sauce' },
  { id: 'm4', name: 'Club Sandwich with French Fries', category: 'Continental', price: 420, description: 'Triple-decker chicken, egg, cheese and crisp lettuce' },
  { id: 'm5', name: 'Continental Buffet Breakfast', category: 'Breakfast', price: 550, description: 'Eggs to order, chicken sausage, toast, jam & juice' },
  { id: 'm6', name: 'Traditional Paratha & Beef Bhuna', category: 'Breakfast', price: 480, description: 'Layered butter paratha with slow-cooked beef masala' },
  { id: 'm7', name: 'Fresh Seasonal Green Coconut Water', category: 'Bar & Drinks', price: 120, description: 'Chilled natural Daab water' },
  { id: 'm8', name: 'Resort Special Cold Coffee with Ice Cream', category: 'Bar & Drinks', price: 240, description: 'Rich espresso blend topped with vanilla scoop' },
  { id: 'm9', name: 'Blue Lagoon Mocktail & Citrus Cooler', category: 'Bar & Drinks', price: 280, description: 'Curacao blend, lime, mint & sparkling soda' },
  { id: 'm10', name: 'Warm Chocolate Lava Cake', category: 'Dessert', price: 320, description: 'Molten chocolate center with vanilla bean cream' }
];

interface RestaurantViewProps {
  onPrintInvoice?: (orderOrInvoice: any) => void;
}

export const RestaurantView: React.FC<RestaurantViewProps> = ({ onPrintInvoice }) => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchMenu, setSearchMenu] = useState<string>('');
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);

  // POS Order Parameters
  const [orderType, setOrderType] = useState<'in-room-dining' | 'restaurant-table' | 'bar-lounge' | 'takeaway'>('in-room-dining');
  const [selectedStayId, setSelectedStayId] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('Table 04');
  const [deliverySchedule, setDeliverySchedule] = useState<string>('Immediate (15-20 mins)');
  const [includeTrayCharge, setIncludeTrayCharge] = useState<boolean>(true);
  const [kitchenNotes, setKitchenNotes] = useState<string>('');
  const [billingMethod, setBillingMethod] = useState<'room-charge' | 'direct-pay'>('room-charge');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit Card' | 'bKash / Mobile Pay'>('Cash');
  const [successMessage, setSuccessMessage] = useState('');
  const [lastBilledOrder, setLastBilledOrder] = useState<RestaurantOrder | null>(null);

  // Voiding State
  const [orderToVoid, setOrderToVoid] = useState<RestaurantOrder | null>(null);
  const [voidReason, setVoidReason] = useState<string>('');
  const [isVoiding, setIsVoiding] = useState<boolean>(false);

  useEffect(() => {
    return pmsService.subscribe(setDb);
  }, []);

  const inHouseStays = db.stays.filter(s => s.status === 'Active');
  const selectedStay = inHouseStays.find(s => s.id === selectedStayId);
  const isSelectedStayStopPost = !!selectedStay?.stopPost;
  const canVoidBills = pmsService.hasPermission('can_void_bills');

  useEffect(() => {
    if (inHouseStays.length > 0 && !selectedStayId) {
      setSelectedStayId(inHouseStays[0].id);
    }
  }, [inHouseStays, selectedStayId]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.item.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as { item: MenuItem; quantity: number }[];
    });
  };

  const rawSubtotal = cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
  const trayCharge = (orderType === 'in-room-dining' && includeTrayCharge) ? 100 : 0;
  const subtotal = rawSubtotal + trayCharge;
  const vat = Math.round(subtotal * 0.15);
  const serviceCharge = Math.round(subtotal * 0.10);
  const grandTotal = subtotal + vat + serviceCharge;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const selectedStay = inHouseStays.find(s => s.id === selectedStayId);
    const guestName = (orderType === 'in-room-dining' || billingMethod === 'room-charge') && selectedStay
      ? selectedStay.guestName
      : 'Walk-in Guest / Table Customer';

    const roomNumber = (orderType === 'in-room-dining' || billingMethod === 'room-charge') && selectedStay
      ? selectedStay.roomNumber
      : undefined;

    const folioId = billingMethod === 'room-charge' && selectedStay
      ? selectedStay.folioId
      : undefined;

    try {
      const order = pmsService.createRestaurantOrder({
        orderType,
        stayId: selectedStay?.id,
        guestName,
        roomNumber,
        folioId,
        tableNumber: orderType === 'restaurant-table' ? tableNumber : undefined,
        items: cart.map(i => ({
          name: i.item.name,
          quantity: i.quantity,
          unitPrice: i.item.price,
          totalPrice: i.item.price * i.quantity
        })),
        subtotal,
        tax: vat + serviceCharge,
        total: grandTotal,
        paymentStatus: billingMethod === 'room-charge' ? 'Billed-To-Room' : 'Paid-Direct',
        paymentMethod: billingMethod === 'room-charge' ? 'Room Folio' : paymentMethod,
        inRoomDiningDetails: orderType === 'in-room-dining' ? {
          trayChargeIncluded: includeTrayCharge,
          scheduledDeliveryTime: deliverySchedule,
          kitchenNotes: kitchenNotes.trim()
        } : undefined
      });

      setLastBilledOrder(order);

      if (billingMethod === 'room-charge') {
        setSuccessMessage(`Order ${order.orderNumber} (৳${grandTotal.toLocaleString()}) charged to Room ${roomNumber} (${guestName}).`);
      } else {
        setSuccessMessage(`Order ${order.orderNumber} (৳${grandTotal.toLocaleString()}) paid via ${paymentMethod}.`);
      }

      setCart([]);
      setKitchenNotes('');
    } catch (err: any) {
      alert(`Order Placement Error: ${err.message}`);
    }
  };

  const handleExecuteVoid = () => {
    if (!orderToVoid) return;
    if (!voidReason.trim()) {
      alert('Please provide an official justification for voiding this bill.');
      return;
    }

    try {
      pmsService.voidRestaurantOrder(orderToVoid.id, voidReason.trim());
      setSuccessMessage(`Bill ${orderToVoid.orderNumber} has been VOIDED.`);
      setOrderToVoid(null);
      setVoidReason('');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      alert(`Void Error: ${err.message}`);
    }
  };

  const filteredMenuItems = MENU_ITEMS.filter(m => {
    const matchCat = activeCategory === 'All' || m.category === activeCategory;
    const matchSearch = m.name.toLowerCase().includes(searchMenu.toLowerCase()) ||
      m.description.toLowerCase().includes(searchMenu.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Restaurant & In-Room Dining POS</h1>
              <p className="text-sm text-slate-300">
                In-Room dining room billing, Table dine-in, Bar Lounge tabs, and bill voiding management.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'pos'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            New POS Order
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            Order Ledger & Void Bills ({db.restaurantOrders.length})
          </button>
        </div>
      </div>

      {/* Success / Last Billed Order Notification */}
      {successMessage && (
        <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <span className="font-bold text-white text-sm block">Billing Completed Successfully</span>
              <span className="text-xs text-emerald-300">{successMessage}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastBilledOrder && onPrintInvoice && (
              <button
                type="button"
                onClick={() => onPrintInvoice(lastBilledOrder)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bill Invoice</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => { setSuccessMessage(''); setLastBilledOrder(null); }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Menu Selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category and Search Filter */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search menu items (e.g. Biryani, Hilsa, Steak, Mocktails)..."
                    value={searchMenu}
                    onChange={e => setSearchMenu(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {['All', 'Bengali', 'Continental', 'Bar & Drinks', 'Breakfast', 'Dessert'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      activeCategory === cat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMenuItems.map(item => {
                const inCart = cart.find(c => c.item.id === item.id);
                return (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-xs flex flex-col justify-between transition hover:border-amber-500/60 ${
                      inCart ? 'border-amber-500/70 bg-amber-500/5' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.name}
                        </h4>
                        <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0 text-sm">
                          ৳{item.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                        {item.category}
                      </span>

                      {inCart ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-xs text-slate-900 dark:text-white min-w-4 text-center">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold hover:bg-amber-600 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Cart & Order Billing */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                  Current POS Bill
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {cart.reduce((s, i) => s + i.quantity, 0)} Items
                </span>
              </div>

              {/* Order Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Dining Mode *</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setOrderType('in-room-dining')}
                    className={`p-2 rounded-xl border text-left font-semibold transition flex items-center gap-2 ${
                      orderType === 'in-room-dining'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <BedDouble className="w-4 h-4" />
                    In-Room Dining
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('restaurant-table')}
                    className={`p-2 rounded-xl border text-left font-semibold transition flex items-center gap-2 ${
                      orderType === 'restaurant-table'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    Dine-in Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('bar-lounge')}
                    className={`p-2 rounded-xl border text-left font-semibold transition flex items-center gap-2 ${
                      orderType === 'bar-lounge'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Wine className="w-4 h-4" />
                    Bar & Lounge
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('takeaway')}
                    className={`p-2 rounded-xl border text-left font-semibold transition flex items-center gap-2 ${
                      orderType === 'takeaway'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Coffee className="w-4 h-4" />
                    Takeaway
                  </button>
                </div>
              </div>

              {/* In-Room Dining Details */}
              {orderType === 'in-room-dining' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Select In-House Room & Guest *</label>
                    <select
                      value={selectedStayId}
                      onChange={e => setSelectedStayId(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 text-slate-900 dark:text-white"
                    >
                      {inHouseStays.map(s => (
                        <option key={s.id} value={s.id}>
                          Room {s.roomNumber} — {s.guestName}{s.stopPost ? ' ⛔ [STOP POST ACTIVE]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Delivery Timing</label>
                      <input
                        type="text"
                        value={deliverySchedule}
                        onChange={e => setDeliverySchedule(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 text-[11px]"
                      />
                    </div>
                    <div className="flex items-center pt-3 gap-1.5">
                      <input
                        type="checkbox"
                        id="trayChargeCheck"
                        checked={includeTrayCharge}
                        onChange={e => setIncludeTrayCharge(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                      />
                      <label htmlFor="trayChargeCheck" className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                        Tray Charge (৳100)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400">Kitchen / Chef Instructions</label>
                    <input
                      type="text"
                      placeholder="e.g., Less spicy, extra cutlery, warm water"
                      value={kitchenNotes}
                      onChange={e => setKitchenNotes(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 text-[11px]"
                    />
                  </div>
                </div>
              )}

              {orderType === 'restaurant-table' && (
                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Table Number</label>
                  <select
                    value={tableNumber}
                    onChange={e => setTableNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white"
                  >
                    <option value="Table 01">Table 01 (Lake View)</option>
                    <option value="Table 02">Table 02 (Lake View)</option>
                    <option value="Table 03">Table 03 (Indoor)</option>
                    <option value="Table 04">Table 04 (Indoor)</option>
                    <option value="Table 05">Table 05 (Garden Deck)</option>
                    <option value="VIP Family Lounge">VIP Family Lounge</option>
                  </select>
                </div>
              )}

              {/* Cart Items List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Cart is empty. Select items from the menu.
                  </div>
                ) : (
                  cart.map(({ item, quantity }) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/50">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                        <div className="text-[10px] text-slate-400">৳{item.price} x {quantity}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">৳{(item.price * quantity).toLocaleString()}</span>
                        <button
                          onClick={() => updateQuantity(item.id, -quantity)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Financial Calculation Summary */}
              {cart.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>৳{rawSubtotal.toLocaleString()}</span>
                  </div>
                  {trayCharge > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Room Delivery Tray Charge:</span>
                      <span>৳{trayCharge}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>15% Government VAT:</span>
                    <span>৳{vat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>10% Service Charge:</span>
                    <span>৳{serviceCharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Total Amount:</span>
                    <span className="text-amber-500">৳{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Settlement Options */}
              {cart.length > 0 && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Payment & Settlement</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setBillingMethod('room-charge')}
                      className={`p-2 rounded-xl border text-center font-semibold transition relative ${
                        billingMethod === 'room-charge'
                          ? 'border-indigo-600 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                    >
                      <span>Bill to Room Folio</span>
                      {isSelectedStayStopPost && (
                        <span className="block text-[9px] text-rose-500 font-bold">⛔ Stop Post Lock</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingMethod('direct-pay')}
                      className={`p-2 rounded-xl border text-center font-semibold transition ${
                        billingMethod === 'direct-pay'
                          ? 'border-indigo-600 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                    >
                      Direct Pay (Counter)
                    </button>
                  </div>

                  {/* Stop Post Warning for Room Charge */}
                  {billingMethod === 'room-charge' && isSelectedStayStopPost && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs space-y-1 text-rose-800 dark:text-rose-200 animate-in fade-in">
                      <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                        <Lock className="w-4 h-4 shrink-0" />
                        <span>STOP POST RESTRICTION ACTIVE</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                        Room {selectedStay?.roomNumber} has a Stop Post restriction placed by Front Office:
                        <strong className="block mt-0.5 text-rose-900 dark:text-rose-100">"{selectedStay?.stopPostReason || 'Restricted by Front Desk'}"</strong>
                        Outlet billing to this folio is blocked. Please select <strong>Direct Pay (Counter)</strong> to collect payment directly or contact the Front Desk.
                      </p>
                    </div>
                  )}

                  {billingMethod === 'direct-pay' && (
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Cash">Cash Settlement</option>
                      <option value="Credit Card">Credit / Debit Card</option>
                      <option value="bKash / Mobile Pay">bKash / Nagad Mobile Pay</option>
                    </select>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || (billingMethod === 'room-charge' && isSelectedStayStopPost)}
              className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
                cart.length > 0 && !(billingMethod === 'room-charge' && isSelectedStayStopPost)
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              {billingMethod === 'room-charge' && isSelectedStayStopPost ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Room Charge Blocked (Stop Post Active)</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirm & Post POS Order (৳{grandTotal.toLocaleString()})</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Order History & Void Ledger */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-500" />
              Restaurant, Bar & Room Dining Order Ledger
            </h3>
            <span className="text-xs text-slate-500">
              Showing all recorded transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Room / Guest / Table</th>
                  <th className="px-4 py-3">Items Summary</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                  <th className="px-4 py-3">Settlement</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {db.restaurantOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      No restaurant orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  db.restaurantOrders.map(order => (
                    <tr key={order.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition ${order.voided ? 'opacity-50 bg-rose-50/20' : ''}`}>
                      <td className="px-4 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {order.orderType || 'Dining'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{order.guestName}</div>
                        <div className="text-[11px] text-slate-400">
                          {order.roomNumber ? `Room ${order.roomNumber}` : order.tableNumber || 'Counter'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="truncate text-[11px]" title={order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}>
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white">
                        <span className={order.voided ? 'line-through text-slate-400' : 'text-emerald-600 dark:text-emerald-400'}>
                          ৳{order.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {order.paymentMethod}
                      </td>
                      <td className="px-4 py-3.5">
                        {order.voided ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            VOIDED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onPrintInvoice && !order.voided && (
                            <button
                              type="button"
                              onClick={() => onPrintInvoice(order)}
                              className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1 transition"
                            >
                              <Printer className="w-3 h-3 text-amber-500" />
                              <span>Print Invoice</span>
                            </button>
                          )}
                          {!order.voided && (
                            <button
                              onClick={() => setOrderToVoid(order)}
                              disabled={!canVoidBills}
                              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                                canVoidBills
                                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-950 border border-rose-200 dark:border-rose-800'
                                  : 'text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              Void Bill
                            </button>
                          )}
                          {order.voided && (
                            <span className="text-[10px] text-rose-500 font-medium" title={order.voidReason}>
                              Reason: {order.voidReason}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Void Authorization Modal */}
      {orderToVoid && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Void Restaurant Bill {orderToVoid.orderNumber}?
                </h3>
                <p className="text-xs text-slate-500">
                  Amount: ৳{orderToVoid.total.toLocaleString()} ({orderToVoid.guestName})
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300">
              <p>• If billed to room folio, the corresponding charge on the guest folio will be automatically voided and subtracted.</p>
              <p className="mt-1">• This action will be permanently recorded in the Manager's Audit Trail.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Official Void Reason / Authorization Note *
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g., Wrong table charged / Guest cancelled order before kitchen prep"
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setOrderToVoid(null); setVoidReason(''); }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteVoid}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition"
              >
                Authorize & Void Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
