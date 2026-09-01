// CCULB PMS - Inventory & Menu Management Data Types

export type InventoryItemType = 
  | 'Raw Material'
  | 'Food Ingredient'
  | 'Beverage'
  | 'Bar Item'
  | 'Packaging'
  | 'Housekeeping Supply'
  | 'Engineering Material'
  | 'Office Supply'
  | 'Amenity'
  | 'Fixed Asset'
  | 'Consumable'
  | 'Other';

export type StockTransactionType =
  | 'Opening Balance'
  | 'Purchase Receive'
  | 'Purchase Return'
  | 'Store Transfer In'
  | 'Store Transfer Out'
  | 'Kitchen Issue'
  | 'Bar Issue'
  | 'Recipe Consumption'
  | 'Wastage'
  | 'Adjustment Increase'
  | 'Adjustment Decrease'
  | 'Physical Count Adjustment';

export type WastageReason =
  | 'Expired'
  | 'Spoiled'
  | 'Damaged'
  | 'Kitchen Waste'
  | 'Overproduction'
  | 'Breakage'
  | 'Spillage'
  | 'Other';

export type TransferStatus =
  | 'Draft'
  | 'Requested'
  | 'Approved'
  | 'In Transit'
  | 'Received'
  | 'Cancelled';

export type PurchaseRequestStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'PO Generated'
  | 'Partially Received'
  | 'Completed'
  | 'Cancelled';

export type PurchaseOrderStatus =
  | 'Draft'
  | 'Sent to Supplier'
  | 'Partially Received'
  | 'Fully Received'
  | 'Billed'
  | 'Cancelled';

export type MenuType =
  | 'Food'
  | 'Beverage'
  | 'Dessert'
  | 'Bar'
  | 'Combo'
  | 'Package'
  | 'Special';

export type OutletType =
  | 'Restaurant'
  | 'Bar'
  | 'Pool'
  | 'Room Service'
  | 'Banquet'
  | 'Event'
  | 'Other';

export type MenuAvailabilityStatus =
  | 'Available'
  | 'Unavailable'
  | 'Temporarily Unavailable'
  | 'Out of Stock'
  | 'Seasonal'
  | 'Archived';

// ==========================================
// 1. INVENTORY MASTER MODELS
// ==========================================

export interface UnitOfMeasure {
  id: string;
  code: string; // e.g. "kg", "g", "ltr", "ml", "pcs", "carton"
  name: string; // e.g. "Kilogram", "Gram", "Liter", "Piece"
  baseUnitId?: string;
  conversionMultiplier: number; // e.g., 1 kg = 1000 g (multiplier: 1000 from kg to g, or 1 carton = 24 pcs)
  category: 'Weight' | 'Volume' | 'Count' | 'Portion';
  active: boolean;
}

export interface InventoryCategory {
  id: string;
  code: string;
  name: string; // e.g., "FOOD", "BEVERAGE", "BAR", "HOUSEKEEPING"
  department: 'F&B Kitchen' | 'Bar & Lounge' | 'Housekeeping' | 'Engineering' | 'Front Office' | 'Admin & General';
  subcategories: string[]; // e.g. ["Meat", "Fish", "Chicken", "Vegetables", "Spices", "Dairy"]
  active: boolean;
}

export interface WarehouseStore {
  id: string;
  code: string;
  name: string; // e.g. "Main Store", "Kitchen Store", "Bar Store", "Cold Storage", "Frozen Store"
  location: string;
  storeKeeper: string;
  isKitchenStore?: boolean;
  isBarStore?: boolean;
  phone?: string;
  active: boolean;
}

