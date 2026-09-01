// CCULB PMS - Seed Mock Database for Inventory & Menu Management

import {
  UnitOfMeasure, InventoryCategory, WarehouseStore, Supplier,
  InventoryItem, InventoryStockByWarehouse, ItemBatchRecord,
  StockLedgerEntry, PurchaseRequest, PurchaseOrder, GoodsReceiveNote,
  PurchaseReturn, StockTransfer, StoreIssueConsumption, WastageEntry,
  PhysicalStockCount, StockAdjustment, MenuItemEnhanced, Recipe,
  MenuModifierItem, MenuComboItem, MenuPriceHistory, ServiceChargeRule,
  TaxRule, MenuSubCategory
} from '../types/inventoryMenu';

// 1. UNITS OF MEASURE (UOM)
export const SEED_UOMS: UnitOfMeasure[] = [
  { id: 'uom-1', code: 'kg', name: 'Kilogram', category: 'Weight', conversionMultiplier: 1000, active: true },
  { id: 'uom-2', code: 'g', name: 'Gram', baseUnitId: 'uom-1', category: 'Weight', conversionMultiplier: 1, active: true },
  { id: 'uom-3', code: 'ltr', name: 'Liter', category: 'Volume', conversionMultiplier: 1000, active: true },
  { id: 'uom-4', code: 'ml', name: 'Milliliter', baseUnitId: 'uom-3', category: 'Volume', conversionMultiplier: 1, active: true },
  { id: 'uom-5', code: 'pcs', name: 'Piece', category: 'Count', conversionMultiplier: 1, active: true },
  { id: 'uom-6', code: 'carton', name: 'Carton (24 pcs)', category: 'Count', conversionMultiplier: 24, active: true },
  { id: 'uom-7', code: 'box', name: 'Box (12 pcs)', category: 'Count', conversionMultiplier: 12, active: true },
  { id: 'uom-8', code: 'bottle', name: 'Bottle', category: 'Count', conversionMultiplier: 1, active: true },
  { id: 'uom-9', code: 'can', name: 'Can', category: 'Count', conversionMultiplier: 1, active: true },
  { id: 'uom-10', code: 'pack', name: 'Pack', category: 'Count', conversionMultiplier: 1, active: true },
  { id: 'uom-11', code: 'plate', name: 'Plate / Portion', category: 'Portion', conversionMultiplier: 1, active: true },
  { id: 'uom-12', code: 'glass', name: 'Glass', category: 'Portion', conversionMultiplier: 1, active: true },
  { id: 'uom-13', code: 'dozen', name: 'Dozen', category: 'Count', conversionMultiplier: 12, active: true }
];

// 2. INVENTORY CATEGORIES
export const SEED_INVENTORY_CATEGORIES: InventoryCategory[] = [
  {
    id: 'icat-1',
    code: 'FOOD',
    name: 'Food & Raw Ingredients',
    department: 'F&B Kitchen',
    subcategories: ['Meat', 'Fish', 'Chicken', 'Vegetables', 'Fruits', 'Rice', 'Spices & Seasoning', 'Dairy', 'Bakery', 'Frozen Food', 'Oils & Ghee'],
    active: true
  },
  {
    id: 'icat-2',
    code: 'BEV',
    name: 'Beverages & Syrups',
    department: 'Bar & Lounge',
    subcategories: ['Soft Drinks', 'Fresh Juice', 'Tea', 'Coffee Beans', 'Mineral Water', 'Mocktail Syrups', 'Mixers'],
    active: true
  },
  {
    id: 'icat-3',
    code: 'BAR',
    name: 'Bar & Lounge Inventory',
    department: 'Bar & Lounge',
    subcategories: ['Beverage Ingredients', 'Bar Consumables', 'Glassware & Straws', 'Ice & Garnishes', 'Specialty Cordials'],
    active: true
  },
  {
    id: 'icat-4',
    code: 'HK',
    name: 'Housekeeping Supplies',
    department: 'Housekeeping',
    subcategories: ['Cleaning Chemicals', 'Guest Toiletries', 'Bed Linen', 'Towels', 'Room Amenities'],
    active: true
  },
  {
    id: 'icat-5',
    code: 'ENG',
    name: 'Engineering & Maintenance',
    department: 'Engineering',
    subcategories: ['Electrical', 'Plumbing', 'Hardware', 'HVAC Filters', 'Paints & Tools'],
    active: true
  },
  {
    id: 'icat-6',
    code: 'OFFICE',
    name: 'Office & Admin Stationery',
    department: 'Admin & General',
    subcategories: ['Printing Paper', 'POS Thermal Rolls', 'Keycards', 'Stationery'],
    active: true
  }
];

// 3. WAREHOUSES & STORAGE STORES
export const SEED_WAREHOUSES: WarehouseStore[] = [
  {
    id: 'wh-main',
    code: 'MAIN-STR',
    name: 'Central Main Warehouse',
    location: 'Ground Floor, Service Block A',
    storeKeeper: 'Abdul Karim',
    phone: '+880 1711-230001',
    active: true
  },
  {
    id: 'wh-kitchen',
    code: 'KITCHEN-STR',
    name: 'Kitchen Dry & Day Store',
    location: 'Main Kitchen, Resort complex',
    storeKeeper: 'Chef Rafiqul Islam',
    isKitchenStore: true,
    phone: '+880 1711-230002',
    active: true
  },
  {
    id: 'wh-cold',
    code: 'COLD-STR',
    name: 'Cold Storage Room (+4°C)',
    location: 'Kitchen Pantry Area',
    storeKeeper: 'Chef Rafiqul Islam',
    phone: '+880 1711-230003',
    active: true
  },
  {
    id: 'wh-frozen',
    code: 'FROZEN-STR',
    name: 'Deep Frozen Store (-18°C)',
    location: 'Kitchen Walk-in Freezer',
    storeKeeper: 'Chef Rafiqul Islam',
    phone: '+880 1711-230004',
    active: true
  },
  {
    id: 'wh-bar',
    code: 'BAR-STR',
    name: 'Bar & Lounge Dispense Store',
    location: 'Lakeview Lounge Bar Counter',
    storeKeeper: 'Tariq Bar Captain',
    isBarStore: true,
    phone: '+880 1711-230005',
    active: true
  },
  {
    id: 'wh-hk',
    code: 'HK-STR',
    name: 'Housekeeping Linen & Chemical Store',
    location: 'Level B1, Housekeeping Base',
    storeKeeper: 'Nasreen Akhter',
    phone: '+880 1711-230006',
    active: true
  },
  {
    id: 'wh-eng',
    code: 'ENG-STR',
    name: 'Engineering Workshop Store',
    location: 'Power Plant & Workshop',
    storeKeeper: 'Engineer Zahirul',
    phone: '+880 1711-230007',
    active: true
  }
];

// 4. SUPPLIERS
export const SEED_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    code: 'SUP-001',
    name: 'Bengal Meat Processing Ltd.',
    contactPerson: 'Kamrul Hassan',
    phone: '+880 1713-112233',
    email: 'sales@bengalmeat.com',
    address: 'Tejgaon I/A, Dhaka, Bangladesh',
    tradeLicense: 'TRAD/DSCC/012938/2024',
    paymentTerms: 'Net 30',
    categoriesSupplied: ['Meat', 'Chicken', 'Frozen Food'],
    currentPayableBalance: 45000,
    rating: 4.9,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sup-2',
    code: 'SUP-002',
    name: 'Pran Agro Foods & Dairy',
    contactPerson: 'Moinul Haque',
    phone: '+880 1713-223344',
    email: 'b2b@prangroup.com',
    address: 'Pran-RFL Center, Middle Badda, Dhaka',
    tradeLicense: 'TRAD/DNCC/082711/2024',
    paymentTerms: 'Net 15',
    categoriesSupplied: ['Dairy', 'Juice', 'Spices & Seasoning', 'Oils & Ghee', 'Bakery'],
    currentPayableBalance: 32000,
    rating: 4.8,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sup-3',
    code: 'SUP-003',
    name: 'Dhaka Beverage & Mixers Supply',
    contactPerson: 'Sabbir Ahmed',
    phone: '+880 1713-334455',
    email: 'orders@dhakabeverages.com',
    address: 'Kawran Bazar, Dhaka',
    paymentTerms: 'Net 15',
    categoriesSupplied: ['Soft Drinks', 'Mineral Water', 'Mixers', 'Mocktail Syrups'],
    currentPayableBalance: 18500,
    rating: 4.7,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sup-4',
    code: 'SUP-004',
    name: 'Padma Fresh Fish & River Catch',
    contactPerson: 'Ali Hossain',
    phone: '+880 1713-445566',
    email: 'padmafish@gmail.com',
    address: 'Mawa Ghat / Dohar, Dhaka',
    paymentTerms: 'Immediate',
    categoriesSupplied: ['Fish'],
    currentPayableBalance: 12000,
    rating: 4.9,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sup-5',
    code: 'SUP-005',
    name: 'Dohar Local Green Farmers Co-op',
    contactPerson: 'Nurul Islam',
    phone: '+880 1713-556677',
    email: 'doharfarmers@gmail.com',
    address: 'Joypara, Dohar, Dhaka',
    paymentTerms: 'Immediate',
    categoriesSupplied: ['Vegetables', 'Fruits'],
    currentPayableBalance: 8500,
    rating: 4.9,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sup-6',
    code: 'SUP-006',
    name: 'Square Toiletries & Linen Solutions',
    contactPerson: 'Farhan Rahman',
    phone: '+880 1713-667788',
    email: 'institutional@squaregroup.com',
    address: 'Square Centre, Uttara, Dhaka',
    paymentTerms: 'Net 30',
    categoriesSupplied: ['Cleaning Chemicals', 'Guest Toiletries', 'Bed Linen'],
    currentPayableBalance: 28000,
    rating: 4.8,
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

