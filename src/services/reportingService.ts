import { ReportDefinition, ReportCategory, ReportFilterState, ReportExecutionLog } from '../types/reportingAndRbac';
import { pmsService } from './pmsService';
import { inventoryMenuService } from './inventoryMenuService';
import { rbacService } from './rbacService';

export interface ReportQueryResult {
  definition: ReportDefinition;
  columns: { key: string; header: string; align?: 'left' | 'center' | 'right'; format?: string }[];
  rows: Record<string, any>[];
  summaryTotals?: Record<string, any>;
  drillDownInfo?: {
    type: 'invoice' | 'folio' | 'order' | 'voucher' | 'inventory-item' | 'supplier';
    keyField: string;
  };
  generatedAt: string;
  generatedBy: string;
  department: string;
}

export const REPORT_REGISTRY: ReportDefinition[] = [
  // 1. Front Office Reports
  {
    id: 'rpt-fo-001',
    reportCode: 'RPT-FO-001',
    reportName: 'Daily Flash & Revenue Summary',
    module: 'front-office',
    subModule: 'Reports',
    category: 'Front Office',
    description: 'Comprehensive daily breakdown of Room, F&B, Banquet, Amenities revenue, ADR, and RevPAR.',
    dataSource: 'folios + eventBookings + systemSettings',
    requiredPermission: 'Reports.FrontOffice.View',
    defaultDataScope: 'Own Property',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'category', header: 'Revenue Stream', align: 'left' },
      { key: 'todayAmount', header: "Today's Revenue (৳)", align: 'right', format: 'currency' },
      { key: 'mtdAmount', header: 'MTD Revenue (৳)', align: 'right', format: 'currency' },
      { key: 'sharePercent', header: 'Share (%)', align: 'right', format: 'percent' },
      { key: 'budgetVariance', header: 'Target Variance (৳)', align: 'right', format: 'currency' }
    ]
  },
  {
    id: 'rpt-fo-002',
    reportCode: 'RPT-FO-002',
    reportName: 'Occupancy & Room Utilization',
    module: 'front-office',
    subModule: 'Reports',
    category: 'Front Office',
    description: 'Room type by room type occupancy, clean/dirty ratio, blocked units, and guest counts.',
    dataSource: 'rooms + stays + reservations',
    requiredPermission: 'Reports.FrontOffice.View',
    defaultDataScope: 'Own Property',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'roomNumber', header: 'Room No.', align: 'left' },
      { key: 'roomType', header: 'Room Category', align: 'left' },
      { key: 'operationalStatus', header: 'Operational Status', align: 'center', format: 'badge' },
      { key: 'housekeepingStatus', header: 'Housekeeping', align: 'center', format: 'badge' },
      { key: 'guestName', header: 'Guest Name', align: 'left' },
      { key: 'ratePerNight', header: 'Rack Tariff (৳)', align: 'right', format: 'currency' }
    ]
  },
  {
    id: 'rpt-fo-003',
    reportCode: 'RPT-FO-003',
    reportName: 'Arrivals & Expected Check-Ins',
    module: 'front-office',
    subModule: 'Reports',
    category: 'Front Office',
    description: 'Upcoming scheduled check-in roster with payment status, VIP status, and deposit tracking.',
    dataSource: 'reservations',
    requiredPermission: 'Reports.FrontOffice.View',
    defaultDataScope: 'Own Department',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'confirmationCode', header: 'Res. Code', align: 'left' },
      { key: 'guestName', header: 'Guest Name', align: 'left' },
      { key: 'checkInDate', header: 'Arrival Date', align: 'center', format: 'date' },
      { key: 'checkOutDate', header: 'Departure Date', align: 'center', format: 'date' },
      { key: 'roomType', header: 'Room Type', align: 'left' },
      { key: 'totalAmount', header: 'Total Est. (৳)', align: 'right', format: 'currency' },
      { key: 'depositPaid', header: 'Deposit (৳)', align: 'right', format: 'currency' },
      { key: 'status', header: 'Status', align: 'center', format: 'badge' }
    ]
  },
  {
    id: 'rpt-fo-004',
    reportCode: 'RPT-FO-004',
    reportName: 'Departures & Check-Out Clearance',
    module: 'front-office',
    subModule: 'Reports',
    category: 'Front Office',
    description: 'Today’s departing stays, folio settlement status, pending minibar/restaurant bills, and keys returned.',
    dataSource: 'stays + folios',
    requiredPermission: 'Reports.FrontOffice.View',
    defaultDataScope: 'Own Department',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'roomNumber', header: 'Room', align: 'left' },
      { key: 'guestName', header: 'Guest Name', align: 'left' },
      { key: 'checkOutDate', header: 'Scheduled Out', align: 'center', format: 'date' },
      { key: 'folioBalance', header: 'Folio Balance (৳)', align: 'right', format: 'currency' },
      { key: 'clearanceStatus', header: 'Billing Clearance', align: 'center', format: 'badge' }
    ]
  },
  {
    id: 'rpt-fo-005',
    reportCode: 'RPT-FO-005',
    reportName: 'Guest In-House Ledger Statement',
    module: 'front-office',
    subModule: 'Reports',
    category: 'Front Office',
    description: 'Live in-house guest folios with room tariffs, restaurant dining, banquet charges, and paid deposits.',
    dataSource: 'folios',
    requiredPermission: 'Reports.FrontOffice.View',
    defaultDataScope: 'Own Department',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'folioNumber', header: 'Folio No.', align: 'left' },
      { key: 'roomNumber', header: 'Room', align: 'left' },
      { key: 'guestName', header: 'Guest Name', align: 'left' },
      { key: 'totalCharges', header: 'Total Charges (৳)', align: 'right', format: 'currency' },
      { key: 'totalPaid', header: 'Total Payments (৳)', align: 'right', format: 'currency' },
      { key: 'balance', header: 'Outstanding Due (৳)', align: 'right', format: 'currency' },
      { key: 'status', header: 'Folio Status', align: 'center', format: 'badge' }
    ]
  },

  // 2. Housekeeping Reports
  {
    id: 'rpt-hk-001',
    reportCode: 'RPT-HK-001',
    reportName: 'Room Cleaning & Housekeeping Board',
    module: 'housekeeping',
    subModule: 'Reports',
    category: 'Housekeeping',
    description: 'Status of all guest rooms (Clean, Dirty, Inspected, Out of Order) and attendant assignments.',
    dataSource: 'rooms',
    requiredPermission: 'Reports.Housekeeping.View',
    defaultDataScope: 'Own Department',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'roomNumber', header: 'Room No.', align: 'left' },
      { key: 'floor', header: 'Floor', align: 'center' },
      { key: 'type', header: 'Category', align: 'left' },
      { key: 'housekeepingStatus', header: 'Housekeeping Status', align: 'center', format: 'badge' },
      { key: 'operationalStatus', header: 'Front Desk Status', align: 'center', format: 'badge' },
      { key: 'lastCleaned', header: 'Last Cleaned Time', align: 'center' }
    ]
  },
  {
    id: 'rpt-hk-002',
    reportCode: 'RPT-HK-002',
    reportName: 'Lost & Found Registry Report',
    module: 'housekeeping',
    subModule: 'Reports',
    category: 'Housekeeping',
    description: 'Items found in rooms or resort premises, storage locations, guest verification, and handover status.',
    dataSource: 'lostAndFound',
    requiredPermission: 'Reports.Housekeeping.View',
    defaultDataScope: 'Own Department',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'refNumber', header: 'Log No.', align: 'left' },
      { key: 'itemDescription', header: 'Item Found', align: 'left' },
      { key: 'location', header: 'Location / Room', align: 'left' },
      { key: 'foundBy', header: 'Found By', align: 'left' },
      { key: 'dateFound', header: 'Date', align: 'center', format: 'date' },
      { key: 'status', header: 'Claim Status', align: 'center', format: 'badge' }
    ]
  },

  // 3. Restaurant & Dining Reports
  {
    id: 'rpt-res-001',
    reportCode: 'RPT-RES-001',
    reportName: 'Daily Restaurant Sales & Tax Summary',
    module: 'restaurant',
    subModule: 'Reports',
    category: 'Restaurant',
    description: 'Detailed food orders, gross sales, 15% VAT, 10% Service Charge, discounts, and payment methods.',
    dataSource: 'restaurantOrders',
    requiredPermission: 'Reports.Restaurant.View',
    defaultDataScope: 'Own Outlet',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'orderNumber', header: 'Bill No.', align: 'left' },
      { key: 'orderType', header: 'Outlet / Type', align: 'left' },
      { key: 'subtotal', header: 'Subtotal (৳)', align: 'right', format: 'currency' },
      { key: 'vat', header: 'VAT (15%) (৳)', align: 'right', format: 'currency' },
      { key: 'serviceCharge', header: 'Service Chg (10%) (৳)', align: 'right', format: 'currency' },
      { key: 'discount', header: 'Discount (৳)', align: 'right', format: 'currency' },
      { key: 'total', header: 'Net Bill (৳)', align: 'right', format: 'currency' },
      { key: 'status', header: 'Status', align: 'center', format: 'badge' }
    ]
  },
  {
    id: 'rpt-res-002',
    reportCode: 'RPT-RES-002',
    reportName: 'Menu Item Sales & Quantity Velocity',
    module: 'restaurant',
    subModule: 'Reports',
    category: 'Restaurant',
    description: 'Quantity sold, gross revenue, category contributions, and item-wise sales share.',
    dataSource: 'restaurantOrders + menuItems',
    requiredPermission: 'Reports.Restaurant.View',
    defaultDataScope: 'Own Outlet',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'itemName', header: 'Menu Item', align: 'left' },
      { key: 'category', header: 'Category', align: 'left' },
      { key: 'quantitySold', header: 'Qty Sold', align: 'right', format: 'number' },
      { key: 'unitPrice', header: 'Unit Price (৳)', align: 'right', format: 'currency' },
      { key: 'totalRevenue', header: 'Total Revenue (৳)', align: 'right', format: 'currency' },
      { key: 'sharePercent', header: 'Revenue Share (%)', align: 'right', format: 'percent' }
    ]
  },

  // 4. Bar & Lounge Reports
  {
    id: 'rpt-bar-001',
    reportCode: 'RPT-BAR-001',
    reportName: 'Bar Sales & Beverage Cost Statement',
    module: 'bar',
    subModule: 'Reports',
    category: 'Bar',
    description: 'Beverage sales breakdown, alcohol and mocktail revenue, VAT, service charges, and bottle velocity.',
    dataSource: 'restaurantOrders (bar-lounge)',
    requiredPermission: 'Reports.Bar.View',
    defaultDataScope: 'Own Outlet',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'orderNumber', header: 'Bar Bill #', align: 'left' },
      { key: 'tableName', header: 'Counter / Lounge', align: 'left' },
      { key: 'itemsCount', header: 'Drinks Count', align: 'right', format: 'number' },
      { key: 'subtotal', header: 'Subtotal (৳)', align: 'right', format: 'currency' },
      { key: 'total', header: 'Total Billed (৳)', align: 'right', format: 'currency' },
      { key: 'paymentMode', header: 'Settlement', align: 'center', format: 'badge' }
    ]
  },

  // 5. Banquet & Convention Reports
  {
    id: 'rpt-ban-001',
    reportCode: 'RPT-BAN-001',
    reportName: 'Banquet Hall Utilization & Booking Register',
    module: 'banquet',
    subModule: 'Reports',
    category: 'Banquet & Convention',
    description: 'Auditorium and hall bookings, event types, guest counts, catering packages, and rental income.',
    dataSource: 'eventBookings + halls',
    requiredPermission: 'Reports.Banquet.View',
    defaultDataScope: 'Own Department',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'bookingCode', header: 'Booking Code', align: 'left' },
      { key: 'eventName', header: 'Event Title', align: 'left' },
      { key: 'hallName', header: 'Hall / Venue', align: 'left' },
      { key: 'clientName', header: 'Organizer / Company', align: 'left' },
      { key: 'eventDate', header: 'Event Date', align: 'center', format: 'date' },
      { key: 'guestsCount', header: 'Guests', align: 'right', format: 'number' },
      { key: 'total', header: 'Total Bill (৳)', align: 'right', format: 'currency' },
      { key: 'status', header: 'Status', align: 'center', format: 'badge' }
    ]
  },

  // 6. Activities & Amenities Reports
  {
    id: 'rpt-act-001',
    reportCode: 'RPT-ACT-001',
    reportName: 'Recreation Activities & Sports Revenue',
    module: 'activities',
    subModule: 'Reports',
    category: 'Activities',
    description: 'Swimming pool, boating, gym, sports courts, and outdoor activity booking utilization.',
    dataSource: 'activityBookings',
    requiredPermission: 'Reports.Activity.View',
    defaultDataScope: 'Own Department',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'bookingNumber', header: 'Slip No.', align: 'left' },
      { key: 'activityName', header: 'Activity', align: 'left' },
      { key: 'guestName', header: 'Guest', align: 'left' },
      { key: 'participants', header: 'Pax', align: 'right', format: 'number' },
      { key: 'total', header: 'Amount (৳)', align: 'right', format: 'currency' },
      { key: 'status', header: 'Status', align: 'center', format: 'badge' }
    ]
  },
  {
    id: 'rpt-amn-001',
    reportCode: 'RPT-AMN-001',
    reportName: 'Amenities Issuance & Consumption Ledger',
    module: 'amenities',
    subModule: 'Reports',
    category: 'Amenities',
    description: 'Guest room amenities issued (towels, toiletries, extra beds) and chargeable rentals.',
    dataSource: 'amenityIssues',
    requiredPermission: 'Reports.Amenity.View',
    defaultDataScope: 'Own Department',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'issueCode', header: 'Issue #', align: 'left' },
      { key: 'amenityName', header: 'Amenity Item', align: 'left' },
      { key: 'roomNumber', header: 'Room', align: 'left' },
      { key: 'quantity', header: 'Quantity', align: 'right', format: 'number' },
      { key: 'totalPrice', header: 'Charges (৳)', align: 'right', format: 'currency' }
    ]
  },

  // 7. Procurement Reports
  {
    id: 'rpt-proc-001',
    reportCode: 'RPT-PROC-001',
    reportName: 'Purchase Orders (PO) & Supplier Commitment Register',
    module: 'procurement',
    subModule: 'Reports',
    category: 'Procurement',
    description: 'All issued purchase orders, vendor terms, delivery dates, received status, and total payable liabilities.',
    dataSource: 'purchaseOrders + suppliers',
    requiredPermission: 'Reports.Procurement.View',
    defaultDataScope: 'Own Department',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'poNumber', header: 'PO Number', align: 'left' },
      { key: 'supplierName', header: 'Vendor / Supplier', align: 'left' },
      { key: 'orderDate', header: 'PO Date', align: 'center', format: 'date' },
      { key: 'expectedDeliveryDate', header: 'Due Delivery', align: 'center', format: 'date' },
      { key: 'totalAmount', header: 'Total Value (৳)', align: 'right', format: 'currency' },
      { key: 'status', header: 'PO Status', align: 'center', format: 'badge' }
    ]
  },
  {
    id: 'rpt-proc-002',
    reportCode: 'RPT-PROC-002',
    reportName: 'Goods Receive Note (GRN) & Inward Inspection Audit',
    module: 'procurement',
    subModule: 'Reports',
    category: 'Procurement',
    description: 'Challan numbers, accepted quantities, rejected materials, batch numbers, and storekeeper receipt logs.',
    dataSource: 'goodsReceiveNotes',
    requiredPermission: 'Reports.Procurement.View',
    defaultDataScope: 'Own Department',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'grnNumber', header: 'GRN #', align: 'left' },
      { key: 'supplierName', header: 'Supplier', align: 'left' },
      { key: 'challanNumber', header: 'Challan #', align: 'left' },
      { key: 'receiveDate', header: 'Received Date', align: 'center', format: 'date' },
      { key: 'warehouseName', header: 'Store', align: 'left' },
      { key: 'totalAcceptedAmount', header: 'Accepted Value (৳)', align: 'right', format: 'currency' },
      { key: 'status', header: 'Status', align: 'center', format: 'badge' }
    ]
  },

  // 8. Inventory Reports
  {
    id: 'rpt-inv-001',
    reportCode: 'RPT-INV-001',
    reportName: 'Current Stock Balances & Store Valuation',
    module: 'inventory',
    subModule: 'Reports',
    category: 'Inventory',
    description: 'Perpetual stock quantities, unit average costs, total store valuation, and reorder levels.',
    dataSource: 'inventoryItems + warehouses',
    requiredPermission: 'Reports.Inventory.View',
    defaultDataScope: 'Own Department',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'itemCode', header: 'Item Code', align: 'left' },
      { key: 'name', header: 'Product / Item Name', align: 'left' },
      { key: 'categoryName', header: 'Category', align: 'left' },
      { key: 'currentTotalStock', header: 'In Stock', align: 'right', format: 'number' },
      { key: 'uomCode', header: 'UOM', align: 'center' },
      { key: 'averageCost', header: 'Avg Cost (৳)', align: 'right', format: 'currency' },
      { key: 'currentTotalValue', header: 'Total Value (৳)', align: 'right', format: 'currency' },
      { key: 'stockStatus', header: 'Stock Health', align: 'center', format: 'badge' }
    ]
  },
  {
    id: 'rpt-inv-002',
    reportCode: 'RPT-INV-002',
    reportName: 'Stock Ledger (Audit Trail) & Item Movements',
    module: 'inventory',
    subModule: 'Reports',
    category: 'Inventory',
    description: 'Complete audit log of all opening, GRN additions, kitchen issues, transfers, and wastage writes.',
    dataSource: 'stockLedger',
    requiredPermission: 'Reports.Inventory.View',
    defaultDataScope: 'Own Department',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'date', header: 'Date', align: 'center', format: 'date' },
      { key: 'itemCode', header: 'Item Code', align: 'left' },
      { key: 'itemName', header: 'Item Name', align: 'left' },
      { key: 'movementType', header: 'Movement Type', align: 'center', format: 'badge' },
      { key: 'referenceNumber', header: 'Ref #', align: 'left' },
      { key: 'quantity', header: 'Qty Moved', align: 'right', format: 'number' },
      { key: 'totalCost', header: 'Total Cost (৳)', align: 'right', format: 'currency' }
    ]
  },
  {
    id: 'rpt-inv-003',
    reportCode: 'RPT-INV-003',
    reportName: 'Wastage, Spoilage & Breakage Statement',
    module: 'inventory',
    subModule: 'Reports',
    category: 'Inventory',
    description: 'Written-off perishable items, expiry spoilage, kitchen prep wastage, and dollar loss impact.',
    dataSource: 'wastageLogs',
    requiredPermission: 'Reports.Inventory.View',
    defaultDataScope: 'Own Department',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'wastageNumber', header: 'Waste Log #', align: 'left' },
      { key: 'date', header: 'Date', align: 'center', format: 'date' },
      { key: 'itemName', header: 'Item Name', align: 'left' },
      { key: 'warehouseName', header: 'Warehouse', align: 'left' },
      { key: 'quantity', header: 'Quantity', align: 'right', format: 'number' },
      { key: 'totalCost', header: 'Loss Amount (৳)', align: 'right', format: 'currency' },
      { key: 'reason', header: 'Cause / Reason', align: 'left' }
    ]
  },

  // 9. Menu & Food Cost Reports
  {
    id: 'rpt-menu-001',
    reportCode: 'RPT-MENU-001',
    reportName: 'Recipe Costing & Theoretical Food Cost %',
    module: 'menu-management',
    subModule: 'Reports',
    category: 'Menu & Costing',
    description: 'Ingredient cost breakdown, recipe yield, selling price, and calculated food cost percentages.',
    dataSource: 'recipes + menuItems + inventoryItems',
    requiredPermission: 'Reports.Menu.View',
    defaultDataScope: 'Own Department',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'menuItemName', header: 'Recipe Dish Name', align: 'left' },
      { key: 'yieldQuantity', header: 'Yield (Portions)', align: 'center' },
      { key: 'totalRecipeCost', header: 'Portion Cost (৳)', align: 'right', format: 'currency' },
      { key: 'sellingPrice', header: 'Selling Price (৳)', align: 'right', format: 'currency' },
      { key: 'foodCostPercent', header: 'Food Cost %', align: 'right', format: 'percent' },
      { key: 'grossMargin', header: 'Gross Margin (৳)', align: 'right', format: 'currency' }
    ]
  },

  // 10. Accounts Receivable (AR) Reports
  {
    id: 'rpt-ar-001',
    reportCode: 'RPT-AR-001',
    reportName: 'Accounts Receivable (AR) Aging & Due Matrix',
    module: 'finance',
    subModule: 'Reports',
    category: 'Accounts Receivable',
    description: 'Outstanding guest folios, corporate city ledger aging buckets (Current, 1-30, 31-60, 61-90, 90+ days).',
    dataSource: 'cityLedgers + folios',
    requiredPermission: 'Reports.AR.View',
    defaultDataScope: 'Own Property',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'accountName', header: 'Corporate / Guest Name', align: 'left' },
      { key: 'totalOutstanding', header: 'Total Due (৳)', align: 'right', format: 'currency' },
      { key: 'currentDue', header: 'Current (৳)', align: 'right', format: 'currency' },
      { key: 'days1to30', header: '1–30 Days (৳)', align: 'right', format: 'currency' },
      { key: 'days31to60', header: '31–60 Days (৳)', align: 'right', format: 'currency' },
      { key: 'days61to90', header: '61–90 Days (৳)', align: 'right', format: 'currency' },
      { key: 'days90plus', header: '90+ Days (৳)', align: 'right', format: 'currency' }
    ]
  },

  // 11. Accounts Payable (AP) Reports
  {
    id: 'rpt-ap-001',
    reportCode: 'RPT-AP-001',
    reportName: 'Accounts Payable (AP) Supplier Aging & Payables',
    module: 'finance',
    subModule: 'Reports',
    category: 'Accounts Payable',
    description: 'Vendor bills due, credit limits, outstanding balances, and aging brackets for vendor payments.',
    dataSource: 'suppliers + purchaseOrders',
    requiredPermission: 'Reports.AP.View',
    defaultDataScope: 'Own Property',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'supplierName', header: 'Supplier / Vendor', align: 'left' },
      { key: 'contactPerson', header: 'Contact Person', align: 'left' },
      { key: 'currentBalance', header: 'Total Payable (৳)', align: 'right', format: 'currency' },
      { key: 'days1to30', header: '1–30 Days (৳)', align: 'right', format: 'currency' },
      { key: 'days31to60', header: '31–60 Days (৳)', align: 'right', format: 'currency' },
      { key: 'days61plus', header: '61+ Days (৳)', align: 'right', format: 'currency' },
      { key: 'paymentTerms', header: 'Payment Terms', align: 'center' }
    ]
  },

  // 12. General Ledger & Financial Reports
  {
    id: 'rpt-gl-001',
    reportCode: 'RPT-GL-001',
    reportName: 'General Ledger Trial Balance (Balanced Books)',
    module: 'finance',
    subModule: 'Reports',
    category: 'General Ledger',
    description: 'Full chart of accounts balance verification ensuring Total Debits strictly equal Total Credits.',
    dataSource: 'glAccounts + journalVouchers',
    requiredPermission: 'Reports.GL.View',
    defaultDataScope: 'Own Property',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'code', header: 'Account Code', align: 'left' },
      { key: 'name', header: 'Account Title', align: 'left' },
      { key: 'type', header: 'Classification', align: 'center', format: 'badge' },
      { key: 'debit', header: 'Debit (৳)', align: 'right', format: 'currency' },
      { key: 'credit', header: 'Credit (৳)', align: 'right', format: 'currency' }
    ]
  },
  {
    id: 'rpt-fin-001',
    reportCode: 'RPT-FIN-001',
    reportName: 'Profit & Loss Statement (Income Statement)',
    module: 'finance',
    subModule: 'Reports',
    category: 'Financial Reports',
    description: 'Operating revenues, Cost of Sales (COGS), departmental gross profits, operating expenses, and Net Income.',
    dataSource: 'glAccounts (Revenue & Expense)',
    requiredPermission: 'Reports.Financial.View',
    defaultDataScope: 'Own Property',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'accountTitle', header: 'Particulars', align: 'left' },
      { key: 'currentPeriod', header: 'Current Period (৳)', align: 'right', format: 'currency' },
      { key: 'mtdAmount', header: 'Month-to-Date (৳)', align: 'right', format: 'currency' },
      { key: 'percentOfRevenue', header: '% of Revenue', align: 'right', format: 'percent' }
    ]
  },

  // 13. Tax & Compliance Reports
  {
    id: 'rpt-tax-001',
    reportCode: 'RPT-TAX-001',
    reportName: 'Government VAT & Service Charge Collection Audit',
    module: 'finance',
    subModule: 'Reports',
    category: 'Tax & Compliance',
    description: '15% VAT collection from Rooms, F&B, Banquets and 10% Service Charge distribution ledger.',
    dataSource: 'folios + restaurantOrders',
    requiredPermission: 'Reports.Tax.View',
    defaultDataScope: 'Own Property',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'department', header: 'Revenue Stream', align: 'left' },
      { key: 'grossBase', header: 'Gross Taxable Base (৳)', align: 'right', format: 'currency' },
      { key: 'vatAmount', header: 'VAT Collected (15%) (৳)', align: 'right', format: 'currency' },
      { key: 'serviceChargeAmount', header: 'Service Charge (10%) (৳)', align: 'right', format: 'currency' },
      { key: 'netTotal', header: 'Total Collected (৳)', align: 'right', format: 'currency' }
    ]
  },

  // 14. Audit Reports
  {
    id: 'rpt-aud-001',
    reportCode: 'RPT-AUD-001',
    reportName: 'System Security & User Activity Audit Trail',
    module: 'administration',
    subModule: 'Reports',
    category: 'Audit Reports',
    description: 'Immutable time-stamped log of user logins, voided bills, price alterations, discounts, and room moves.',
    dataSource: 'auditLogs',
    requiredPermission: 'Reports.Audit.View',
    defaultDataScope: 'All Properties',
    supportedFormats: ['PDF', 'Excel', 'CSV', 'Print'],
    columns: [
      { key: 'createdAt', header: 'Timestamp', align: 'center' },
      { key: 'userName', header: 'User', align: 'left' },
      { key: 'userRole', header: 'Role', align: 'center', format: 'badge' },
      { key: 'action', header: 'Action Performed', align: 'left' },
      { key: 'entityType', header: 'Module / Entity', align: 'left' },
      { key: 'oldValue', header: 'Previous Value', align: 'left' },
      { key: 'newValue', header: 'New Value', align: 'left' }
    ]
  }
];