export interface Supplier {
  id: string;
  code: string;
  name: string; // e.g. "Bengal Agro Ltd.", "Dhaka Beverage Supply"
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  tradeLicense?: string;
  tin?: string;
  paymentTerms: 'Immediate' | 'Net 7' | 'Net 15' | 'Net 30' | 'Net 45';
  bankDetails?: string;
  categoriesSupplied: string[];
  currentPayableBalance: number;
  rating?: number;
  active: boolean;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  itemType: InventoryItemType;
  categoryId: string;
  categoryName: string;
  subcategory: string;
  brand?: string;
  description?: string;
  uomId: string;
  uomCode: string;
  purchaseUomId: string;
  purchaseUomCode: string;
  consumptionUomId: string;
  consumptionUomCode: string;
  conversionFactor: number; // 1 Purchase UOM = X Consumption UOM (e.g. 1 Carton = 24 Bottles)
  storageLocation?: string;
  defaultWarehouseId: string;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  openingStock: number;
  openingCost: number;
  averageCost: number; // Moving average cost in BDT (৳)
  lastPurchaseCost: number;
  preferredSupplierId?: string;
  preferredSupplierName?: string;
  taxPercent: number;
  active: boolean;
  trackBatch: boolean;
  trackExpiry: boolean;
  currentTotalStock: number; // Aggregate across stores
  currentTotalValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStockByWarehouse {
  id: string;
  itemId: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  averageCost: number;
  stockValue: number;
  lastUpdated: string;
}

export interface ItemBatchRecord {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  warehouseId: string;
  batchNumber: string;
  manufacturingDate?: string;
  expiryDate: string; // YYYY-MM-DD
  receivedDate: string;
  quantity: number;
  remainingQuantity: number;
  unitCost: number;
  supplierName?: string;
  grnNumber?: string;
  status: 'Fresh' | 'Expiring Soon' | 'Expired';
}

export interface StockLedgerEntry {
  id: string;
  date: string;
  transactionNumber: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  warehouseId: string;
  warehouseName: string;
  transactionType: StockTransactionType;
  referenceType: 'PO' | 'GRN' | 'PurchaseReturn' | 'Transfer' | 'KitchenIssue' | 'BarIssue' | 'POSOrder' | 'Wastage' | 'Adjustment' | 'CountAudit';
  referenceId: string;
  referenceDocument: string; // e.g. "POS-2026-0104", "GRN-2026-0012"
  quantityIn: number;
  quantityOut: number;
  unitCost: number;
  totalCost: number;
  runningQuantity: number;
  runningValue: number;
  businessDate: string;
  department?: string;
  user: string;
  notes?: string;
  createdAt: string;
}

// ==========================================
// 2. PROCUREMENT & WAREHOUSE TRANSACTIONS
// ==========================================

export interface PurchaseRequestItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  requestedQuantity: number;
  approvedQuantity?: number;
  uom: string;
  estimatedUnitCost: number;
  estimatedTotal: number;
  currentStock: number;
  notes?: string;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string; // REQ-2026-001
  department: string;
  warehouseId: string;
  warehouseName: string;
  requestDate: string;
  requiredDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  items: PurchaseRequestItem[];
  totalEstimatedAmount: number;
  status: PurchaseRequestStatus;
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  remarks?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  receivedQuantity: number;
  pendingQuantity: number;
  uom: string;
  unitPrice: number;
  taxPercent: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // PO-2026-001
  requisitionId?: string;
  requisitionNumber?: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  paymentTerms: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  status: PurchaseOrderStatus;
  receivedTotalValue: number;
  preparedBy: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface GoodsReceiveNoteItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  poQuantity?: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  uom: string;
  unitPrice: number;
  totalPrice: number;
  batchNumber?: string;
  expiryDate?: string;
  rejectionReason?: string;
}