// 5. INVENTORY ITEMS MASTER
export const SEED_INVENTORY_ITEMS: InventoryItem[] = [
  // 1. Premium Basmati Rice
  {
    id: 'item-101',
    itemCode: 'ING-RICE-01',
    name: 'Premium Shahi Basmati Rice',
    itemType: 'Food Ingredient',
    categoryId: 'icat-1',
    categoryName: 'Food & Raw Ingredients',
    subcategory: 'Rice',
    brand: 'Kohinoor Platinum',
    description: 'Aged long-grain aromatic Basmati rice for Biryani & Polao',
    uomId: 'uom-1',
    uomCode: 'kg',
    purchaseUomId: 'uom-10', // 25kg Sack
    purchaseUomCode: 'bag (25kg)',
    consumptionUomId: 'uom-2', // Grams
    consumptionUomCode: 'g',
    conversionFactor: 1000, // 1 kg = 1000 g
    storageLocation: 'Dry Store Bay 1',
    defaultWarehouseId: 'wh-kitchen',
    minimumStock: 50, // 50 kg
    maximumStock: 300,
    reorderLevel: 80,
    reorderQuantity: 150,
    openingStock: 120,
    openingCost: 140,
    averageCost: 140, // ৳140 per kg (৳0.14 per g)
    lastPurchaseCost: 142,
    preferredSupplierId: 'sup-2',
    preferredSupplierName: 'Pran Agro Foods & Dairy',
    taxPercent: 0,
    active: true,
    trackBatch: true,
    trackExpiry: true,
    currentTotalStock: 145, // 145 kg
    currentTotalValue: 20300,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-30T00:00:00Z'
  },
  // 2. Fresh Chicken Breast & Cuts
  {
    id: 'item-102',
    itemCode: 'ING-CHIK-01',
    name: 'Farm Fresh Chicken (Bone-In / Boneless)',
    itemType: 'Food Ingredient',
    categoryId: 'icat-1',
    categoryName: 'Food & Raw Ingredients',
    subcategory: 'Chicken',
    brand: 'Bengal Meat Fresh',
    description: 'Dressed tender broiler & sonali chicken cuts for curry, grill & biryani',
    uomId: 'uom-1',
    uomCode: 'kg',
    purchaseUomId: 'uom-1',
    purchaseUomCode: 'kg',
    consumptionUomId: 'uom-2',
    consumptionUomCode: 'g',
    conversionFactor: 1000,
    storageLocation: 'Cold Storage Room Rack 2',
    defaultWarehouseId: 'wh-kitchen',
    minimumStock: 30,
    maximumStock: 150,
    reorderLevel: 45,
    reorderQuantity: 80,
    openingStock: 60,
    openingCost: 280,
    averageCost: 280, // ৳280/kg (৳0.28 per g)
    lastPurchaseCost: 285,
    preferredSupplierId: 'sup-1',
    preferredSupplierName: 'Bengal Meat Processing Ltd.',
    taxPercent: 0,
    active: true,
    trackBatch: true,
    trackExpiry: true,
    currentTotalStock: 52, // 52 kg
    currentTotalValue: 14560,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 3. Fresh Prime Beef
  {
    id: 'item-103',
    itemCode: 'ING-BEEF-01',
    name: 'Prime Bone-In Beef Cuts',
    itemType: 'Food Ingredient',
    categoryId: 'icat-1',
    categoryName: 'Food & Raw Ingredients',
    subcategory: 'Meat',
    brand: 'Bengal Meat Premium',
    description: 'Fresh grass-fed beef cuts for Bhuna & Rezala',
    uomId: 'uom-1',
    uomCode: 'kg',
    purchaseUomId: 'uom-1',
    purchaseUomCode: 'kg',
    consumptionUomId: 'uom-2',
    consumptionUomCode: 'g',
    conversionFactor: 1000,
    storageLocation: 'Cold Storage Room Rack 1',
    defaultWarehouseId: 'wh-kitchen',
    minimumStock: 25,
    maximumStock: 120,
    reorderLevel: 35,
    reorderQuantity: 60,
    openingStock: 40,
    openingCost: 780,
    averageCost: 780, // ৳780/kg (৳0.78 per g)
    lastPurchaseCost: 790,
    preferredSupplierId: 'sup-1',
    preferredSupplierName: 'Bengal Meat Processing Ltd.',
    taxPercent: 0,
    active: true,
    trackBatch: true,
    trackExpiry: true,
    currentTotalStock: 38, // 38 kg
    currentTotalValue: 29640,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 4. Fresh Padma Hilsa / River Fish
  {
    id: 'item-104',
    itemCode: 'ING-FISH-01',
    name: 'Padma River Hilsa / Rui Fish',
    itemType: 'Food Ingredient',
    categoryId: 'icat-1',
    categoryName: 'Food & Raw Ingredients',
    subcategory: 'Fish',
    brand: 'Padma Fresh River Catch',
    description: 'Fresh 1kg+ whole river fish cleaned and sliced for Shorshe Ilish & Fry',
    uomId: 'uom-1',
    uomCode: 'kg',
    purchaseUomId: 'uom-1',
    purchaseUomCode: 'kg',
    consumptionUomId: 'uom-2',
    consumptionUomCode: 'g',
    conversionFactor: 1000,
    storageLocation: 'Deep Frozen Store Shelf A',
    defaultWarehouseId: 'wh-kitchen',
    minimumStock: 15,
    maximumStock: 80,
    reorderLevel: 25,
    reorderQuantity: 40,
    openingStock: 30,
    openingCost: 1250,
    averageCost: 1250, // ৳1250/kg (৳1.25 per g)
    lastPurchaseCost: 1300,
    preferredSupplierId: 'sup-4',
    preferredSupplierName: 'Padma Fresh Fish & River Catch',
    taxPercent: 0,
    active: true,
    trackBatch: true,
    trackExpiry: true,
    currentTotalStock: 28, // 28 kg
    currentTotalValue: 35000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 5. Mustard Oil / Soybean Cooking Oil
  {
    id: 'item-105',
    itemCode: 'ING-OIL-01',
    name: 'Pure Mustard Oil & Refined Soybean Oil',
    itemType: 'Food Ingredient',
    categoryId: 'icat-1',
    categoryName: 'Food & Raw Ingredients',
    subcategory: 'Oils & Ghee',
    brand: 'Radhuni / Rupchanda',
    description: 'Cooking oils for Bengali traditional dishes, fries and curries',
    uomId: 'uom-3',
    uomCode: 'ltr',
    purchaseUomId: 'uom-3',
    purchaseUomCode: 'ltr',
    consumptionUomId: 'uom-4',
    consumptionUomCode: 'ml',
    conversionFactor: 1000, // 1 L = 1000 ml
    storageLocation: 'Dry Store Bay 2',
    defaultWarehouseId: 'wh-kitchen',
    minimumStock: 40,
    maximumStock: 200,
    reorderLevel: 60,
    reorderQuantity: 100,
    openingStock: 90,
    openingCost: 195,
    averageCost: 195, // ৳195/L (৳0.195 per ml)
    lastPurchaseCost: 195,
    preferredSupplierId: 'sup-2',
    preferredSupplierName: 'Pran Agro Foods & Dairy',
    taxPercent: 0,
    active: true,
    trackBatch: true,
    trackExpiry: true,
    currentTotalStock: 85, // 85 L
    currentTotalValue: 16575,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 6. Pure Cow Ghee
  {
    id: 'item-106',
    itemCode: 'ING-GHEE-01',
    name: 'Baghabari Special Cow Ghee',
    itemType: 'Food Ingredient',
    categoryId: 'icat-1',
    categoryName: 'Food & Raw Ingredients',
    subcategory: 'Oils & Ghee',
    brand: 'Aarong Dairy Pure Ghee',
    description: 'Rich pure clarified butter for Shahi Biryani, Polao and Korma aroma',
    uomId: 'uom-1',
    uomCode: 'kg',
    purchaseUomId: 'uom-1',
    purchaseUomCode: 'kg',
    consumptionUomId: 'uom-2',
    consumptionUomCode: 'g',
    conversionFactor: 1000,
    storageLocation: 'Dry Store Shelf 3',
    defaultWarehouseId: 'wh-kitchen',
    minimumStock: 10,
    maximumStock: 50,
    reorderLevel: 15,
    reorderQuantity: 25,
    openingStock: 22,
    openingCost: 1450,
    averageCost: 1450, // ৳1450/kg (৳1.45 per g)
    lastPurchaseCost: 1450,
    preferredSupplierId: 'sup-2',
    preferredSupplierName: 'Pran Agro Foods & Dairy',
    taxPercent: 0,
    active: true,
    trackBatch: true,
    trackExpiry: true,
    currentTotalStock: 18,
    currentTotalValue: 26100,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 7. Onions, Ginger & Garlic Paste
  {
    id: 'item-107',
    itemCode: 'ING-VEG-ONION',
    name: 'Fresh Red Onion & Aromatics (Ginger/Garlic)',
    itemType: 'Food Ingredient',
    categoryId: 'icat-1',
    categoryName: 'Food & Raw Ingredients',
    subcategory: 'Vegetables',
    brand: 'Dohar Local Farm Produce',
    description: 'Essential base aromatics and paste for gravy, marination and beresta',
    uomId: 'uom-1',
    uomCode: 'kg',
    purchaseUomId: 'uom-1',
    purchaseUomCode: 'kg',
    consumptionUomId: 'uom-2',
    consumptionUomCode: 'g',
    conversionFactor: 1000,
    storageLocation: 'Vegetable Cold Bin 1',
    defaultWarehouseId: 'wh-kitchen',
    minimumStock: 40,
    maximumStock: 200,
    reorderLevel: 60,
    reorderQuantity: 120,
    openingStock: 95,
    openingCost: 95,
    averageCost: 95, // ৳95/kg (৳0.095 per g)
    lastPurchaseCost: 98,
    preferredSupplierId: 'sup-5',
    preferredSupplierName: 'Dohar Local Green Farmers Co-op',
    taxPercent: 0,
    active: true,
    trackBatch: false,
    trackExpiry: true,
    currentTotalStock: 82,
    currentTotalValue: 7790,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 8. Shahi Biryani & Garam Masala Blend
  {
    id: 'item-108',
    itemCode: 'ING-SPICE-01',
    name: 'Chef Secret Shahi Garam Masala Blend',
    itemType: 'Food Ingredient',
    categoryId: 'icat-1',
    categoryName: 'Food & Raw Ingredients',
    subcategory: 'Spices & Seasoning',
    brand: 'Radhuni / In-house blend',
    description: 'Cardamom, cinnamon, mace, nutmeg, cloves, bay leaf and shahi jeera',
    uomId: 'uom-1',
    uomCode: 'kg',
    purchaseUomId: 'uom-1',
    purchaseUomCode: 'kg',
    consumptionUomId: 'uom-2',
    consumptionUomCode: 'g',
    conversionFactor: 1000,
    storageLocation: 'Spice Cabinet 1',
    defaultWarehouseId: 'wh-kitchen',
    minimumStock: 8,
    maximumStock: 40,
    reorderLevel: 12,
    reorderQuantity: 20,
    openingStock: 16,
    openingCost: 1100,
    averageCost: 1100, // ৳1100/kg (৳1.10 per g)
    lastPurchaseCost: 1100,
    preferredSupplierId: 'sup-2',
    preferredSupplierName: 'Pran Agro Foods & Dairy',
    taxPercent: 0,
    active: true,
    trackBatch: true,
    trackExpiry: true,
    currentTotalStock: 14,
    currentTotalValue: 15400,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 9. Full Cream Liquid Milk & Yogurt
  {
    id: 'item-109',
    itemCode: 'ING-DAIRY-01',
    name: 'Pasteurized Full Cream Milk & Curd',
    itemType: 'Food Ingredient',
    categoryId: 'icat-1',
    categoryName: 'Food & Raw Ingredients',
    subcategory: 'Dairy',
    brand: 'Aarong / Milk Vita',
    description: 'Fresh dairy for teas, coffees, desserts, marination and gravy',
    uomId: 'uom-3',
    uomCode: 'ltr',
    purchaseUomId: 'uom-3',
    purchaseUomCode: 'ltr',
    consumptionUomId: 'uom-4',
    consumptionUomCode: 'ml',
    conversionFactor: 1000,
    storageLocation: 'Dairy Chiller A',
    defaultWarehouseId: 'wh-kitchen',
    minimumStock: 25,
    maximumStock: 100,
    reorderLevel: 35,
    reorderQuantity: 60,
    openingStock: 45,
    openingCost: 90,
    averageCost: 90, // ৳90/L (৳0.09 per ml)
    lastPurchaseCost: 90,
    preferredSupplierId: 'sup-2',
    preferredSupplierName: 'Pran Agro Foods & Dairy',
    taxPercent: 0,
    active: true,
    trackBatch: true,
    trackExpiry: true,
    currentTotalStock: 42,
    currentTotalValue: 3780,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 10. Mozzarella & Cheddar Cheese
  {
    id: 'item-110',
    itemCode: 'ING-CHEESE-01',
    name: 'Gourmet Shredded Mozzarella & Cheddar Cheese',
    itemType: 'Food Ingredient',
    categoryId: 'icat-1',
    categoryName: 'Food & Raw Ingredients',
    subcategory: 'Dairy',
    brand: 'Anchor / Arla Foodservice',
    description: 'High melt stringy pizza and burger cheese block',
    uomId: 'uom-1',
    uomCode: 'kg',
    purchaseUomId: 'uom-1',
    purchaseUomCode: 'kg',
    consumptionUomId: 'uom-2',
    consumptionUomCode: 'g',
    conversionFactor: 1000,
    storageLocation: 'Cold Storage Shelf 4',
    defaultWarehouseId: 'wh-kitchen',
    minimumStock: 12,
    maximumStock: 60,
    reorderLevel: 18,
    reorderQuantity: 30,
    openingStock: 24,
    openingCost: 1150,
    averageCost: 1150, // ৳1150/kg (৳1.15 per g)
    lastPurchaseCost: 1180,
    preferredSupplierId: 'sup-2',
    preferredSupplierName: 'Pran Agro Foods & Dairy',
    taxPercent: 0,
    active: true,
    trackBatch: true,
    trackExpiry: true,
    currentTotalStock: 21,
    currentTotalValue: 24150,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 11. Fresh Mint, Lime & Mocktail Syrups (Bar Store)
  {
    id: 'item-201',
    itemCode: 'BAR-SYRUP-01',
    name: 'Monin Blue Curacao & Mojito Mint Cordial',
    itemType: 'Bar Item',
    categoryId: 'icat-3',
    categoryName: 'Bar & Lounge Inventory',
    subcategory: 'Beverage Ingredients',
    brand: 'Monin France',
    description: 'Premium bar syrups for Virgin Mojitos, Blue Lagoon and craft mocktails',
    uomId: 'uom-8', // Bottle 750ml
    uomCode: 'bottle',
    purchaseUomId: 'uom-8',
    purchaseUomCode: 'bottle (750ml)',
    consumptionUomId: 'uom-4',
    consumptionUomCode: 'ml',
    conversionFactor: 750, // 1 bottle = 750 ml
    storageLocation: 'Bar Back Counter Shelf 1',
    defaultWarehouseId: 'wh-bar',
    minimumStock: 6,
    maximumStock: 36,
    reorderLevel: 10,
    reorderQuantity: 18,
    openingStock: 14,
    openingCost: 1650, // ৳1650/bottle (৳2.20 per ml)
    averageCost: 1650,
    lastPurchaseCost: 1650,
    preferredSupplierId: 'sup-3',
    preferredSupplierName: 'Dhaka Beverage & Mixers Supply',
    taxPercent: 0,
    active: true,
    trackBatch: true,
    trackExpiry: true,
    currentTotalStock: 12,
    currentTotalValue: 19800,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 12. Tonic Water & Club Soda (Bar Store)
  {
    id: 'item-202',
    itemCode: 'BAR-SODA-01',
    name: 'Schweppes Sparkling Club Soda / Tonic Can',
    itemType: 'Bar Item',
    categoryId: 'icat-3',
    categoryName: 'Bar & Lounge Inventory',
    subcategory: 'Bar Consumables',
    brand: 'Schweppes / Coca-Cola',
    description: '330ml mixer cans for lounge drinks and fizzers',
    uomId: 'uom-9',
    uomCode: 'can',
    purchaseUomId: 'uom-6', // Carton 24 cans
    purchaseUomCode: 'carton (24 cans)',
    consumptionUomId: 'uom-9',
    consumptionUomCode: 'can',
    conversionFactor: 24, // 1 carton = 24 cans
    storageLocation: 'Bar Under-counter Chiller',
    defaultWarehouseId: 'wh-bar',
    minimumStock: 48,
    maximumStock: 240,
    reorderLevel: 72,
    reorderQuantity: 120,
    openingStock: 120,
    openingCost: 65, // ৳65 per can (৳1560/carton)
    averageCost: 65,
    lastPurchaseCost: 65,
    preferredSupplierId: 'sup-3',
    preferredSupplierName: 'Dhaka Beverage & Mixers Supply',
    taxPercent: 0,
    active: true,
    trackBatch: true,
    trackExpiry: true,
    currentTotalStock: 104,
    currentTotalValue: 6760,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 13. Arabica Espresso Roast Coffee Beans
  {
    id: 'item-203',
    itemCode: 'BEV-COFF-01',
    name: '100% Premium Arabica Coffee Beans (Dark Roast)',
    itemType: 'Beverage',
    categoryId: 'icat-2',
    categoryName: 'Beverages & Syrups',
    subcategory: 'Coffee Beans',
    brand: 'North End Coffee Roasters',
    description: 'Single-origin espresso roast beans for cafe machine grinder',
    uomId: 'uom-1',
    uomCode: 'kg',
    purchaseUomId: 'uom-1',
    purchaseUomCode: 'kg',
    consumptionUomId: 'uom-2',
    consumptionUomCode: 'g',
    conversionFactor: 1000,
    storageLocation: 'Bar Barista Station Bin',
    defaultWarehouseId: 'wh-bar',
    minimumStock: 8,
    maximumStock: 40,
    reorderLevel: 12,
    reorderQuantity: 20,
    openingStock: 18,
    openingCost: 2200, // ৳2200/kg (৳2.20 per g)
    averageCost: 2200,
    lastPurchaseCost: 2200,
    preferredSupplierId: 'sup-3',
    preferredSupplierName: 'Dhaka Beverage & Mixers Supply',
    taxPercent: 0,
    active: true,
    trackBatch: true,
    trackExpiry: true,
    currentTotalStock: 15,
    currentTotalValue: 33000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 14. Housekeeping Heavy Detergent & Sanitizer
  {
    id: 'item-301',
    itemCode: 'HK-CHEM-01',
    name: 'Diversey Taski R1 / R2 Floor & Bathroom Sanitizer',
    itemType: 'Housekeeping Supply',
    categoryId: 'icat-4',
    categoryName: 'Housekeeping Supplies',
    subcategory: 'Cleaning Chemicals',
    brand: 'Diversey Hygiene',
    description: 'Hospital grade concentrate for room disinfection and marble care',
    uomId: 'uom-3',
    uomCode: 'ltr',
    purchaseUomId: 'uom-3',
    purchaseUomCode: '5L Can',
    consumptionUomId: 'uom-4',
    consumptionUomCode: 'ml',
    conversionFactor: 1000,
    storageLocation: 'Housekeeping Chemical Rack',
    defaultWarehouseId: 'wh-hk',
    minimumStock: 20,
    maximumStock: 100,
    reorderLevel: 30,
    reorderQuantity: 50,
    openingStock: 45,
    openingCost: 350,
    averageCost: 350,
    lastPurchaseCost: 350,
    preferredSupplierId: 'sup-6',
    preferredSupplierName: 'Square Toiletries & Linen Solutions',
    taxPercent: 0,
    active: true,
    trackBatch: true,
    trackExpiry: true,
    currentTotalStock: 38,
    currentTotalValue: 13300,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  }
];

// 6. STOCK BY WAREHOUSE
export const SEED_INVENTORY_STOCKS: InventoryStockByWarehouse[] = [
  // Basmati Rice
  { id: 'stk-1', itemId: 'item-101', warehouseId: 'wh-kitchen', warehouseName: 'Kitchen Dry & Day Store', quantity: 95, averageCost: 140, stockValue: 13300, lastUpdated: '2026-08-31T10:00:00Z' },
  { id: 'stk-2', itemId: 'item-101', warehouseId: 'wh-main', warehouseName: 'Central Main Warehouse', quantity: 50, averageCost: 140, stockValue: 7000, lastUpdated: '2026-08-30T10:00:00Z' },
  // Chicken
  { id: 'stk-3', itemId: 'item-102', warehouseId: 'wh-kitchen', warehouseName: 'Kitchen Dry & Day Store', quantity: 32, averageCost: 280, stockValue: 8960, lastUpdated: '2026-08-31T11:00:00Z' },
  { id: 'stk-4', itemId: 'item-102', warehouseId: 'wh-cold', warehouseName: 'Cold Storage Room (+4°C)', quantity: 20, averageCost: 280, stockValue: 5600, lastUpdated: '2026-08-31T08:00:00Z' },
  // Beef
  { id: 'stk-5', itemId: 'item-103', warehouseId: 'wh-kitchen', warehouseName: 'Kitchen Dry & Day Store', quantity: 22, averageCost: 780, stockValue: 17160, lastUpdated: '2026-08-31T11:00:00Z' },
  { id: 'stk-6', itemId: 'item-103', warehouseId: 'wh-cold', warehouseName: 'Cold Storage Room (+4°C)', quantity: 16, averageCost: 780, stockValue: 12480, lastUpdated: '2026-08-30T09:00:00Z' },
  // Fish
  { id: 'stk-7', itemId: 'item-104', warehouseId: 'wh-kitchen', warehouseName: 'Kitchen Dry & Day Store', quantity: 12, averageCost: 1250, stockValue: 15000, lastUpdated: '2026-08-31T11:00:00Z' },
  { id: 'stk-8', itemId: 'item-104', warehouseId: 'wh-frozen', warehouseName: 'Deep Frozen Store (-18°C)', quantity: 16, averageCost: 1250, stockValue: 20000, lastUpdated: '2026-08-30T12:00:00Z' },
  // Oils
  { id: 'stk-9', itemId: 'item-105', warehouseId: 'wh-kitchen', warehouseName: 'Kitchen Dry & Day Store', quantity: 45, averageCost: 195, stockValue: 8775, lastUpdated: '2026-08-31T10:00:00Z' },
  { id: 'stk-10', itemId: 'item-105', warehouseId: 'wh-main', warehouseName: 'Central Main Warehouse', quantity: 40, averageCost: 195, stockValue: 7800, lastUpdated: '2026-08-30T14:00:00Z' },
  // Ghee
  { id: 'stk-11', itemId: 'item-106', warehouseId: 'wh-kitchen', warehouseName: 'Kitchen Dry & Day Store', quantity: 18, averageCost: 1450, stockValue: 26100, lastUpdated: '2026-08-31T10:00:00Z' },
  // Onions
  { id: 'stk-12', itemId: 'item-107', warehouseId: 'wh-kitchen', warehouseName: 'Kitchen Dry & Day Store', quantity: 52, averageCost: 95, stockValue: 4940, lastUpdated: '2026-08-31T11:00:00Z' },
  { id: 'stk-13', itemId: 'item-107', warehouseId: 'wh-cold', warehouseName: 'Cold Storage Room (+4°C)', quantity: 30, averageCost: 95, stockValue: 2850, lastUpdated: '2026-08-30T16:00:00Z' },
  // Spices
  { id: 'stk-14', itemId: 'item-108', warehouseId: 'wh-kitchen', warehouseName: 'Kitchen Dry & Day Store', quantity: 14, averageCost: 1100, stockValue: 15400, lastUpdated: '2026-08-31T10:00:00Z' },
  // Dairy Milk
  { id: 'stk-15', itemId: 'item-109', warehouseId: 'wh-kitchen', warehouseName: 'Kitchen Dry & Day Store', quantity: 28, averageCost: 90, stockValue: 2520, lastUpdated: '2026-08-31T11:00:00Z' },
  { id: 'stk-16', itemId: 'item-109', warehouseId: 'wh-bar', warehouseName: 'Bar & Lounge Dispense Store', quantity: 14, averageCost: 90, stockValue: 1260, lastUpdated: '2026-08-31T09:00:00Z' },
  // Cheese
  { id: 'stk-17', itemId: 'item-110', warehouseId: 'wh-kitchen', warehouseName: 'Kitchen Dry & Day Store', quantity: 21, averageCost: 1150, stockValue: 24150, lastUpdated: '2026-08-31T10:00:00Z' },
  // Bar Syrups
  { id: 'stk-18', itemId: 'item-201', warehouseId: 'wh-bar', warehouseName: 'Bar & Lounge Dispense Store', quantity: 12, averageCost: 1650, stockValue: 19800, lastUpdated: '2026-08-31T11:00:00Z' },
  // Club Soda
  { id: 'stk-19', itemId: 'item-202', warehouseId: 'wh-bar', warehouseName: 'Bar & Lounge Dispense Store', quantity: 64, averageCost: 65, stockValue: 4160, lastUpdated: '2026-08-31T11:00:00Z' },
  { id: 'stk-20', itemId: 'item-202', warehouseId: 'wh-main', warehouseName: 'Central Main Warehouse', quantity: 40, averageCost: 65, stockValue: 2600, lastUpdated: '2026-08-30T11:00:00Z' },
  // Coffee Beans
  { id: 'stk-21', itemId: 'item-203', warehouseId: 'wh-bar', warehouseName: 'Bar & Lounge Dispense Store', quantity: 15, averageCost: 2200, stockValue: 33000, lastUpdated: '2026-08-31T10:00:00Z' },
  // Housekeeping Detergent
  { id: 'stk-22', itemId: 'item-301', warehouseId: 'wh-hk', warehouseName: 'Housekeeping Linen & Chemical Store', quantity: 38, averageCost: 350, stockValue: 13300, lastUpdated: '2026-08-31T09:00:00Z' }
];

// 7. BATCHES WITH EXPIRY (FEFO)
export const SEED_BATCHES: ItemBatchRecord[] = [
  {
    id: 'bat-1',
    itemId: 'item-102',
    itemCode: 'ING-CHIK-01',
    itemName: 'Farm Fresh Chicken (Bone-In / Boneless)',
    warehouseId: 'wh-kitchen',
    batchNumber: 'BM-CHK-260830',
    manufacturingDate: '2026-08-30',
    expiryDate: '2026-09-06',
    receivedDate: '2026-08-30',
    quantity: 35,
    remainingQuantity: 32,
    unitCost: 280,
    supplierName: 'Bengal Meat Processing Ltd.',
    grnNumber: 'GRN-2026-0012',
    status: 'Fresh'
  },
  {
    id: 'bat-2',
    itemId: 'item-104',
    itemCode: 'ING-FISH-01',
    itemName: 'Padma River Hilsa / Rui Fish',
    warehouseId: 'wh-kitchen',
    batchNumber: 'PF-HLS-260829',
    manufacturingDate: '2026-08-29',
    expiryDate: '2026-09-08',
    receivedDate: '2026-08-29',
    quantity: 20,
    remainingQuantity: 12,
    unitCost: 1250,
    supplierName: 'Padma Fresh Fish & River Catch',
    grnNumber: 'GRN-2026-0011',
    status: 'Fresh'
  },
  {
    id: 'bat-3',
    itemId: 'item-109',
    itemCode: 'ING-DAIRY-01',
    itemName: 'Pasteurized Full Cream Milk & Curd',
    warehouseId: 'wh-kitchen',
    batchNumber: 'PR-MLK-260831',
    manufacturingDate: '2026-08-31',
    expiryDate: '2026-09-05',
    receivedDate: '2026-08-31',
    quantity: 30,
    remainingQuantity: 28,
    unitCost: 90,
    supplierName: 'Pran Agro Foods & Dairy',
    grnNumber: 'GRN-2026-0014',
    status: 'Fresh'
  },
  {
    id: 'bat-4',
    itemId: 'item-203',
    itemCode: 'BEV-COFF-01',
    itemName: '100% Premium Arabica Coffee Beans (Dark Roast)',
    warehouseId: 'wh-bar',
    batchNumber: 'NE-ARB-260715',
    manufacturingDate: '2026-07-15',
    expiryDate: '2027-01-15',
    receivedDate: '2026-07-20',
    quantity: 25,
    remainingQuantity: 15,
    unitCost: 2200,
    supplierName: 'Dhaka Beverage & Mixers Supply',
    grnNumber: 'GRN-2026-0008',
    status: 'Fresh'
  }
];

// 8. STOCK LEDGERS
export const SEED_STOCK_LEDGER: StockLedgerEntry[] = [
  {
    id: 'sl-1',
    date: '2026-08-30 08:00',
    transactionNumber: 'TX-STK-001',
    itemId: 'item-101',
    itemCode: 'ING-RICE-01',
    itemName: 'Premium Shahi Basmati Rice',
    warehouseId: 'wh-main',
    warehouseName: 'Central Main Warehouse',
    transactionType: 'Purchase Receive',
    referenceType: 'GRN',
    referenceId: 'grn-1',
    referenceDocument: 'GRN-2026-0010',
    quantityIn: 100,
    quantityOut: 0,
    unitCost: 140,
    totalCost: 14000,
    runningQuantity: 150,
    runningValue: 21000,
    businessDate: '2026-08-30',
    department: 'Procurement',
    user: 'Abdul Karim',
    notes: 'Received 4x 25kg sacks from Pran Agro',
    createdAt: '2026-08-30T08:00:00Z'
  },
  {
    id: 'sl-2',
    date: '2026-08-30 11:30',
    transactionNumber: 'TX-STK-002',
    itemId: 'item-101',
    itemCode: 'ING-RICE-01',
    itemName: 'Premium Shahi Basmati Rice',
    warehouseId: 'wh-main',
    warehouseName: 'Central Main Warehouse',
    transactionType: 'Store Transfer Out',
    referenceType: 'Transfer',
    referenceId: 'trf-1',
    referenceDocument: 'TRF-2026-0005',
    quantityIn: 0,
    quantityOut: 50,
    unitCost: 140,
    totalCost: 7000,
    runningQuantity: 100,
    runningValue: 14000,
    businessDate: '2026-08-30',
    department: 'Kitchen Store',
    user: 'Chef Rafiqul Islam',
    notes: 'Transfer to Kitchen Day Store',
    createdAt: '2026-08-30T11:30:00Z'
  },
  {
    id: 'sl-3',
    date: '2026-08-30 11:30',
    transactionNumber: 'TX-STK-003',
    itemId: 'item-101',
    itemCode: 'ING-RICE-01',
    itemName: 'Premium Shahi Basmati Rice',
    warehouseId: 'wh-kitchen',
    warehouseName: 'Kitchen Dry & Day Store',
    transactionType: 'Store Transfer In',
    referenceType: 'Transfer',
    referenceId: 'trf-1',
    referenceDocument: 'TRF-2026-0005',
    quantityIn: 50,
    quantityOut: 0,
    unitCost: 140,
    totalCost: 7000,
    runningQuantity: 100,
    runningValue: 14000,
    businessDate: '2026-08-30',
    department: 'Kitchen Store',
    user: 'Chef Rafiqul Islam',
    notes: 'Received from Main Warehouse',
    createdAt: '2026-08-30T11:30:00Z'
  },
  {
    id: 'sl-4',
    date: '2026-08-31 13:45',
    transactionNumber: 'TX-STK-004',
    itemId: 'item-102',
    itemCode: 'ING-CHIK-01',
    itemName: 'Farm Fresh Chicken (Bone-In / Boneless)',
    warehouseId: 'wh-kitchen',
    warehouseName: 'Kitchen Dry & Day Store',
    transactionType: 'Recipe Consumption',
    referenceType: 'POSOrder',
    referenceId: 'ord-101',
    referenceDocument: 'POS-2026-0104',
    quantityIn: 0,
    quantityOut: 1.05, // 5 portions x 210g effective = 1.05 kg
    unitCost: 280,
    totalCost: 294,
    runningQuantity: 32,
    runningValue: 8960,
    businessDate: '2026-08-31',
    department: 'Restaurant POS',
    user: 'F&B POS Engine',
    notes: 'Auto-consumed for 5x Shahi Chicken Biryani (Order POS-2026-0104)',
    createdAt: '2026-08-31T13:45:00Z'
  }
];

// 9. REQUISITIONS & PURCHASE ORDERS
export const SEED_PURCHASE_REQUESTS: PurchaseRequest[] = [
  {
    id: 'req-1',
    requestNumber: 'REQ-2026-0021',
    department: 'Main Kitchen F&B',
    warehouseId: 'wh-kitchen',
    warehouseName: 'Kitchen Dry & Day Store',
    requestDate: '2026-08-30',
    requiredDate: '2026-09-02',
    priority: 'High',
    items: [
      { itemId: 'item-102', itemCode: 'ING-CHIK-01', itemName: 'Farm Fresh Chicken (Bone-In / Boneless)', requestedQuantity: 60, approvedQuantity: 60, uom: 'kg', estimatedUnitCost: 280, estimatedTotal: 16800, currentStock: 32, notes: 'Weekend banquet & restaurant rush replenishment' },
      { itemId: 'item-103', itemCode: 'ING-BEEF-01', itemName: 'Prime Bone-In Beef Cuts', requestedQuantity: 40, approvedQuantity: 40, uom: 'kg', estimatedUnitCost: 780, estimatedTotal: 31200, currentStock: 22, notes: 'Convention catering orders' }
    ],
    totalEstimatedAmount: 48000,
    status: 'PO Generated',
    requestedBy: 'Chef Rafiqul Islam',
    approvedBy: 'Farhana Sultana (GM)',
    approvedAt: '2026-08-30T14:00:00Z',
    remarks: 'Approved for procurement from Bengal Meat',
    createdAt: '2026-08-30T11:00:00Z'
  }
];

export const SEED_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-0015',
    requisitionId: 'req-1',
    requisitionNumber: 'REQ-2026-0021',
    supplierId: 'sup-1',
    supplierName: 'Bengal Meat Processing Ltd.',
    warehouseId: 'wh-kitchen',
    warehouseName: 'Kitchen Dry & Day Store',
    orderDate: '2026-08-30',
    expectedDeliveryDate: '2026-09-02',
    paymentTerms: 'Net 30',
    items: [
      { itemId: 'item-102', itemCode: 'ING-CHIK-01', itemName: 'Farm Fresh Chicken (Bone-In / Boneless)', quantity: 60, receivedQuantity: 35, pendingQuantity: 25, uom: 'kg', unitPrice: 280, taxPercent: 0, total: 16800 },
      { itemId: 'item-103', itemCode: 'ING-BEEF-01', itemName: 'Prime Bone-In Beef Cuts', quantity: 40, receivedQuantity: 0, pendingQuantity: 40, uom: 'kg', unitPrice: 780, taxPercent: 0, total: 31200 }
    ],
    subtotal: 48000,
    taxAmount: 0,
    grandTotal: 48000,
    status: 'Partially Received',
    receivedTotalValue: 9800,
    preparedBy: 'Abdul Karim (Store Manager)',
    approvedBy: 'Farhana Sultana (GM)',
    notes: 'Partial delivery expected early morning',
    createdAt: '2026-08-30T15:00:00Z'
  }
];

export const SEED_GRNS: GoodsReceiveNote[] = [
  {
    id: 'grn-1',
    grnNumber: 'GRN-2026-0012',
    poId: 'po-1',
    poNumber: 'PO-2026-0015',
    supplierId: 'sup-1',
    supplierName: 'Bengal Meat Processing Ltd.',
    warehouseId: 'wh-kitchen',
    warehouseName: 'Kitchen Dry & Day Store',
    receiveDate: '2026-08-30',
    challanNumber: 'CHAL-BM-88912',
    challanDate: '2026-08-30',
    items: [
      {
        itemId: 'item-102',
        itemCode: 'ING-CHIK-01',
        itemName: 'Farm Fresh Chicken (Bone-In / Boneless)',
        poQuantity: 60,
        receivedQuantity: 35,
        acceptedQuantity: 35,
        rejectedQuantity: 0,
        uom: 'kg',
        unitPrice: 280,
        totalPrice: 9800,
        batchNumber: 'BM-CHK-260830',
        expiryDate: '2026-09-06'
      }
    ],
    totalAcceptedAmount: 9800,
    inspectionPassed: true,
    inspectedBy: 'Chef Rafiqul Islam',
    receivedBy: 'Abdul Karim',
    status: 'Approved & Added to Stock',
    journalVoucherNumber: 'JV-2026-0145',
    createdAt: '2026-08-30T17:00:00Z'
  }
];

export const SEED_PURCHASE_RETURNS: PurchaseReturn[] = [];

export const SEED_STOCK_TRANSFERS: StockTransfer[] = [
  {
    id: 'trf-1',
    transferNumber: 'TRF-2026-0005',
    sourceWarehouseId: 'wh-main',
    sourceWarehouseName: 'Central Main Warehouse',
    destinationWarehouseId: 'wh-kitchen',
    destinationWarehouseName: 'Kitchen Dry & Day Store',
    transferDate: '2026-08-30',
    items: [
      { itemId: 'item-101', itemCode: 'ING-RICE-01', itemName: 'Premium Shahi Basmati Rice', quantity: 50, uom: 'kg', unitCost: 140, totalCost: 7000 }
    ],
    totalCost: 7000,
    status: 'Received',
    requestedBy: 'Chef Rafiqul Islam',
    approvedBy: 'Abdul Karim',
    receivedBy: 'Chef Rafiqul Islam',
    remarks: 'Replenishment for weekend Biryani production',
    createdAt: '2026-08-30T11:00:00Z'
  }
];

export const SEED_STORE_ISSUES: StoreIssueConsumption[] = [
  {
    id: 'iss-1',
    issueNumber: 'ISS-2026-0018',
    warehouseId: 'wh-kitchen',
    warehouseName: 'Kitchen Dry & Day Store',
    department: 'Kitchen',
    recipientName: 'Chef Anwar (Hot Section)',
    issueDate: '2026-08-31',
    purpose: 'Daily mise en place and bulk gravy preparation',
    items: [
      { itemId: 'item-105', itemCode: 'ING-OIL-01', itemName: 'Pure Mustard Oil & Refined Soybean Oil', quantity: 10, uom: 'ltr', unitCost: 195, totalCost: 1950 },
      { itemId: 'item-107', itemCode: 'ING-VEG-ONION', itemName: 'Fresh Red Onion & Aromatics', quantity: 20, uom: 'kg', unitCost: 95, totalCost: 1900 },
      { itemId: 'item-108', itemCode: 'ING-SPICE-01', itemName: 'Chef Secret Shahi Garam Masala Blend', quantity: 2, uom: 'kg', unitCost: 1100, totalCost: 2200 }
    ],
    totalCost: 6050,
    issuedBy: 'Chef Rafiqul Islam',
    approvedBy: 'Chef Rafiqul Islam',
    createdAt: '2026-08-31T07:30:00Z'
  }
];

export const SEED_WASTAGES: WastageEntry[] = [
  {
    id: 'wst-1',
    wastageNumber: 'WST-2026-0004',
    date: '2026-08-30',
    department: 'Kitchen',
    warehouseId: 'wh-kitchen',
    warehouseName: 'Kitchen Dry & Day Store',
    itemId: 'item-109',
    itemCode: 'ING-DAIRY-01',
    itemName: 'Pasteurized Full Cream Milk & Curd',
    quantity: 2,
    uom: 'ltr',
    unitCost: 90,
    totalCost: 180,
    reason: 'Spoiled',
    remarks: 'Curdled during overnight chiller temperature fluctuation',
    reportedBy: 'Chef Anwar',
    approvedBy: 'Farhana Sultana (GM)',
    status: 'Approved & Written Off',
    journalVoucherNumber: 'JV-2026-0149',
    createdAt: '2026-08-30T09:00:00Z'
  }
];

export const SEED_PHYSICAL_COUNTS: PhysicalStockCount[] = [
  {
    id: 'psc-1',
    countNumber: 'PSC-2026-0008',
    warehouseId: 'wh-kitchen',
    warehouseName: 'Kitchen Dry & Day Store',
    countDate: '2026-08-30',
    items: [
      { itemId: 'item-101', itemCode: 'ING-RICE-01', itemName: 'Premium Shahi Basmati Rice', uom: 'kg', systemQuantity: 96, countedQuantity: 95, varianceQuantity: -1, unitCost: 140, varianceValue: -140, notes: 'Normal scooping spillage variance' },
      { itemId: 'item-105', itemCode: 'ING-OIL-01', itemName: 'Pure Mustard Oil & Refined Soybean Oil', uom: 'ltr', systemQuantity: 45, countedQuantity: 45, varianceQuantity: 0, unitCost: 195, varianceValue: 0 }
    ],
    totalSystemValue: 22215,
    totalCountedValue: 22075,
    netVarianceValue: -140,
    countedBy: 'Chef Anwar & Auditor Mizan',
    verifiedBy: 'Abdul Karim',
    approvedBy: 'Farhana Sultana (GM)',
    status: 'Reconciled & Adjusted',
    adjustmentJournalVoucher: 'JV-2026-0150',
    createdAt: '2026-08-30T22:00:00Z'
  }
];

export const SEED_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: 'adj-1',
    adjustmentNumber: 'ADJ-2026-0008',
    date: '2026-08-30',
    warehouseId: 'wh-kitchen',
    warehouseName: 'Kitchen Dry & Day Store',
    adjustmentType: 'Decrease',
    itemId: 'item-101',
    itemCode: 'ING-RICE-01',
    itemName: 'Premium Shahi Basmati Rice',
    quantity: 1,
    uom: 'kg',
    unitCost: 140,
    totalValue: 140,
    reason: 'Monthly physical count audit shrinkage reconciliation (PSC-2026-0008)',
    adjustedBy: 'Arif Chowdhury (Accounts)',
    approvedBy: 'Farhana Sultana (GM)',
    createdAt: '2026-08-30T23:00:00Z'
  }
];

// ==========================================
// 10. MENU ITEMS, RECIPES & PRICING
// ==========================================

export const SEED_SERVICE_CHARGE_RULES: ServiceChargeRule[] = [
  {
    id: 'sc-rule-1',
    name: 'Standard Restaurant & Bar Service Charge (10%)',
    ratePercent: 10,
    applicableOutlets: ['Restaurant', 'Bar', 'Room Service', 'Pool', 'Banquet'],
    effectiveDate: '2026-01-01',
    active: true
  }
];

export const SEED_TAX_RULES: TaxRule[] = [
  {
    id: 'tax-rule-1',
    name: 'NBR Standard VAT (15%)',
    taxRatePercent: 15,
    isInclusive: false, // Calculated on subtotal + SC
    glAccountCode: '2100',
    effectiveDate: '2026-01-01',
    active: true
  }
];

export const SEED_ENHANCED_MENU_ITEMS: MenuItemEnhanced[] = [
  // 1. CCULB Special Shahi Chicken Biryani
  {
    id: 'menu-101',
    menuCode: 'MNU-CHK-BRY',
    name: 'CCULB Special Shahi Chicken Biryani',
    shortName: 'Chicken Biryani',
    categoryId: 'cat-main',
    categoryName: 'Main Course',
    menuType: 'Food',
    outlet: ['Restaurant', 'Room Service', 'Pool', 'Banquet'],
    kitchenStation: 'Main Hot Kitchen',
    description: 'Fragrant aged Basmati rice layered with succulent farm chicken, pure cow ghee, saffron essence, and whole boiled egg.',
    preparationTimeMinutes: 20,
    servingSize: '1 Person (Platter)',
    basePrice: 500, // ৳500 Base
    serviceChargePercent: 10,
    serviceChargeAmount: 50,
    taxPercent: 15,
    taxAmount: 75,
    finalSellingPrice: 625, // ৳500 + ৳50 + ৳75 = ৳625
    costPrice: 132.5, // Total recipe cost
    foodCostPercentage: 26.5, // (132.5 / 500) * 100 = 26.5%
    profitMargin: 367.5,
    hasActiveRecipe: true,
    activeRecipeId: 'rec-101',
    availability: 'Available',
    outletAvailability: {
      Restaurant: true,
      Bar: true,
      Pool: true,
      'Room Service': true,
      Banquet: true,
      Event: true,
      Other: true
    },
    maxProduciblePortions: 48, // Auto-computed from stock!
    autoOutOfStockOnLowIngredients: true,
    status: 'Active',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 2. Dhaka Prime Beef Bhuna & Paratha Platter
  {
    id: 'menu-102',
    menuCode: 'MNU-BEEF-BHN',
    name: 'Dhaka Prime Beef Bhuna with Paratha Platter',
    shortName: 'Beef Bhuna Platter',
    categoryId: 'cat-main',
    categoryName: 'Main Course',
    menuType: 'Food',
    outlet: ['Restaurant', 'Room Service', 'Banquet'],
    kitchenStation: 'Main Hot Kitchen',
    description: 'Tender slow-braised prime beef in rich caramelized onion & whole spice gravy, served with 2 handmade flaky parathas.',
    preparationTimeMinutes: 25,
    servingSize: '1 Person',
    basePrice: 650,
    serviceChargePercent: 10,
    serviceChargeAmount: 65,
    taxPercent: 15,
    taxAmount: 97.5,
    finalSellingPrice: 812.5,
    costPrice: 198.0,
    foodCostPercentage: 30.5,
    profitMargin: 452.0,
    hasActiveRecipe: true,
    activeRecipeId: 'rec-102',
    availability: 'Available',
    outletAvailability: {
      Restaurant: true,
      Bar: false,
      Pool: false,
      'Room Service': true,
      Banquet: true,
      Event: true,
      Other: true
    },
    maxProduciblePortions: 36,
    autoOutOfStockOnLowIngredients: true,
    status: 'Active',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 3. Pan-Fried Mustard Padma Hilsa
  {
    id: 'menu-103',
    menuCode: 'MNU-FISH-ILS',
    name: 'Authentic Shorshe Ilish (Mustard Padma Hilsa)',
    shortName: 'Shorshe Ilish',
    categoryId: 'cat-main',
    categoryName: 'Main Course',
    menuType: 'Food',
    outlet: ['Restaurant', 'Room Service', 'Banquet'],
    kitchenStation: 'Main Hot Kitchen',
    description: 'Fresh Padma River Hilsa steak simmered in stone-ground yellow mustard, green chili and virgin mustard oil broth.',
    preparationTimeMinutes: 20,
    servingSize: '1 Person (Whole Cut)',
    basePrice: 850,
    serviceChargePercent: 10,
    serviceChargeAmount: 85,
    taxPercent: 15,
    taxAmount: 127.5,
    finalSellingPrice: 1062.5,
    costPrice: 285.0,
    foodCostPercentage: 33.5,
    profitMargin: 565.0,
    hasActiveRecipe: true,
    activeRecipeId: 'rec-103',
    availability: 'Available',
    outletAvailability: {
      Restaurant: true,
      Bar: false,
      Pool: true,
      'Room Service': true,
      Banquet: true,
      Event: true,
      Other: true
    },
    maxProduciblePortions: 24,
    autoOutOfStockOnLowIngredients: true,
    status: 'Active',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 4. Double Cheese Gourmet Chicken Burger
  {
    id: 'menu-104',
    menuCode: 'MNU-BGR-CHK',
    name: 'Double Cheese Flame-Grilled Chicken Burger',
    shortName: 'Gourmet Chicken Burger',
    categoryId: 'cat-app',
    categoryName: 'Snacks & Quick Bites',
    menuType: 'Food',
    outlet: ['Restaurant', 'Bar', 'Pool', 'Room Service'],
    kitchenStation: 'Live BBQ Station',
    description: 'Grilled minced chicken patty with melted mozzarella & cheddar cheese, caramelized onions and spicy mayo in toasted brioche.',
    preparationTimeMinutes: 15,
    servingSize: '1 Burger with Fries',
    basePrice: 420,
    serviceChargePercent: 10,
    serviceChargeAmount: 42,
    taxPercent: 15,
    taxAmount: 63,
    finalSellingPrice: 525,
    costPrice: 125.0,
    foodCostPercentage: 29.8,
    profitMargin: 295.0,
    hasActiveRecipe: true,
    activeRecipeId: 'rec-104',
    availability: 'Available',
    outletAvailability: {
      Restaurant: true,
      Bar: true,
      Pool: true,
      'Room Service': true,
      Banquet: false,
      Event: true,
      Other: true
    },
    maxProduciblePortions: 40,
    autoOutOfStockOnLowIngredients: true,
    status: 'Active',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 5. Classic Lakeview Virgin Mojito (Bar)
  {
    id: 'menu-201',
    menuCode: 'MNU-BAR-MOJ',
    name: 'Lakeview Fresh Mint Virgin Mojito',
    shortName: 'Virgin Mojito',
    categoryId: 'cat-bev',
    categoryName: 'Beverages & Bar',
    menuType: 'Bar',
    outlet: ['Bar', 'Restaurant', 'Pool', 'Room Service'],
    kitchenStation: 'Bar & Beverage Counter',
    description: 'Muddled fresh garden mint, Persian lime chunks, Monin mojito syrup, sparkling club soda and crushed crystal ice.',
    preparationTimeMinutes: 5,
    servingSize: '1 Tall Glass (350ml)',
    basePrice: 280,
    serviceChargePercent: 10,
    serviceChargeAmount: 28,
    taxPercent: 15,
    taxAmount: 42,
    finalSellingPrice: 350,
    costPrice: 62.5,
    foodCostPercentage: 22.3,
    profitMargin: 217.5,
    hasActiveRecipe: true,
    activeRecipeId: 'rec-201',
    availability: 'Available',
    outletAvailability: {
      Restaurant: true,
      Bar: true,
      Pool: true,
      'Room Service': true,
      Banquet: true,
      Event: true,
      Other: true
    },
    maxProduciblePortions: 64,
    autoOutOfStockOnLowIngredients: true,
    status: 'Active',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  },
  // 6. Double Shot Arabica Cappuccino (Barista)
  {
    id: 'menu-202',
    menuCode: 'MNU-BEV-CAP',
    name: 'Artisan Arabica Double Shot Cappuccino',
    shortName: 'Cappuccino',
    categoryId: 'cat-bev',
    categoryName: 'Beverages & Bar',
    menuType: 'Beverage',
    outlet: ['Bar', 'Restaurant', 'Room Service'],
    kitchenStation: 'Bar & Beverage Counter',
    description: 'Double shot rich espresso topped with silky micro-foamed full cream milk and dusted cocoa powder.',
    preparationTimeMinutes: 5,
    servingSize: '1 Ceramic Mug (220ml)',
    basePrice: 220,
    serviceChargePercent: 10,
    serviceChargeAmount: 22,
    taxPercent: 15,
    taxAmount: 33,
    finalSellingPrice: 275,
    costPrice: 48.0,
    foodCostPercentage: 21.8,
    profitMargin: 172.0,
    hasActiveRecipe: true,
    activeRecipeId: 'rec-202',
    availability: 'Available',
    outletAvailability: {
      Restaurant: true,
      Bar: true,
      Pool: false,
      'Room Service': true,
      Banquet: false,
      Event: true,
      Other: true
    },
    maxProduciblePortions: 75,
    autoOutOfStockOnLowIngredients: true,
    status: 'Active',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  }
];

// 11. RECIPES & INGREDIENT FORMULAS
export const SEED_RECIPES: Recipe[] = [
  // Recipe for CCULB Shahi Chicken Biryani (rec-101)
  {
    id: 'rec-101',
    menuItemId: 'menu-101',
    menuItemCode: 'MNU-CHK-BRY',
    menuItemName: 'CCULB Special Shahi Chicken Biryani',
    version: 'V1',
    yieldQuantity: 1,
    yieldUnit: 'Plate / Portion',
    preparationTimeMinutes: 20,
    instructions: '1. Marinate 200g chicken in yogurt, ginger-garlic paste and biryani masala for 2 hours. 2. Parboil 220g Basmati rice with whole spices. 3. Layer in copper degchi with pure ghee, saffron milk and fried onions. 4. Seal with dough and slow-cook on dum for 18 minutes.',
    ingredients: [
      {
        id: 'ri-1',
        inventoryItemId: 'item-101',
        inventoryItemCode: 'ING-RICE-01',
        inventoryItemName: 'Premium Shahi Basmati Rice',
        quantity: 220, // 220g required
        uomCode: 'g',
        wastagePercentage: 5, // 5% washing/trimming waste
        effectiveQuantity: 231, // 231g
        unitCost: 0.14, // ৳140/kg = ৳0.14/g
        totalCost: 32.34
      },
      {
        id: 'ri-2',
        inventoryItemId: 'item-102',
        inventoryItemCode: 'ING-CHIK-01',
        inventoryItemName: 'Farm Fresh Chicken',
        quantity: 200, // 200g chicken
        uomCode: 'g',
        wastagePercentage: 5,
        effectiveQuantity: 210,
        unitCost: 0.28, // ৳280/kg = ৳0.28/g
        totalCost: 58.80
      },
      {
        id: 'ri-3',
        inventoryItemId: 'item-106',
        inventoryItemCode: 'ING-GHEE-01',
        inventoryItemName: 'Baghabari Special Cow Ghee',
        quantity: 15, // 15g ghee
        uomCode: 'g',
        wastagePercentage: 0,
        effectiveQuantity: 15,
        unitCost: 1.45, // ৳1450/kg = ৳1.45/g
        totalCost: 21.75
      },
      {
        id: 'ri-4',
        inventoryItemId: 'item-107',
        inventoryItemCode: 'ING-VEG-ONION',
        inventoryItemName: 'Fresh Red Onion & Aromatics',
        quantity: 60, // 60g onion for gravy & beresta
        uomCode: 'g',
        wastagePercentage: 10,
        effectiveQuantity: 66,
        unitCost: 0.095,
        totalCost: 6.27
      },
      {
        id: 'ri-5',
        inventoryItemId: 'item-108',
        inventoryItemCode: 'ING-SPICE-01',
        inventoryItemName: 'Chef Secret Shahi Garam Masala Blend',
        quantity: 12, // 12g spices
        uomCode: 'g',
        wastagePercentage: 0,
        effectiveQuantity: 12,
        unitCost: 1.10,
        totalCost: 13.20
      }
    ],
    totalRecipeCost: 132.36, // Total Cost ৳132.36 (rounded to ৳132.50)
    suggestedSellingPrice: 500,
    targetFoodCostPercentage: 26.5,
    active: true,
    effectiveFrom: '2026-01-01',
    createdBy: 'Executive Chef Rafiqul Islam',
    createdAt: '2026-01-01T00:00:00Z'
  },
  // Recipe for Beef Bhuna Platter (rec-102)
  {
    id: 'rec-102',
    menuItemId: 'menu-102',
    menuItemCode: 'MNU-BEEF-BHN',
    menuItemName: 'Dhaka Prime Beef Bhuna with Paratha Platter',
    version: 'V1',
    yieldQuantity: 1,
    yieldUnit: 'Plate',
    preparationTimeMinutes: 25,
    instructions: '1. Sauté sliced onions in mustard oil until deep brown. 2. Add ginger-garlic paste and spice blend. 3. Add 220g beef cubes and bhunao on high flame. 4. Slow simmer until oil separates and beef is melting tender. Serve with 2 parathas.',
    ingredients: [
      {
        id: 'ri-6',
        inventoryItemId: 'item-103',
        inventoryItemCode: 'ING-BEEF-01',
        inventoryItemName: 'Prime Bone-In Beef Cuts',
        quantity: 200,
        uomCode: 'g',
        wastagePercentage: 10, // 10% bone/trimming waste
        effectiveQuantity: 220,
        unitCost: 0.78, // ৳780/kg
        totalCost: 171.60
      },
      {
        id: 'ri-7',
        inventoryItemId: 'item-105',
        inventoryItemCode: 'ING-OIL-01',
        inventoryItemName: 'Pure Mustard Oil',
        quantity: 30,
        uomCode: 'ml',
        wastagePercentage: 0,
        effectiveQuantity: 30,
        unitCost: 0.195,
        totalCost: 5.85
      },
      {
        id: 'ri-8',
        inventoryItemId: 'item-107',
        inventoryItemCode: 'ING-VEG-ONION',
        inventoryItemName: 'Fresh Red Onion & Aromatics',
        quantity: 80,
        uomCode: 'g',
        wastagePercentage: 10,
        effectiveQuantity: 88,
        unitCost: 0.095,
        totalCost: 8.36
      },
      {
        id: 'ri-9',
        inventoryItemId: 'item-108',
        inventoryItemCode: 'ING-SPICE-01',
        inventoryItemName: 'Chef Secret Shahi Garam Masala Blend',
        quantity: 11,
        uomCode: 'g',
        wastagePercentage: 0,
        effectiveQuantity: 11,
        unitCost: 1.10,
        totalCost: 12.10
      }
    ],
    totalRecipeCost: 197.91, // ৳198
    suggestedSellingPrice: 650,
    targetFoodCostPercentage: 30.5,
    active: true,
    effectiveFrom: '2026-01-01',
    createdBy: 'Executive Chef Rafiqul Islam',
    createdAt: '2026-01-01T00:00:00Z'
  },
  // Recipe for Virgin Mojito (rec-201)
  {
    id: 'rec-201',
    menuItemId: 'menu-201',
    menuItemCode: 'MNU-BAR-MOJ',
    menuItemName: 'Lakeview Fresh Mint Virgin Mojito',
    version: 'V1',
    yieldQuantity: 1,
    yieldUnit: 'Glass (350ml)',
    preparationTimeMinutes: 5,
    instructions: '1. Place 6 fresh mint leaves and 4 lime wedges in highball glass. 2. Gently muddle to extract essential oils. 3. Add 20ml Monin Mojito Mint Cordial. 4. Top with crushed crystal ice and 1 can Schweppes Club Soda. 5. Garnish with mint sprig and dehydrated lime slice.',
    ingredients: [
      {
        id: 'ri-10',
        inventoryItemId: 'item-201',
        inventoryItemCode: 'BAR-SYRUP-01',
        inventoryItemName: 'Monin Blue Curacao & Mojito Mint Cordial',
        quantity: 20,
        uomCode: 'ml',
        wastagePercentage: 0,
        effectiveQuantity: 20,
        unitCost: 2.20, // ৳1650/750ml = ৳2.20/ml
        totalCost: 44.00
      },
      {
        id: 'ri-11',
        inventoryItemId: 'item-202',
        inventoryItemCode: 'BAR-SODA-01',
        inventoryItemName: 'Schweppes Sparkling Club Soda / Tonic Can',
        quantity: 0.25, // 1/4th can (80ml mixer)
        uomCode: 'can',
        wastagePercentage: 0,
        effectiveQuantity: 0.25,
        unitCost: 65.00,
        totalCost: 16.25
      }
    ],
    totalRecipeCost: 60.25,
    suggestedSellingPrice: 280,
    targetFoodCostPercentage: 22.3,
    active: true,
    effectiveFrom: '2026-01-01',
    createdBy: 'Tariq Bar Captain',
    createdAt: '2026-01-01T00:00:00Z'
  },
  // Recipe for Artisan Cappuccino (rec-202)
  {
    id: 'rec-202',
    menuItemId: 'menu-202',
    menuItemCode: 'MNU-BEV-CAP',
    menuItemName: 'Artisan Arabica Double Shot Cappuccino',
    version: 'V1',
    yieldQuantity: 1,
    yieldUnit: 'Cup',
    preparationTimeMinutes: 5,
    instructions: '1. Grind 18g Arabica coffee beans directly into double portafilter. 2. Tamp at 30lbs pressure and extract 36g espresso in 27 seconds. 3. Steam 150ml chilled full cream milk to 65°C with micro-foam. 4. Pour latte art in pre-warmed ceramic cup.',
    ingredients: [
      {
        id: 'ri-12',
        inventoryItemId: 'item-203',
        inventoryItemCode: 'BEV-COFF-01',
        inventoryItemName: '100% Premium Arabica Coffee Beans',
        quantity: 18,
        uomCode: 'g',
        wastagePercentage: 5, // Grinder retention waste
        effectiveQuantity: 18.9,
        unitCost: 2.20, // ৳2200/kg = ৳2.20/g
        totalCost: 41.58
      },
      {
        id: 'ri-13',
        inventoryItemId: 'item-109',
        inventoryItemCode: 'ING-DAIRY-01',
        inventoryItemName: 'Pasteurized Full Cream Milk',
        quantity: 150,
        uomCode: 'ml',
        wastagePercentage: 0,
        effectiveQuantity: 150,
        unitCost: 0.09, // ৳90/L = ৳0.09/ml
        totalCost: 13.50
      }
    ],
    totalRecipeCost: 55.08,
    suggestedSellingPrice: 220,
    targetFoodCostPercentage: 25.0,
    active: true,
    effectiveFrom: '2026-01-01',
    createdBy: 'Tariq Bar Captain',
    createdAt: '2026-01-01T00:00:00Z'
  }
];

// 12. MODIFIERS & ADD-ONS
export const SEED_MENU_MODIFIERS: MenuModifierItem[] = [
  {
    id: 'mod-1',
    menuItemId: 'menu-101',
    name: 'Extra Succulent Chicken Piece (100g)',
    price: 150,
    recipeIngredients: [
      { inventoryItemId: 'item-102', inventoryItemCode: 'ING-CHIK-01', inventoryItemName: 'Farm Fresh Chicken', quantity: 105, uomCode: 'g', cost: 29.40 }
    ],
    active: true
  },
  {
    id: 'mod-2',
    menuItemId: 'menu-101',
    name: 'Extra Fragrant Dum Basmati Rice (150g)',
    price: 60,
    recipeIngredients: [
      { inventoryItemId: 'item-101', inventoryItemCode: 'ING-RICE-01', inventoryItemName: 'Premium Shahi Basmati Rice', quantity: 80, uomCode: 'g', cost: 11.20 }
    ],
    active: true
  },
  {
    id: 'mod-3',
    menuItemId: 'menu-104',
    name: 'Extra Melted Cheddar & Mozzarella Slice',
    price: 50,
    recipeIngredients: [
      { inventoryItemId: 'item-110', inventoryItemCode: 'ING-CHEESE-01', inventoryItemName: 'Gourmet Shredded Cheese', quantity: 30, uomCode: 'g', cost: 34.50 }
    ],
    active: true
  }
];

// 13. COMBOS & PACKAGES
export const SEED_MENU_COMBOS: MenuComboItem[] = [
  {
    id: 'cmb-1',
    name: 'CCULB Royal Weekend Family Feast',
    code: 'CMB-ROYAL-01',
    price: 1850,
    description: '2x Shahi Chicken Biryani, 1x Beef Bhuna Platter, 2x Virgin Mojitos & 2x Desserts',
    itemsIncluded: [
      { menuItemId: 'menu-101', menuItemName: 'CCULB Special Shahi Chicken Biryani', quantity: 2 },
      { menuItemId: 'menu-102', menuItemName: 'Dhaka Prime Beef Bhuna Platter', quantity: 1 },
      { menuItemId: 'menu-201', menuItemName: 'Lakeview Fresh Mint Virgin Mojito', quantity: 2 }
    ],
    active: true
  }
];

// 14. PRICE HISTORIES
export const SEED_PRICE_HISTORIES: MenuPriceHistory[] = [
  {
    id: 'mph-1',
    menuItemId: 'menu-101',
    menuItemName: 'CCULB Special Shahi Chicken Biryani',
    oldPrice: 450,
    newPrice: 500,
    effectiveFrom: '2026-01-01',
    changedBy: 'Farhana Sultana (GM)',
    reason: 'Annual menu adjustment and raw Basmati price increase from supplier',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'mph-2',
    menuItemId: 'menu-102',
    menuItemName: 'Dhaka Prime Beef Bhuna Platter',
    oldPrice: 580,
    newPrice: 650,
    effectiveFrom: '2026-01-01',
    changedBy: 'Farhana Sultana (GM)',
    reason: 'Increase in Bengal Meat prime cuts procurement cost',
    createdAt: '2026-01-01T00:00:00Z'
  }
];