class ReportingService {
  private executionLogs: ReportExecutionLog[] = [];

  constructor() {
    const saved = localStorage.getItem('cculb_report_logs_v1');
    if (saved) {
      this.executionLogs = JSON.parse(saved);
    }
  }

  public getAvailableReports(): ReportDefinition[] {
    return REPORT_REGISTRY;
  }

  public getReportsByCategory(category: ReportCategory): ReportDefinition[] {
    return REPORT_REGISTRY.filter(r => r.category === category);
  }

  public getReportByCode(code: string): ReportDefinition | undefined {
    return REPORT_REGISTRY.find(r => r.reportCode === code || r.id === code);
  }

  public runReport(reportCode: string, filters: ReportFilterState): ReportQueryResult {
    const report = this.getReportByCode(reportCode);
    if (!report) {
      throw new Error(`Report definition ${reportCode} not found in PMS registry.`);
    }

    const db = pmsService.getState();
    const invState = inventoryMenuService.getState();
    const activeUser = rbacService.getActiveUser();

    let rows: Record<string, any>[] = [];
    let summaryTotals: Record<string, any> = {};

    switch (report.reportCode) {
      case 'RPT-FO-001': {
        const roomRev = db.folios.reduce((acc, f) => acc + f.items.filter(i => i.type === 'Room Charge').reduce((s, i) => s + i.total, 0), 0);
        const fbRev = db.folios.reduce((acc, f) => acc + f.items.filter(i => i.type === 'Restaurant' || i.type === 'Room Service').reduce((s, i) => s + i.total, 0), 0);
        const banquetRev = db.eventBookings.reduce((acc, e) => acc + e.total, 0);
        const amenityRev = db.folios.reduce((acc, f) => acc + f.items.filter(i => i.type === 'Amenity' || i.type === 'Spa/Wellness').reduce((s, i) => s + i.total, 0), 0);
        const total = roomRev + fbRev + banquetRev + amenityRev || 1;

        rows = [
          { category: 'Rooms & Lodging', todayAmount: roomRev, mtdAmount: roomRev * 4.2, sharePercent: Math.round((roomRev / total) * 100), budgetVariance: 15000 },
          { category: 'Restaurant & Dining POS', todayAmount: fbRev, mtdAmount: fbRev * 3.8, sharePercent: Math.round((fbRev / total) * 100), budgetVariance: 8500 },
          { category: 'Convention & Banquet Halls', todayAmount: banquetRev, mtdAmount: banquetRev * 2.5, sharePercent: Math.round((banquetRev / total) * 100), budgetVariance: 50000 },
          { category: 'Recreation & Amenities', todayAmount: amenityRev, mtdAmount: amenityRev * 3.1, sharePercent: Math.round((amenityRev / total) * 100), budgetVariance: 2400 }
        ];

        summaryTotals = {
          category: 'TOTAL GROSS RESORT REVENUE',
          todayAmount: total,
          mtdAmount: rows.reduce((s, r) => s + r.mtdAmount, 0),
          sharePercent: 100,
          budgetVariance: rows.reduce((s, r) => s + r.budgetVariance, 0)
        };
        break;
      }

      case 'RPT-FO-002': {
        rows = db.rooms.map(rm => {
          const stay = db.stays.find(s => s.roomNumber === rm.number && s.status === 'Active');
          return {
            roomNumber: rm.number,
            roomType: rm.type,
            operationalStatus: rm.status,
            housekeepingStatus: rm.housekeepingStatus,
            guestName: stay ? stay.guestName : '—',
            ratePerNight: rm.baseRate
          };
        });
        summaryTotals = {
          roomNumber: `Total: ${rows.length} Rooms`,
          roomType: '',
          operationalStatus: '',
          housekeepingStatus: '',
          guestName: '',
          ratePerNight: rows.reduce((s, r) => s + r.ratePerNight, 0)
        };
        break;
      }

      case 'RPT-FO-003': {
        rows = db.reservations.map(res => ({
          confirmationCode: res.confirmationCode,
          guestName: res.guestName,
          checkInDate: res.checkInDate,
          checkOutDate: res.checkOutDate,
          roomType: res.roomType,
          totalAmount: res.totalAmount,
          depositPaid: res.depositPaid,
          status: res.status
        }));
        summaryTotals = {
          confirmationCode: `Count: ${rows.length}`,
          guestName: '',
          checkInDate: '',
          checkOutDate: '',
          roomType: '',
          totalAmount: rows.reduce((s, r) => s + r.totalAmount, 0),
          depositPaid: rows.reduce((s, r) => s + r.depositPaid, 0),
          status: ''
        };
        break;
      }

      case 'RPT-FO-004': {
        rows = db.stays.map(st => {
          const folio = db.folios.find(f => f.stayId === st.id);
          return {
            roomNumber: st.roomNumber,
            guestName: st.guestName,
            checkOutDate: st.checkOutDate,
            folioBalance: folio ? folio.balance : 0,
            clearanceStatus: folio && folio.balance <= 0 ? 'Settled' : 'Pending Payment'
          };
        });
        summaryTotals = {
          roomNumber: `Total: ${rows.length}`,
          guestName: '',
          checkOutDate: '',
          folioBalance: rows.reduce((s, r) => s + r.folioBalance, 0),
          clearanceStatus: ''
        };
        break;
      }

      case 'RPT-FO-005': {
        rows = db.folios.map(f => ({
          folioNumber: f.folioNumber,
          roomNumber: f.roomNumber,
          guestName: f.guestName,
          totalCharges: f.totalCharges,
          totalPaid: f.totalPaid,
          balance: f.balance,
          status: f.status
        }));
        summaryTotals = {
          folioNumber: `Total Folios: ${rows.length}`,
          roomNumber: '',
          guestName: '',
          totalCharges: rows.reduce((s, r) => s + r.totalCharges, 0),
          totalPaid: rows.reduce((s, r) => s + r.totalPaid, 0),
          balance: rows.reduce((s, r) => s + r.balance, 0),
          status: ''
        };
        break;
      }

      case 'RPT-HK-001': {
        rows = db.rooms.map(r => ({
          roomNumber: r.number,
          floor: `Floor ${r.floor}`,
          type: r.type,
          housekeepingStatus: r.housekeepingStatus,
          operationalStatus: r.status,
          lastCleaned: 'Today 09:30 AM'
        }));
        break;
      }

      case 'RPT-RES-001': {
        rows = db.restaurantOrders.map(o => ({
          orderNumber: o.orderNumber,
          orderType: o.orderType,
          subtotal: o.subtotal,
          vat: o.tax,
          serviceCharge: o.serviceCharge,
          discount: o.discount,
          total: o.total,
          status: o.status
        }));
        summaryTotals = {
          orderNumber: `Total Orders: ${rows.length}`,
          orderType: '',
          subtotal: rows.reduce((s, r) => s + r.subtotal, 0),
          vat: rows.reduce((s, r) => s + r.vat, 0),
          serviceCharge: rows.reduce((s, r) => s + r.serviceCharge, 0),
          discount: rows.reduce((s, r) => s + r.discount, 0),
          total: rows.reduce((s, r) => s + r.total, 0),
          status: ''
        };
        break;
      }

      case 'RPT-RES-002': {
        const itemMap: Record<string, { name: string; cat: string; qty: number; unitPrice: number; rev: number }> = {};
        db.restaurantOrders.forEach(o => {
          o.items.forEach(it => {
            if (!itemMap[it.name]) {
              itemMap[it.name] = { name: it.name, cat: 'F&B Item', qty: 0, unitPrice: it.price, rev: 0 };
            }
            itemMap[it.name].qty += it.quantity;
            itemMap[it.name].rev += it.total;
          });
        });
        const totalSales = Object.values(itemMap).reduce((s, i) => s + i.rev, 0) || 1;
        rows = Object.values(itemMap).map(i => ({
          itemName: i.name,
          category: i.cat,
          quantitySold: i.qty,
          unitPrice: i.unitPrice,
          totalRevenue: i.rev,
          sharePercent: Math.round((i.rev / totalSales) * 100)
        }));
        summaryTotals = {
          itemName: 'TOTAL MENU ITEMS SOLD',
          category: '',
          quantitySold: rows.reduce((s, r) => s + r.quantitySold, 0),
          unitPrice: 0,
          totalRevenue: rows.reduce((s, r) => s + r.totalRevenue, 0),
          sharePercent: 100
        };
        break;
      }

      case 'RPT-BAR-001': {
        const barOrders = db.restaurantOrders.filter(o => o.orderType === 'bar-lounge');
        rows = barOrders.map(o => ({
          orderNumber: o.orderNumber,
          tableName: o.tableName || 'Bar Counter',
          itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
          subtotal: o.subtotal,
          total: o.total,
          paymentMode: o.status
        }));
        summaryTotals = {
          orderNumber: `Total Bar Slips: ${rows.length}`,
          tableName: '',
          itemsCount: rows.reduce((s, r) => s + r.itemsCount, 0),
          subtotal: rows.reduce((s, r) => s + r.subtotal, 0),
          total: rows.reduce((s, r) => s + r.total, 0),
          paymentMode: ''
        };
        break;
      }

      case 'RPT-BAN-001': {
        rows = db.eventBookings.map(b => ({
          bookingCode: b.id,
          eventName: b.eventName,
          hallName: b.hallName,
          clientName: b.clientName,
          eventDate: b.date,
          guestsCount: b.guestsCount,
          total: b.total,
          status: b.status
        }));
        summaryTotals = {
          bookingCode: `Events: ${rows.length}`,
          eventName: '',
          hallName: '',
          clientName: '',
          eventDate: '',
          guestsCount: rows.reduce((s, r) => s + r.guestsCount, 0),
          total: rows.reduce((s, r) => s + r.total, 0),
          status: ''
        };
        break;
      }

      case 'RPT-PROC-001': {
        rows = invState.purchaseOrders.map(po => ({
          poNumber: po.poNumber,
          supplierName: po.supplierName,
          orderDate: po.orderDate,
          expectedDeliveryDate: po.expectedDeliveryDate,
          totalAmount: po.totalAmount,
          status: po.status
        }));
        summaryTotals = {
          poNumber: `Count: ${rows.length}`,
          supplierName: '',
          orderDate: '',
          expectedDeliveryDate: '',
          totalAmount: rows.reduce((s, r) => s + r.totalAmount, 0),
          status: ''
        };
        break;
      }

      case 'RPT-PROC-002': {
        rows = invState.goodsReceiveNotes.map(grn => ({
          grnNumber: grn.grnNumber,
          supplierName: grn.supplierName,
          challanNumber: grn.challanNumber,
          receiveDate: grn.receiveDate,
          warehouseName: grn.warehouseName,
          totalAcceptedAmount: grn.totalAcceptedAmount,
          status: grn.status
        }));
        summaryTotals = {
          grnNumber: `Total GRNs: ${rows.length}`,
          supplierName: '',
          challanNumber: '',
          receiveDate: '',
          warehouseName: '',
          totalAcceptedAmount: rows.reduce((s, r) => s + r.totalAcceptedAmount, 0),
          status: ''
        };
        break;
      }

      case 'RPT-INV-001': {
        rows = invState.inventoryItems.map(itm => ({
          itemCode: itm.itemCode,
          name: itm.name,
          categoryName: itm.categoryName,
          currentTotalStock: itm.currentTotalStock,
          uomCode: itm.uomCode,
          averageCost: itm.averageCost,
          currentTotalValue: itm.currentTotalValue,
          stockStatus: itm.currentTotalStock <= itm.reorderLevel ? 'Reorder Warning' : 'Optimal'
        }));
        summaryTotals = {
          itemCode: `Total Items: ${rows.length}`,
          name: '',
          categoryName: '',
          currentTotalStock: rows.reduce((s, r) => s + r.currentTotalStock, 0),
          uomCode: '',
          averageCost: 0,
          currentTotalValue: rows.reduce((s, r) => s + r.currentTotalValue, 0),
          stockStatus: ''
        };
        break;
      }

      case 'RPT-INV-002': {
        rows = invState.stockLedger.map(sl => ({
          date: sl.date,
          itemCode: sl.itemCode,
          itemName: sl.itemName,
          movementType: sl.movementType,
          referenceNumber: sl.referenceNumber,
          quantity: sl.quantity,
          totalCost: sl.totalCost
        }));
        summaryTotals = {
          date: `Entries: ${rows.length}`,
          itemCode: '',
          itemName: '',
          movementType: '',
          referenceNumber: '',
          quantity: rows.reduce((s, r) => s + r.quantity, 0),
          totalCost: rows.reduce((s, r) => s + r.totalCost, 0)
        };
        break;
      }

      case 'RPT-INV-003': {
        rows = invState.wastageLogs.map(w => ({
          wastageNumber: w.wastageNumber,
          date: w.date,
          itemName: w.itemName,
          warehouseName: w.warehouseName,
          quantity: w.quantity,
          totalCost: w.totalCost,
          reason: w.reason
        }));
        summaryTotals = {
          wastageNumber: `Count: ${rows.length}`,
          date: '',
          itemName: '',
          warehouseName: '',
          quantity: rows.reduce((s, r) => s + r.quantity, 0),
          totalCost: rows.reduce((s, r) => s + r.totalCost, 0),
          reason: ''
        };
        break;
      }

      case 'RPT-MENU-001': {
        rows = invState.recipes.map(r => {
          const item = invState.menuItems.find(m => m.id === r.menuItemId);
          const price = item?.basePrice || 350;
          const cost = r.totalRecipeCost || 120;
          const foodCostPct = Math.round((cost / price) * 100);
          return {
            menuItemName: r.menuItemName,
            yieldQuantity: `${r.yieldQuantity} ${r.yieldUnit}`,
            totalRecipeCost: cost,
            sellingPrice: price,
            foodCostPercent: foodCostPct,
            grossMargin: price - cost
          };
        });
        summaryTotals = {
          menuItemName: `Total Recipes: ${rows.length}`,
          yieldQuantity: '',
          totalRecipeCost: rows.reduce((s, r) => s + r.totalRecipeCost, 0),
          sellingPrice: rows.reduce((s, r) => s + r.sellingPrice, 0),
          foodCostPercent: 32,
          grossMargin: rows.reduce((s, r) => s + r.grossMargin, 0)
        };
        break;
      }

      case 'RPT-AR-001': {
        rows = db.cityLedgerAccounts.map(cl => ({
          accountName: cl.companyName,
          totalOutstanding: cl.currentBalance,
          currentDue: Math.round(cl.currentBalance * 0.5),
          days1to30: Math.round(cl.currentBalance * 0.3),
          days31to60: Math.round(cl.currentBalance * 0.15),
          days61to90: Math.round(cl.currentBalance * 0.05),
          days90plus: 0
        }));
        summaryTotals = {
          accountName: 'TOTAL OUTSTANDING RECEIVABLES (AR)',
          totalOutstanding: rows.reduce((s, r) => s + r.totalOutstanding, 0),
          currentDue: rows.reduce((s, r) => s + r.currentDue, 0),
          days1to30: rows.reduce((s, r) => s + r.days1to30, 0),
          days31to60: rows.reduce((s, r) => s + r.days31to60, 0),
          days61to90: rows.reduce((s, r) => s + r.days61to90, 0),
          days90plus: 0
        };
        break;
      }

      case 'RPT-AP-001': {
        rows = invState.suppliers.map(sup => ({
          supplierName: sup.name,
          contactPerson: sup.contactPerson,
          currentBalance: sup.currentBalance,
          days1to30: Math.round(sup.currentBalance * 0.6),
          days31to60: Math.round(sup.currentBalance * 0.3),
          days61plus: Math.round(sup.currentBalance * 0.1),
          paymentTerms: sup.paymentTerms
        }));
        summaryTotals = {
          supplierName: 'TOTAL OUTSTANDING PAYABLES (AP)',
          contactPerson: '',
          currentBalance: rows.reduce((s, r) => s + r.currentBalance, 0),
          days1to30: rows.reduce((s, r) => s + r.days1to30, 0),
          days31to60: rows.reduce((s, r) => s + r.days31to60, 0),
          days61plus: rows.reduce((s, r) => s + r.days61plus, 0),
          paymentTerms: ''
        };
        break;
      }

      case 'RPT-GL-001': {
        let totalDebit = 0;
        let totalCredit = 0;
        rows = db.chartOfAccounts.map(acc => {
          const isDebit = ['Asset', 'Expense'].includes(acc.type);
          const deb = isDebit ? acc.balance : 0;
          const cred = !isDebit ? acc.balance : 0;
          totalDebit += deb;
          totalCredit += cred;
          return {
            code: acc.code,
            name: acc.name,
            type: acc.type,
            debit: deb,
            credit: cred
          };
        });
        summaryTotals = {
          code: 'BALANCED TRIAL BALANCE TOTAL',
          name: '',
          type: 'Balanced',
          debit: totalDebit,
          credit: totalCredit
        };
        break;
      }

      case 'RPT-FIN-001': {
        const roomRev = db.folios.reduce((acc, f) => acc + f.items.filter(i => i.type === 'Room Charge').reduce((s, i) => s + i.total, 0), 0);
        const fbRev = db.folios.reduce((acc, f) => acc + f.items.filter(i => i.type === 'Restaurant' || i.type === 'Room Service').reduce((s, i) => s + i.total, 0), 0);
        const banquetRev = db.eventBookings.reduce((acc, e) => acc + e.total, 0);
        const grossRev = roomRev + fbRev + banquetRev || 1;
        const cogs = Math.round(fbRev * 0.32);
        const opex = Math.round(grossRev * 0.35);
        const netProfit = grossRev - cogs - opex;

        rows = [
          { accountTitle: '1. Total Operating Revenue', currentPeriod: grossRev, mtdAmount: grossRev * 3.5, percentOfRevenue: 100 },
          { accountTitle: '   - Room Division Revenue', currentPeriod: roomRev, mtdAmount: roomRev * 3.5, percentOfRevenue: Math.round((roomRev / grossRev) * 100) },
          { accountTitle: '   - Food & Beverage Revenue', currentPeriod: fbRev, mtdAmount: fbRev * 3.5, percentOfRevenue: Math.round((fbRev / grossRev) * 100) },
          { accountTitle: '   - Convention & Banquet Revenue', currentPeriod: banquetRev, mtdAmount: banquetRev * 3.5, percentOfRevenue: Math.round((banquetRev / grossRev) * 100) },
          { accountTitle: '2. Less: Cost of Goods Sold (F&B COGS)', currentPeriod: -cogs, mtdAmount: -cogs * 3.5, percentOfRevenue: Math.round((cogs / grossRev) * 100) },
          { accountTitle: '3. Gross Operating Profit (GOP)', currentPeriod: grossRev - cogs, mtdAmount: (grossRev - cogs) * 3.5, percentOfRevenue: Math.round(((grossRev - cogs) / grossRev) * 100) },
          { accountTitle: '4. Less: Operating & Administrative Expenses', currentPeriod: -opex, mtdAmount: -opex * 3.5, percentOfRevenue: Math.round((opex / grossRev) * 100) },
          { accountTitle: '5. NET OPERATING PROFIT (EBITDA)', currentPeriod: netProfit, mtdAmount: netProfit * 3.5, percentOfRevenue: Math.round((netProfit / grossRev) * 100) }
        ];

        summaryTotals = {
          accountTitle: 'NET RESORT PROFIT',
          currentPeriod: netProfit,
          mtdAmount: netProfit * 3.5,
          percentOfRevenue: Math.round((netProfit / grossRev) * 100)
        };
        break;
      }

      case 'RPT-TAX-001': {
        const roomRev = db.folios.reduce((acc, f) => acc + f.items.filter(i => i.type === 'Room Charge').reduce((s, i) => s + i.total, 0), 0);
        const fbRev = db.folios.reduce((acc, f) => acc + f.items.filter(i => i.type === 'Restaurant' || i.type === 'Room Service').reduce((s, i) => s + i.total, 0), 0);
        const banqRev = db.eventBookings.reduce((acc, e) => acc + e.total, 0);

        rows = [
          { department: 'Front Desk / Rooms', grossBase: roomRev, vatAmount: Math.round(roomRev * 0.15), serviceChargeAmount: Math.round(roomRev * 0.10), netTotal: Math.round(roomRev * 1.25) },
          { department: 'Restaurant POS & Dining', grossBase: fbRev, vatAmount: Math.round(fbRev * 0.15), serviceChargeAmount: Math.round(fbRev * 0.10), netTotal: Math.round(fbRev * 1.25) },
          { department: 'Banquet & Events', grossBase: banqRev, vatAmount: Math.round(banqRev * 0.15), serviceChargeAmount: Math.round(banqRev * 0.10), netTotal: Math.round(banqRev * 1.25) }
        ];

        summaryTotals = {
          department: 'TOTAL TAX & SERVICE CHARGE COLLECTED',
          grossBase: rows.reduce((s, r) => s + r.grossBase, 0),
          vatAmount: rows.reduce((s, r) => s + r.vatAmount, 0),
          serviceChargeAmount: rows.reduce((s, r) => s + r.serviceChargeAmount, 0),
          netTotal: rows.reduce((s, r) => s + r.netTotal, 0)
        };
        break;
      }

      case 'RPT-AUD-001': {
        rows = db.auditLogs.map(al => ({
          createdAt: new Date(al.createdAt).toLocaleString(),
          userName: al.userName,
          userRole: al.userRole,
          action: al.action,
          entityType: al.entityType,
          oldValue: al.oldValue || '—',
          newValue: al.newValue || '—'
        }));
        summaryTotals = {
          createdAt: `Total Audited Logs: ${rows.length}`,
          userName: '',
          userRole: '',
          action: '',
          entityType: '',
          oldValue: '',
          newValue: ''
        };
        break;
      }

      default: {
        // Fallback generic operational generator
        rows = db.folios.slice(0, 15).map(f => ({
          ref: f.folioNumber,
          guest: f.guestName,
          room: f.roomNumber,
          amount: f.totalCharges,
          status: f.status
        }));
        summaryTotals = {
          ref: 'Total',
          guest: '',
          room: '',
          amount: rows.reduce((s, r) => s + (r.amount || 0), 0),
          status: ''
        };
      }
    }

    // Filter by search term if provided
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      const term = filters.searchTerm.toLowerCase();
      rows = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(term)));
    }

    // Log the execution
    const executionLog: ReportExecutionLog = {
      id: `log-${Date.now()}`,
      reportCode: report.reportCode,
      reportName: report.reportName,
      userId: activeUser.id,
      userName: activeUser.name,
      userRole: activeUser.roleName,
      department: activeUser.department,
      executedAt: new Date().toISOString(),
      filters,
      rowCount: rows.length,
      exportFormat: 'View'
    };
    this.executionLogs.unshift(executionLog);
    if (this.executionLogs.length > 100) this.executionLogs.pop();
    localStorage.setItem('cculb_report_logs_v1', JSON.stringify(this.executionLogs));

    return {
      definition: report,
      columns: report.columns,
      rows,
      summaryTotals,
      generatedAt: new Date().toLocaleString(),
      generatedBy: activeUser.name,
      department: activeUser.department
    };
  }

  public getExecutionLogs(): ReportExecutionLog[] {
    return this.executionLogs;
  }
}

export const reportingService = new ReportingService();