export interface GoodsReceiveNote {
  id: string;
  grnNumber: string; // GRN-2026-001
  poId?: string;
  poNumber?: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  receiveDate: string;
  challanNumber: string; // Delivery note / Invoice no from supplier
  challanDate: string;
  items: GoodsReceiveNoteItem[];
  totalAcceptedAmount: number;
  inspectionPassed: boolean;
  inspectedBy: string;
  receivedBy: string;
  status: 'Draft' | 'Approved & Added to Stock' | 'Cancelled';
  journalVoucherNumber?: string;
  createdAt: string;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string; // PRN-2026-001
  grnId?: string;
  grnNumber?: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  returnDate: string;
  items: {
    itemId: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    uom: string;
    unitPrice: number;
    totalAmount: number;
    reason: string;
  }[];
  totalAmount: number;
  reason: string;
  returnedBy: string;
  approvedBy: string;
  status: 'Pending' | 'Completed';
  createdAt: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string; // TRF-2026-001
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  transferDate: string;
  items: {
    itemId: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    uom: string;
    unitCost: number;
    totalCost: number;
  }[];
  totalCost: number;
  status: TransferStatus;
  requestedBy: string;
  approvedBy?: string;
  receivedBy?: string;
  remarks?: string;
  createdAt: string;
}

export interface StoreIssueConsumption {
  id: string;
  issueNumber: string; // ISS-2026-001
  warehouseId: string;
  warehouseName: string;
  department: 'Kitchen' | 'Bar' | 'Housekeeping' | 'Maintenance' | 'Banquet & Catering' | 'General';
  recipientName: string;
  issueDate: string;
  purpose: string;
  items: {
    itemId: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    uom: string;
    unitCost: number;
    totalCost: number;
  }[];
  totalCost: number;
  issuedBy: string;
  approvedBy: string;
  createdAt: string;
}

export interface WastageEntry {
  id: string;
  wastageNumber: string; // WST-2026-001
  date: string;
  department: 'Kitchen' | 'Bar' | 'Main Store' | 'Housekeeping' | 'Banquet';
  warehouseId: string;
  warehouseName: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  unitCost: number;
  totalCost: number;
  reason: WastageReason;
  remarks?: string;
  reportedBy: string;
  approvedBy: string;
  status: 'Logged' | 'Approved & Written Off';
  journalVoucherNumber?: string;
  createdAt: string;
}

export interface PhysicalStockCountItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  uom: string;
  systemQuantity: number;
  countedQuantity: number;
  varianceQuantity: number;
  unitCost: number;
  varianceValue: number;
  notes?: string;
}

export interface PhysicalStockCount {
  id: string;
  countNumber: string; // PSC-2026-001
  warehouseId: string;
  warehouseName: string;
  countDate: string;
  items: PhysicalStockCountItem[];
  totalSystemValue: number;
  totalCountedValue: number;
  netVarianceValue: number;
  countedBy: string;
  verifiedBy: string;
  approvedBy?: string;
  status: 'In Progress' | 'Reconciled & Adjusted' | 'Rejected';
  adjustmentJournalVoucher?: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string; // ADJ-2026-001
  date: string;
  warehouseId: string;
  warehouseName: string;
  adjustmentType: 'Increase' | 'Decrease';
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  unitCost: number;
  totalValue: number;
  reason: string;
  adjustedBy: string;
  approvedBy: string;
  createdAt: string;
}

// ==========================================
// 3. MENU, RECIPE & PRICING MODELS
// ==========================================

export interface MenuSubCategory {
  id: string;
  categoryId: string;
  name: string;
  displayOrder: number;
}

export interface ServiceChargeRule {
  id: string;
  name: string; // e.g. "Standard Restaurant SC (10%)"
  ratePercent: number;
  fixedAmount?: number;
  applicableOutlets: OutletType[];
  applicableCategories?: string[];
  effectiveDate: string;
  active: boolean;
}

export interface TaxRule {
  id: string;
  name: string; // e.g. "NBR VAT 15%"
  taxRatePercent: number;
  isInclusive: boolean; // false = add on top of base price
  glAccountCode: string;
  effectiveDate: string;
  active: boolean;
}

export interface RecipeIngredientItem {
  id: string;
  inventoryItemId: string;
  inventoryItemCode: string;
  inventoryItemName: string;
  quantity: number; // Base required qty (e.g. 200)
  uomCode: string; // (e.g. "g" or "ml")
  wastagePercentage: number; // e.g. 5%
  effectiveQuantity: number; // e.g. 210g
  unitCost: number; // Cost per uom
  totalCost: number; // effectiveQuantity * unitCost
}

