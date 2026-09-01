// CCULB PMS - Comprehensive Inventory Management Module
// Full Stock Ledger, Warehouses, GRN, Wastage, Physical Count, Purchase & Valuation

import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes, Package, Warehouse, ArrowUpDown, Receipt, AlertTriangle,
  FileCheck, Trash2, ClipboardList, ShoppingCart, Truck, Users,
  BarChart3, Settings, Plus, Search, Filter, RefreshCw, CheckCircle2,
  Calendar, Layers, Tag, Scale, ArrowRight, Eye, Printer, Download,
  TrendingDown, TrendingUp, Clock, AlertCircle, ShieldAlert, Sparkles
} from 'lucide-react';
import { inventoryMenuService } from '../services/inventoryMenuService';
import { pmsService } from '../services/pmsService';
import { PmsDatabaseState } from '../services/mockPmsDatabase';
import {
  InventoryItem, WarehouseStore, InventoryCategory, UnitOfMeasure,
  Supplier, StockLedgerEntry, StockAdjustment, StockTransfer,
  GoodsReceiveNote, StoreIssueConsumption, WastageEntry,
  PhysicalStockCount, PurchaseRequest, PurchaseOrder
} from '../types/inventoryMenu';

interface InventoryViewProps {
  initialTab?: string;
  onPrintDocument?: (type: string, data: any) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ initialTab = 'dashboard', onPrintDocument }) => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modals
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [isWastageModalOpen, setIsWastageModalOpen] = useState(false);
  const [isPhysicalCountModalOpen, setIsPhysicalCountModalOpen] = useState(false);
  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<InventoryItem | null>(null);

  // Form states for modals
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    itemCode: '',
    categoryId: 'icat-1',
    primaryUomId: 'uom-kg',
    consumptionUomId: 'uom-g',
    conversionFactor: 1000,
    itemType: 'Food Ingredient' as InventoryItem['itemType'],
    defaultWarehouseId: 'wh-main',
    preferredSupplierId: 'sup-1',
    reorderLevel: 20,
    minimumStock: 10,
    maximumStock: 150,
    openingStock: 0,
    averageCost: 100
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    itemId: '',
    warehouseId: 'wh-kitchen',
    adjustmentType: 'Increase' as 'Increase' | 'Decrease',
    quantity: 1,
    reason: 'Inventory reconciliation audit correction',
    adjustedBy: 'Store Supervisor'
  });

  const [transferForm, setTransferForm] = useState({
    sourceWarehouseId: 'wh-main',
    destinationWarehouseId: 'wh-kitchen',
    itemId: '',
    quantity: 5,
    remarks: 'Daily kitchen store replenishment requisition',
    requestedBy: 'Executive Chef Mohammad Ali'
  });

  const [wastageForm, setWastageForm] = useState({
    itemId: '',
    warehouseId: 'wh-kitchen',
    quantity: 2,
    reason: 'Spoilage' as WastageEntry['reason'],
    department: 'Kitchen' as WastageEntry['department'],
    remarks: 'Expired after refrigeration failure check',
    reportedBy: 'Sous Chef Rafiqul Islam'
  });

  const [grnForm, setGrnForm] = useState({
    supplierId: 'sup-1',
    warehouseId: 'wh-main',
    challanNumber: 'CH-2026-894',
    itemId: '',
    receivedQty: 50,
    unitPrice: 140,
    batchNumber: 'BAT-2026-AUG31',
    expiryDate: '2027-02-28',
    receivedBy: 'Warehouse Officer'
  });

  useEffect(() => {
    return pmsService.subscribe(setDb);
  }, []);

  const items = useMemo(() => inventoryMenuService.getInventoryItems(), [db]);
  const warehouses = useMemo(() => inventoryMenuService.getWarehouses(), [db]);
  const categories = useMemo(() => inventoryMenuService.getCategories(), [db]);
  const uoms = useMemo(() => inventoryMenuService.getUoms(), [db]);
  const suppliers = useMemo(() => inventoryMenuService.getSuppliers(), [db]);
  const stockLedgers = useMemo(() => inventoryMenuService.getStockLedgers(), [db]);
  const lowStockAlerts = useMemo(() => inventoryMenuService.getLowStockAlerts(), [db]);
  const grns = useMemo(() => inventoryMenuService.getGoodsReceiveNotes(), [db]);
  const wastages = useMemo(() => inventoryMenuService.getWastages(), [db]);
  const transfers = useMemo(() => inventoryMenuService.getStockTransfers(), [db]);
  const adjustments = useMemo(() => inventoryMenuService.getAdjustments(), [db]);
  const physicalCounts = useMemo(() => inventoryMenuService.getPhysicalCounts(), [db]);
  const purchaseOrders = useMemo(() => inventoryMenuService.getPurchaseOrders(), [db]);
  const purchaseRequests = useMemo(() => inventoryMenuService.getPurchaseRequests(), [db]);
  const costSummary = useMemo(() => inventoryMenuService.getFoodAndBeverageCostSummary(), [db]);

  // Total Valuation
  const totalInventoryValuation = useMemo(() => {
    return items.reduce((sum, i) => sum + i.currentTotalValue, 0);
  }, [items]);

  const foodValuation = useMemo(() => {
    return items.filter(i => i.itemType === 'Food Raw Material' || i.itemType === 'Perishable').reduce((sum, i) => sum + i.currentTotalValue, 0);
  }, [items]);

  const barValuation = useMemo(() => {
    return items.filter(i => i.itemType === 'Beverage' || i.itemType === 'Bar Supply').reduce((sum, i) => sum + i.currentTotalValue, 0);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategoryFilter === 'all' || item.categoryId === selectedCategoryFilter;
      const matchWarehouse = selectedWarehouseFilter === 'all' || item.defaultWarehouseId === selectedWarehouseFilter;
      return matchSearch && matchCategory && matchWarehouse;
    });
  }, [items, searchQuery, selectedCategoryFilter, selectedWarehouseFilter]);

  // Tab Definitions
  const tabs = [
    { id: 'dashboard', label: 'Inventory Dashboard', icon: Boxes },
    { id: 'items', label: 'Items & Stock', icon: Package, badge: items.length },
    { id: 'warehouses', label: 'Warehouses / Stores', icon: Warehouse, badge: warehouses.length },
    { id: 'stock-levels', label: 'Batch & Expiry', icon: Clock },
    { id: 'ledger', label: 'Stock Ledger', icon: Receipt, badge: stockLedgers.length },
    { id: 'transfers', label: 'Store Transfers', icon: ArrowUpDown },
    { id: 'grn', label: 'Goods Receive (GRN)', icon: Truck, badge: grns.length },
    { id: 'issues', label: 'Store Consumption', icon: ArrowRight },
    { id: 'wastage', label: 'Wastage & Spoilage', icon: Trash2, badge: wastages.length },
    { id: 'physical-counts', label: 'Physical Audit Count', icon: ClipboardList },
    { id: 'adjustments', label: 'Stock Adjustments', icon: Scale },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, badge: purchaseOrders.length },
    { id: 'suppliers', label: 'Suppliers Directory', icon: Users, badge: suppliers.length },
    { id: 'reports', label: 'Valuation & Reports', icon: BarChart3 },
    { id: 'categories-uom', label: 'Categories & UOM', icon: Tag }
  ];

  // Handle Add Item
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find(c => c.id === newItemForm.categoryId);
    const pUom = uoms.find(u => u.id === newItemForm.primaryUomId);
    const cUom = uoms.find(u => u.id === newItemForm.consumptionUomId);
    const sup = suppliers.find(s => s.id === newItemForm.preferredSupplierId);

    inventoryMenuService.addInventoryItem({
      name: newItemForm.name,
      itemCode: newItemForm.itemCode || `ITM-${Date.now().toString().slice(-4)}`,
      categoryId: newItemForm.categoryId,
      categoryName: cat?.name || 'General',
      subcategory: cat?.subcategories?.[0] || 'General',
      uomId: newItemForm.primaryUomId,
      uomCode: pUom?.code || 'kg',
      purchaseUomId: newItemForm.primaryUomId,
      purchaseUomCode: pUom?.code || 'kg',
      consumptionUomId: newItemForm.consumptionUomId,
      consumptionUomCode: cUom?.code || 'g',
      conversionFactor: Number(newItemForm.conversionFactor) || 1000,
      itemType: newItemForm.itemType,
      defaultWarehouseId: newItemForm.defaultWarehouseId,
      preferredSupplierId: newItemForm.preferredSupplierId,
      preferredSupplierName: sup?.name,
      reorderLevel: Number(newItemForm.reorderLevel) || 10,
      reorderQuantity: 20,
      minimumStock: Number(newItemForm.minimumStock) || 5,
      maximumStock: Number(newItemForm.maximumStock) || 100,
      openingStock: Number(newItemForm.openingStock) || 0,
      openingCost: Number(newItemForm.averageCost) || 0,
      averageCost: Number(newItemForm.averageCost) || 0,
      lastPurchaseCost: Number(newItemForm.averageCost) || 0,
      taxPercent: 0,
      trackBatch: true,
      trackExpiry: true,
      active: true
    });

    setIsAddItemModalOpen(false);
  };

  // Handle Stock Adjustment
  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const itm = items.find(i => i.id === adjustmentForm.itemId);
    const wh = warehouses.find(w => w.id === adjustmentForm.warehouseId);
    if (!itm || !wh) return;

    inventoryMenuService.createStockAdjustment({
      date: new Date().toISOString().split('T')[0],
      itemId: itm.id,
      itemCode: itm.itemCode,
      itemName: itm.name,
      warehouseId: wh.id,
      warehouseName: wh.name,
      adjustmentType: adjustmentForm.adjustmentType,
      quantity: Number(adjustmentForm.quantity) || 1,
      uom: itm.uomCode || 'kg',
      unitCost: itm.averageCost,
      totalValue: (Number(adjustmentForm.quantity) || 1) * itm.averageCost,
      reason: adjustmentForm.reason,
      adjustedBy: adjustmentForm.adjustedBy,
      approvedBy: 'Store Supervisor'
    });

    setIsAdjustmentModalOpen(false);
  };

  // Handle Transfer
  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const itm = items.find(i => i.id === transferForm.itemId);
    const src = warehouses.find(w => w.id === transferForm.sourceWarehouseId);
    const dest = warehouses.find(w => w.id === transferForm.destinationWarehouseId);
    if (!itm || !src || !dest) return;

    inventoryMenuService.createStockTransfer({
      transferDate: new Date().toISOString().split('T')[0],
      sourceWarehouseId: src.id,
      sourceWarehouseName: src.name,
      destinationWarehouseId: dest.id,
      destinationWarehouseName: dest.name,
      items: [
        {
          itemId: itm.id,
          itemCode: itm.itemCode,
          itemName: itm.name,
          quantity: Number(transferForm.quantity) || 1,
          uom: itm.uomCode || 'kg',
          unitCost: itm.averageCost,
          totalCost: (Number(transferForm.quantity) || 1) * itm.averageCost
        }
      ],
      totalCost: (Number(transferForm.quantity) || 1) * itm.averageCost,
      status: 'Received',
      requestedBy: transferForm.requestedBy,
      approvedBy: 'Warehouse In-Charge',
      receivedBy: 'Department Supervisor',
      remarks: transferForm.remarks
    });

    setIsTransferModalOpen(false);
  };

  // Handle Wastage
  const handleCreateWastage = (e: React.FormEvent) => {
    e.preventDefault();
    const itm = items.find(i => i.id === wastageForm.itemId);
    const wh = warehouses.find(w => w.id === wastageForm.warehouseId);
    if (!itm || !wh) return;

    inventoryMenuService.createWastage({
      date: new Date().toISOString().split('T')[0],
      itemId: itm.id,
      itemCode: itm.itemCode,
      itemName: itm.name,
      warehouseId: wh.id,
      warehouseName: wh.name,
      quantity: Number(wastageForm.quantity) || 1,
      uom: itm.uomCode || 'kg',
      unitCost: itm.averageCost,
      totalCost: (Number(wastageForm.quantity) || 1) * itm.averageCost,
      reason: wastageForm.reason,
      department: wastageForm.department,
      reportedBy: wastageForm.reportedBy,
      approvedBy: 'Executive Chef / F&B Manager',
      status: 'Approved & Written Off',
      remarks: wastageForm.remarks
    });

    setIsWastageModalOpen(false);
  };

  // Handle GRN
  const handleCreateGrn = (e: React.FormEvent) => {
    e.preventDefault();
    const itm = items.find(i => i.id === grnForm.itemId);
    const sup = suppliers.find(s => s.id === grnForm.supplierId);
    const wh = warehouses.find(w => w.id === grnForm.warehouseId);
    if (!itm || !sup || !wh) return;

    const acceptedQty = Number(grnForm.receivedQty) || 1;
    const unitPrice = Number(grnForm.unitPrice) || itm.averageCost;
    const totalAmount = acceptedQty * unitPrice;

    inventoryMenuService.createGoodsReceiveNote({
      supplierId: sup.id,
      supplierName: sup.name,
      warehouseId: wh.id,
      warehouseName: wh.name,
      receiveDate: new Date().toISOString().split('T')[0],
      challanNumber: grnForm.challanNumber,
      challanDate: new Date().toISOString().split('T')[0],
      items: [
        {
          itemId: itm.id,
          itemCode: itm.itemCode,
          itemName: itm.name,
          receivedQuantity: acceptedQty,
          acceptedQuantity: acceptedQty,
          rejectedQuantity: 0,
          uom: itm.uomCode || 'kg',
          unitPrice,
          totalPrice: totalAmount,
          batchNumber: grnForm.batchNumber,
          expiryDate: grnForm.expiryDate
        }
      ],
      totalAcceptedAmount: totalAmount,
      inspectionPassed: true,
      inspectedBy: 'Quality Inspector',
      receivedBy: grnForm.receivedBy,
      status: 'Approved & Added to Stock'
    });

    setIsGrnModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Boxes className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Inventory & Stores Management
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Single Source of Truth
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time stock ledger, procurement, automated recipe consumption, GRN & GL Accounting integration
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsGrnModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            <Truck className="w-4 h-4" />
            <span>Receive Goods (GRN)</span>
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Stock Transfer</span>
          </button>

          <button
            onClick={() => setIsWastageModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Log Wastage</span>
          </button>

          <button
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            <Scale className="w-4 h-4" />
            <span>Adjust Stock</span>
          </button>

          <button
            onClick={() => setIsAddItemModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Item</span>
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. TAB VIEWS CONTENT */}

      {/* ========================================================
          TAB 1: DASHBOARD
      ======================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total Inventory Valuation</span>
              <div className="text-2xl font-bold font-mono text-amber-400">
                ৳{totalInventoryValuation.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Food: ৳{foodValuation.toLocaleString()}</span>
                <span>•</span>
                <span>Bar: ৳{barValuation.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow space-y-1">
              <span className="text-xs text-slate-400 font-medium">Low Stock / Reorder Alerts</span>
              <div className="text-2xl font-bold font-mono text-rose-400 flex items-center justify-between">
                <span>{lowStockAlerts.length} Items</span>
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div className="text-[11px] text-rose-300/80">
                {lowStockAlerts.filter(a => a.urgency === 'Critical').length} Critical Out-of-Stock Risk
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow space-y-1">
              <span className="text-xs text-slate-400 font-medium">Food & Beverage COGS (MTD)</span>
              <div className="text-2xl font-bold font-mono text-indigo-400">
                ৳{costSummary.cogsTotal.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-400">
                Food Cost: {costSummary.foodCostPercentage}% (Target: ≤ 30%)
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow space-y-1">
              <span className="text-xs text-slate-400 font-medium">Recorded Wastage (MTD)</span>
              <div className="text-2xl font-bold font-mono text-orange-400">
                ৳{costSummary.totalWastageValue.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400">
                {wastages.length} approved write-off logs
              </div>
            </div>
          </div>

          {/* Low Stock Alerts Banner */}
          {lowStockAlerts.length > 0 && (
            <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                  <AlertCircle className="w-5 h-5" />
                  <span>Immediate Procurement Reorder Required ({lowStockAlerts.length} Items)</span>
                </div>
                <button
                  onClick={() => setIsPurchaseOrderModalOpen(true)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition"
                >
                  Generate Purchase Orders
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockAlerts.map(({ item, deficit, urgency }) => (
                  <div key={item.id} className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-200 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Code: {item.itemCode} • Store: {item.defaultWarehouseName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-rose-400 block">
                        {item.currentTotalStock} {item.primaryUom} (Min: {item.minimumStock})
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        urgency === 'Critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {urgency} Deficit: -{deficit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Overview Tables: Stores & Recent Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Warehouses Snapshot */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-amber-400" />
                  Store / Warehouse Inventory Breakdown
                </h3>
                <span className="text-xs text-slate-400">{warehouses.length} Active Stores</span>
              </div>

              <div className="space-y-3">
                {warehouses.map(wh => {
                  const whStocks = db.inventoryStocks.filter(s => s.warehouseId === wh.id);
                  const whValuation = whStocks.reduce((sum, s) => sum + s.stockValue, 0);
                  const itemCount = whStocks.length;

                  return (
                    <div key={wh.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-200">{wh.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {wh.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Managed by {wh.managerName} • Location: {wh.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-xs text-amber-400 block">
                          ৳{whValuation.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {itemCount} SKUs stocked
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Stock Ledger Activity */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-400" />
                  Live Stock Ledger Activity Stream
                </h3>
                <button
                  onClick={() => setActiveTab('ledger')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  View Full Ledger →
                </button>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[340px]">
                {stockLedgers.slice(0, 7).map(ledger => {
                  const isIncoming = ledger.quantityIn > 0;
                  return (
                    <div key={ledger.id} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            ledger.transactionType === 'Purchase Receive'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : ledger.transactionType === 'Recipe Consumption'
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : ledger.transactionType === 'Wastage'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {ledger.transactionType}
                          </span>
                          <span className="font-bold text-slate-200">{ledger.itemName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {ledger.date} • Ref: {ledger.referenceDocument} • Store: {ledger.warehouseName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold block ${
                          isIncoming ? 'text-emerald-400' : 'text-slate-300'
                        }`}>
                          {isIncoming ? `+${ledger.quantityIn}` : `-${ledger.quantityOut}`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ৳{ledger.totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: ITEMS & PRODUCTS MASTER
      ======================================================== */}
      {activeTab === 'items' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                Inventory Items Master Catalog ({filteredItems.length} Products)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized master data with UOM conversions, weighted average cost, and live stock tracking
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search item name, SKU code..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Warehouse Filter */}
              <select
                value={selectedWarehouseFilter}
                onChange={e => setSelectedWarehouseFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300"
              >
                <option value="all">All Warehouses</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-3 py-3">Code / SKU</th>
                  <th className="px-3 py-3">Item Name</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Default Store</th>
                  <th className="px-3 py-3">UOM & Ratio</th>
                  <th className="px-3 py-3 text-right">Avg Cost</th>
                  <th className="px-3 py-3 text-right">Current Stock</th>
                  <th className="px-3 py-3 text-right">Total Valuation</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredItems.map(item => {
                  const isLow = item.currentTotalStock <= item.reorderLevel;
                  const isOut = item.currentTotalStock === 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-3 py-3 font-mono font-bold text-amber-400">
                        {item.itemCode}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-white">{item.name}</div>
                        <span className="text-[10px] text-slate-400">{item.itemType} • {item.storageType}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                          {item.categoryName}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-400">
                        {item.defaultWarehouseName}
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px]">
                        {item.primaryUom} (1 {item.primaryUom} = {item.conversionFactor} {item.consumptionUom})
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-semibold">
                        ৳{item.averageCost.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold">
                        <span className={isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}>
                          {item.currentTotalStock} {item.primaryUom}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-white">
                        ৳{item.currentTotalValue.toLocaleString()}
                      </td>
                      <td className="px-3 py-3">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Reorder (≤ {item.reorderLevel})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Adequate
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => setSelectedItemDetail(item)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
                        >
                          View Card
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: STOCK LEDGER (AUDIT TRAIL)
      ======================================================== */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                Immutable Stock Ledger & Audit Log ({stockLedgers.length} Transactions)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every stock transaction is recorded here with running balance, unit cost, source document & business date
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-bold">
                GL Account Integrated: 1300 / 1310 / 5020 / 5028
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-3 py-3">Txn #</th>
                  <th className="px-3 py-3">Date & Time</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Item Name</th>
                  <th className="px-3 py-3">Store / Warehouse</th>
                  <th className="px-3 py-3">Source Ref</th>
                  <th className="px-3 py-3 text-right">In (+Qty)</th>
                  <th className="px-3 py-3 text-right">Out (-Qty)</th>
                  <th className="px-3 py-3 text-right">Unit Cost</th>
                  <th className="px-3 py-3 text-right">Total Cost</th>
                  <th className="px-3 py-3 text-right">Running Stock</th>
                  <th className="px-3 py-3">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {stockLedgers.map(l => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-3 py-2.5 font-mono font-bold text-indigo-400">
                      {l.transactionNumber}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-400">
                      {l.date}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        l.transactionType === 'Purchase Receive'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : l.transactionType === 'Recipe Consumption'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : l.transactionType === 'Wastage'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {l.transactionType}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-white">
                      {l.itemName}
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">
                      {l.warehouseName}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-400">
                      {l.referenceDocument}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-400">
                      {l.quantityIn > 0 ? `+${l.quantityIn}` : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-400">
                      {l.quantityOut > 0 ? `-${l.quantityOut}` : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      ৳{l.unitCost.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-white">
                      ৳{l.totalCost.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-amber-400">
                      {l.runningQuantity}
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">
                      {l.user}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 7: GOODS RECEIVE NOTE (GRN)
      ======================================================== */}
      {activeTab === 'grn' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                Goods Receive Notes (GRN) & Inward Receiving
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically posts Accounting Journal Vouchers (Dr 1300/1310 Inventory, Cr 2050 AP Creditors)
              </p>
            </div>
            <button
              onClick={() => setIsGrnModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Inward GRN</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grns.map(grn => (
              <div key={grn.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-emerald-400 text-sm">{grn.grnNumber}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {grn.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{grn.receiveDate}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Supplier / Vendor:</span>
                    <span className="font-semibold text-slate-200">{grn.supplierName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Challan / Invoice #:</span>
                    <span className="font-mono text-slate-200">{grn.challanNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Receiving Store:</span>
                    <span className="text-slate-200">{grn.warehouseName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Accounting Journal Voucher:</span>
                    <span className="font-mono font-bold text-amber-400">{grn.journalVoucherNumber}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-lg space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Items Received:</span>
                  {grn.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300">
                      <span>{it.itemName} (x{it.acceptedQuantity} {it.uom})</span>
                      <span className="font-mono font-bold">৳{it.totalPrice.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-800 text-white">
                    <span>Total Accepted Value:</span>
                    <span className="text-emerald-400 font-mono">৳{grn.totalAcceptedAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 9: WASTAGE & SPOILAGE
      ======================================================== */}
      {activeTab === 'wastage' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                Wastage, Spoilage & Write-Offs ({wastages.length} Records)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every loss is accounted with GL Expense Voucher Dr 5028 Kitchen & Bar Wastage Expense
              </p>
            </div>
            <button
              onClick={() => setIsWastageModalOpen(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Record Wastage</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-3 py-3">Wastage #</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Department</th>
                  <th className="px-3 py-3">Item Name</th>
                  <th className="px-3 py-3">Store</th>
                  <th className="px-3 py-3 text-right">Written-Off Qty</th>
                  <th className="px-3 py-3 text-right">Unit Cost</th>
                  <th className="px-3 py-3 text-right">Loss Amount</th>
                  <th className="px-3 py-3">Reason & Notes</th>
                  <th className="px-3 py-3">Accounting JV #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {wastages.map(w => (
                  <tr key={w.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-3 py-3 font-mono font-bold text-rose-400">{w.wastageNumber}</td>
                    <td className="px-3 py-3 font-mono text-slate-400">{w.date}</td>
                    <td className="px-3 py-3 font-semibold text-slate-200">{w.department}</td>
                    <td className="px-3 py-3 font-bold text-white">{w.itemName}</td>
                    <td className="px-3 py-3 text-slate-400">{w.warehouseName}</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-rose-400">
                      -{w.quantity} {w.uom}
                    </td>
                    <td className="px-3 py-3 text-right font-mono">৳{w.unitCost}</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-rose-400">
                      ৳{w.totalCost.toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                        {w.reason}
                      </span>
                      {w.remarks && <p className="text-[10px] text-slate-400 mt-0.5">{w.remarks}</p>}
                    </td>
                    <td className="px-3 py-3 font-mono font-bold text-amber-400">
                      {w.journalVoucherNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 10: PHYSICAL STOCK COUNT AUDIT
      ======================================================== */}
      {activeTab === 'physical-counts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-400" />
                Physical Stock Count & Blind Audit Reconciliations
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Compare actual physical counts with system stock, detect shrinkage & auto-post variance journals
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {physicalCounts.map(count => (
              <div key={count.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-amber-400 text-sm">{count.countNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {count.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{count.countDate} • Verified by {count.verifiedBy}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-3 py-2">Item Code</th>
                        <th className="px-3 py-2">Item Name</th>
                        <th className="px-3 py-2 text-right">System Qty</th>
                        <th className="px-3 py-2 text-right">Counted Qty</th>
                        <th className="px-3 py-2 text-right">Variance Qty</th>
                        <th className="px-3 py-2 text-right">Variance Value</th>
                        <th className="px-3 py-2">Audit Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {count.items.map(it => (
                        <tr key={it.itemId}>
                          <td className="px-3 py-2 font-mono text-slate-400">{it.itemCode}</td>
                          <td className="px-3 py-2 font-bold text-white">{it.itemName}</td>
                          <td className="px-3 py-2 text-right font-mono">{it.systemQuantity} {it.uom}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-white">{it.countedQuantity} {it.uom}</td>
                          <td className={`px-3 py-2 text-right font-mono font-bold ${
                            it.varianceQuantity < 0 ? 'text-rose-400' : it.varianceQuantity > 0 ? 'text-emerald-400' : 'text-slate-400'
                          }`}>
                            {it.varianceQuantity > 0 ? `+${it.varianceQuantity}` : it.varianceQuantity} {it.uom}
                          </td>
                          <td className={`px-3 py-2 text-right font-mono font-bold ${
                            it.varianceValue < 0 ? 'text-rose-400' : it.varianceValue > 0 ? 'text-emerald-400' : 'text-slate-400'
                          }`}>
                            ৳{it.varianceValue.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-slate-400">{it.notes || 'Normal variance'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">
                    Adjustment Journal Voucher: <span className="font-mono font-bold text-amber-400">{count.adjustmentJournalVoucher}</span>
                  </span>
                  <span className="font-mono font-bold text-sm text-slate-200">
                    Net Audit Variance: <span className={count.netVarianceValue < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      ৳{count.netVarianceValue.toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD NEW ITEM
      ======================================================== */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Register New Inventory Item / Product
              </h3>
              <button onClick={() => setIsAddItemModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="text-slate-300 font-bold block mb-1">Item / Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium Basmati Rice / Tiger Prawns / Fresh Mint"
                    value={newItemForm.name}
                    onChange={e => setNewItemForm({ ...newItemForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">SKU / Item Code</label>
                  <input
                    type="text"
                    placeholder="e.g. ITM-RICE-01"
                    value={newItemForm.itemCode}
                    onChange={e => setNewItemForm({ ...newItemForm, itemCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Category *</label>
                  <select
                    value={newItemForm.categoryId}
                    onChange={e => setNewItemForm({ ...newItemForm, categoryId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Primary Purchase UOM *</label>
                  <select
                    value={newItemForm.primaryUomId}
                    onChange={e => setNewItemForm({ ...newItemForm, primaryUomId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {uoms.map(u => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Consumption Recipe UOM *</label>
                  <select
                    value={newItemForm.consumptionUomId}
                    onChange={e => setNewItemForm({ ...newItemForm, consumptionUomId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {uoms.map(u => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Conversion Ratio (1 Base = ? Consumption)</label>
                  <input
                    type="number"
                    value={newItemForm.conversionFactor}
                    onChange={e => setNewItemForm({ ...newItemForm, conversionFactor: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Default Store Warehouse *</label>
                  <select
                    value={newItemForm.defaultWarehouseId}
                    onChange={e => setNewItemForm({ ...newItemForm, defaultWarehouseId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Opening Stock Quantity</label>
                  <input
                    type="number"
                    value={newItemForm.openingStock}
                    onChange={e => setNewItemForm({ ...newItemForm, openingStock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Estimated Unit Cost (৳)</label>
                  <input
                    type="number"
                    value={newItemForm.averageCost}
                    onChange={e => setNewItemForm({ ...newItemForm, averageCost: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Reorder Level Threshold</label>
                  <input
                    type="number"
                    value={newItemForm.reorderLevel}
                    onChange={e => setNewItemForm({ ...newItemForm, reorderLevel: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Preferred Supplier</label>
                  <select
                    value={newItemForm.preferredSupplierId}
                    onChange={e => setNewItemForm({ ...newItemForm, preferredSupplierId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Save & Register Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: GOODS RECEIVE NOTE (GRN)
      ======================================================== */}
      {isGrnModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                Goods Receive Note (GRN) Inward Processing
              </h3>
              <button onClick={() => setIsGrnModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateGrn} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Supplier / Vendor *</label>
                  <select
                    value={grnForm.supplierId}
                    onChange={e => setGrnForm({ ...grnForm, supplierId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Destination Warehouse *</label>
                  <select
                    value={grnForm.warehouseId}
                    onChange={e => setGrnForm({ ...grnForm, warehouseId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-slate-300 font-bold block mb-1">Select Item to Receive *</label>
                  <select
                    value={grnForm.itemId}
                    onChange={e => {
                      const itm = items.find(i => i.id === e.target.value);
                      setGrnForm({
                        ...grnForm,
                        itemId: e.target.value,
                        unitPrice: itm?.averageCost || 100
                      });
                    }}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">-- Choose Inventory Item --</option>
                    {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.itemCode})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Challan / Invoice Number *</label>
                  <input
                    type="text"
                    required
                    value={grnForm.challanNumber}
                    onChange={e => setGrnForm({ ...grnForm, challanNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Accepted Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={grnForm.receivedQty}
                    onChange={e => setGrnForm({ ...grnForm, receivedQty: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Unit Cost (৳) *</label>
                  <input
                    type="number"
                    required
                    value={grnForm.unitPrice}
                    onChange={e => setGrnForm({ ...grnForm, unitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={grnForm.batchNumber}
                    onChange={e => setGrnForm({ ...grnForm, batchNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={grnForm.expiryDate}
                    onChange={e => setGrnForm({ ...grnForm, expiryDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Received By</label>
                  <input
                    type="text"
                    value={grnForm.receivedBy}
                    onChange={e => setGrnForm({ ...grnForm, receivedBy: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <span className="text-emerald-300 font-semibold">Total Payable Amount:</span>
                <span className="font-mono font-bold text-base text-emerald-400">
                  ৳{((Number(grnForm.receivedQty) || 0) * (Number(grnForm.unitPrice) || 0)).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGrnModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                >
                  Post GRN & Accounting JV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: STOCK TRANSFER
      ======================================================== */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-indigo-400" />
                Inter-Store Stock Transfer
              </h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Source Warehouse (From) *</label>
                <select
                  value={transferForm.sourceWarehouseId}
                  onChange={e => setTransferForm({ ...transferForm, sourceWarehouseId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Destination Warehouse (To) *</label>
                <select
                  value={transferForm.destinationWarehouseId}
                  onChange={e => setTransferForm({ ...transferForm, destinationWarehouseId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {warehouses.filter(w => w.id !== transferForm.sourceWarehouseId).map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Item to Transfer *</label>
                <select
                  value={transferForm.itemId}
                  onChange={e => setTransferForm({ ...transferForm, itemId: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">-- Choose Item --</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.itemCode})</option>)}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferForm.quantity}
                  onChange={e => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Requisition Purpose / Remarks</label>
                <input
                  type="text"
                  value={transferForm.remarks}
                  onChange={e => setTransferForm({ ...transferForm, remarks: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
                >
                  Dispatch & Complete Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: RECORD WASTAGE
      ======================================================== */}
      {isWastageModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                Record Wastage & Spoilage Write-Off
              </h3>
              <button onClick={() => setIsWastageModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateWastage} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Department *</label>
                <select
                  value={wastageForm.department}
                  onChange={e => setWastageForm({ ...wastageForm, department: e.target.value as WastageEntry['department'] })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Kitchen">Kitchen Production</option>
                  <option value="Bar">Bar & Lounge</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Banquet">Banquet & Events</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Store / Warehouse *</label>
                <select
                  value={wastageForm.warehouseId}
                  onChange={e => setWastageForm({ ...wastageForm, warehouseId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Item to Write Off *</label>
                <select
                  value={wastageForm.itemId}
                  onChange={e => setWastageForm({ ...wastageForm, itemId: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">-- Choose Inventory Item --</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.itemCode})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={wastageForm.quantity}
                    onChange={e => setWastageForm({ ...wastageForm, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Reason Code *</label>
                  <select
                    value={wastageForm.reason}
                    onChange={e => setWastageForm({ ...wastageForm, reason: e.target.value as WastageEntry['reason'] })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Spoilage">Perishable Spoilage</option>
                    <option value="Expiry">Expired Date</option>
                    <option value="Breakage">Breakage / Damage</option>
                    <option value="Overcooked">Kitchen Overcooked</option>
                    <option value="Spill">Liquid Spill</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Justification & Notes</label>
                <input
                  type="text"
                  value={wastageForm.remarks}
                  onChange={e => setWastageForm({ ...wastageForm, remarks: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsWastageModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
                >
                  Approve Write-Off & Post JV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: STOCK ADJUSTMENT
      ======================================================== */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                Manual Stock Level Adjustment
              </h3>
              <button onClick={() => setIsAdjustmentModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Warehouse / Store *</label>
                <select
                  value={adjustmentForm.warehouseId}
                  onChange={e => setAdjustmentForm({ ...adjustmentForm, warehouseId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Item to Adjust *</label>
                <select
                  value={adjustmentForm.itemId}
                  onChange={e => setAdjustmentForm({ ...adjustmentForm, itemId: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">-- Choose Item --</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.itemCode})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Adjustment Type *</label>
                  <select
                    value={adjustmentForm.adjustmentType}
                    onChange={e => setAdjustmentForm({ ...adjustmentForm, adjustmentType: e.target.value as 'Increase' | 'Decrease' })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Increase">Stock Increase (+)</option>
                    <option value="Decrease">Stock Decrease (-)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Adjustment Quantity *</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={adjustmentForm.quantity}
                    onChange={e => setAdjustmentForm({ ...adjustmentForm, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Audit Justification Reason *</label>
                <input
                  type="text"
                  required
                  value={adjustmentForm.reason}
                  onChange={e => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Apply Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