export interface Recipe {
  id: string;
  menuItemId: string;
  menuItemCode: string;
  menuItemName: string;
  version: string; // "V1", "V2"
  yieldQuantity: number; // e.g. 1
  yieldUnit: string; // "Plate", "Portion", "Glass"
  preparationTimeMinutes: number;
  instructions: string;
  ingredients: RecipeIngredientItem[];
  totalRecipeCost: number; // Sum of ingredient effective costs
  suggestedSellingPrice?: number;
  targetFoodCostPercentage?: number;
  active: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  createdBy: string;
  createdAt: string;
}

export interface MenuModifierItem {
  id: string;
  menuItemId: string;
  name: string; // e.g. "Extra Chicken", "Extra Cheese", "Large Glass"
  price: number;
  recipeIngredients?: {
    inventoryItemId: string;
    inventoryItemCode: string;
    inventoryItemName: string;
    quantity: number;
    uomCode: string;
    cost: number;
  }[];
  active: boolean;
}

export interface MenuComboItem {
  id: string;
  name: string; // "Family Feast Combo"
  code: string;
  price: number;
  description: string;
  itemsIncluded: {
    menuItemId: string;
    menuItemName: string;
    quantity: number;
  }[];
  active: boolean;
}

export interface MenuPriceHistory {
  id: string;
  menuItemId: string;
  menuItemName: string;
  oldPrice: number;
  newPrice: number;
  effectiveFrom: string;
  changedBy: string;
  reason: string;
  createdAt: string;
}

export interface MenuItemEnhanced {
  id: string;
  menuCode: string;
  name: string;
  shortName?: string;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
  menuType: MenuType;
  outlet: OutletType[];
  kitchenStation: 'Main Hot Kitchen' | 'Tandoor & Curry' | 'Live BBQ Station' | 'Bar & Beverage Counter' | 'Bakery & Pastry' | 'Salad & Cold Station' | 'Room Service Pantry';
  description: string;
  image?: string;
  preparationTimeMinutes: number;
  servingSize: string; // e.g. "1 Person", "2-3 Persons"
  basePrice: number;
  serviceChargeRuleId?: string;
  serviceChargePercent: number;
  serviceChargeAmount: number;
  taxRuleId?: string;
  taxPercent: number;
  taxAmount: number;
  finalSellingPrice: number; // Base + SC + Tax
  costPrice: number; // Derived from active recipe
  foodCostPercentage: number; // (Cost / BasePrice) * 100
  profitMargin: number; // BasePrice - Cost
  hasActiveRecipe: boolean;
  activeRecipeId?: string;
  availability: MenuAvailabilityStatus;
  outletAvailability: Record<OutletType, boolean>;
  maxProduciblePortions?: number; // Calculated dynamically from ingredient stocks!
  autoOutOfStockOnLowIngredients: boolean;
  status: 'Active' | 'Inactive' | 'Draft' | 'Archived';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. F&B COSTING & PROFITABILITY REPORTS
// ==========================================

export interface FoodAndBeverageCostSummary {
  period: string;
  openingInventoryValue: number;
  purchasesTotal: number;
  closingInventoryValue: number;
  cogsTotal: number; // Opening + Purchases - Closing
  foodRevenue: number;
  beverageRevenue: number;
  totalRevenue: number;
  overallCostPercentage: number;
  foodCostPercentage: number;
  beverageCostPercentage: number;
  totalWastageValue: number;
  complimentaryCostValue: number;
}

export interface MenuItemProfitabilityRow {
  menuItemId: string;
  menuCode: string;
  name: string;
  category: string;
  menuType: MenuType;
  costPrice: number;
  sellingPrice: number;
  grossMargin: number;
  foodCostPercentage: number;
  unitsSold: number;
  totalRevenue: number;
  totalCost: number;
  totalGrossProfit: number;
  profitabilityTier: 'Stars (High Profit, High Sales)' | 'Plowhorses (Low Profit, High Sales)' | 'Puzzles (High Profit, Low Sales)' | 'Dogs (Low Profit, Low Sales)';
}
