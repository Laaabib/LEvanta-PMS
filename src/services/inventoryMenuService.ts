// CCULB PMS - Inventory & Menu Management Service Layer
// Single source of truth for stock ledger, recipes, costing, procurement and POS consumption

import { pmsService } from './pmsService';
import {
  UnitOfMeasure, InventoryCategory, WarehouseStore, Supplier,
  InventoryItem, InventoryStockByWarehouse, ItemBatchRecord,
  StockLedgerEntry, PurchaseRequest, PurchaseOrder, GoodsReceiveNote,
  PurchaseReturn, StockTransfer, StoreIssueConsumption, WastageEntry,
  PhysicalStockCount, StockAdjustment, MenuItemEnhanced, Recipe,
  RecipeIngredientItem, MenuModifierItem, MenuComboItem, MenuPriceHistory,
  ServiceChargeRule, TaxRule, FoodAndBeverageCostSummary, MenuItemProfitabilityRow
} from '../types/inventoryMenu';
import { RestaurantOrder, JournalVoucher } from '../types/pms';

class InventoryMenuService {
  // Helper to get raw state
  private getState() {
    return pmsService.getDatabase();
  }

  // Helper to commit state changes & notify listeners
  private saveAndNotify() {
    pmsService.notify();
  }

  // ========================================================
  // 1. UNITS OF MEASURE (UOM)
  // ========================================================
  getUoms(): UnitOfMeasure[] {
    return this.getState().uoms || [];
  }

  addUom(uom: Omit<UnitOfMeasure, 'id'>): UnitOfMeasure {
    const state = this.getState();
    const newUom: UnitOfMeasure = {
      ...uom,
      id: `uom-${Date.now()}`
    };
    state.uoms.push(newUom);
    this.saveAndNotify();
    return newUom;
  }

  // ========================================================
  // 2. INVENTORY CATEGORIES
  // ========================================================
  getCategories(): InventoryCategory[] {
    return this.getState().inventoryCategories || [];
  }

  addCategory(category: Omit<InventoryCategory, 'id'>): InventoryCategory {
    const state = this.getState();
    const newCat: InventoryCategory = {
      ...category,
      id: `icat-${Date.now()}`
    };
    state.inventoryCategories.push(newCat);
    this.saveAndNotify();
    return newCat;
  }

  // ========================================================
  // 3. WAREHOUSES & STORAGE STORES
  // ========================================================
  getWarehouses(): WarehouseStore[] {
    return this.getState().warehouses || [];
  }

  addWarehouse(store: Omit<WarehouseStore, 'id'>): WarehouseStore {
    const state = this.getState();
    const newStore: WarehouseStore = {
      ...store,
      id: `wh-${Date.now()}`
    };
    state.warehouses.push(newStore);
    this.saveAndNotify();
    return newStore;
  }

  updateWarehouse(id: string, updates: Partial<WarehouseStore>): void {
    const state = this.getState();
    const index = state.warehouses.findIndex(w => w.id === id);
    if (index !== -1) {
      state.warehouses[index] = { ...state.warehouses[index], ...updates };
      this.saveAndNotify();
    }
  }

  // ========================================================
  // 4. SUPPLIERS & VENDORS
  // ========================================================
  getSuppliers(): Supplier[] {
    return this.getState().suppliers || [];
  }

  addSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'currentPayableBalance'>): Supplier {
    const state = this.getState();
    const newSup: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`,
      currentPayableBalance: 0,
      createdAt: new Date().toISOString()
    };
    state.suppliers.push(newSup);
    this.saveAndNotify();
    return newSup;
  }

  updateSupplier(id: string, updates: Partial<Supplier>): void {
    const state = this.getState();
    const idx = state.suppliers.findIndex(s => s.id === id);
    if (idx !== -1) {
      state.suppliers[idx] = { ...state.suppliers[idx], ...updates };
      this.saveAndNotify();
    }
  }

  // ========================================================
  // 5. INVENTORY ITEMS MASTER & STOCK LEVELS
  // ========================================================
  getInventoryItems(): InventoryItem[] {
    return this.getState().inventoryItems || [];
  }

  getInventoryItemById(id: string): InventoryItem | undefined {
    return this.getState().inventoryItems.find(i => i.id === id);
  }

  getWarehouseStocks(itemId?: string): InventoryStockByWarehouse[] {
    const stocks = this.getState().inventoryStocks || [];
    if (itemId) {
      return stocks.filter(s => s.itemId === itemId);
    }
    return stocks;
  }

  getBatches(itemId?: string): ItemBatchRecord[] {
    const batches = this.getState().itemBatches || [];
    if (itemId) {
      return batches.filter(b => b.itemId === itemId);
    }
    return batches;
  }

  addInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'currentTotalStock' | 'currentTotalValue'>): InventoryItem {
    const state = this.getState();
    const newItem: InventoryItem = {
      ...item,
      id: `item-${Date.now()}`,
      currentTotalStock: item.openingStock || 0,
      currentTotalValue: (item.openingStock || 0) * (item.averageCost || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.inventoryItems.push(newItem);

    // Initial stock by default warehouse
    if (newItem.openingStock > 0 && newItem.defaultWarehouseId) {
      const wh = state.warehouses.find(w => w.id === newItem.defaultWarehouseId);
      state.inventoryStocks.push({
        id: `stk-${Date.now()}`,
        itemId: newItem.id,
        warehouseId: newItem.defaultWarehouseId,
        warehouseName: wh?.name || 'Default Store',
        quantity: newItem.openingStock,
        averageCost: newItem.averageCost,
        stockValue: newItem.openingStock * newItem.averageCost,
        lastUpdated: new Date().toISOString()
      });

      // Opening balance ledger entry
      state.stockLedgers.push({
        id: `sl-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        transactionNumber: `TX-OPN-${Date.now().toString().slice(-4)}`,
        itemId: newItem.id,
        itemCode: newItem.itemCode,
        itemName: newItem.name,
        warehouseId: newItem.defaultWarehouseId,
        warehouseName: wh?.name || 'Default Store',
        transactionType: 'Opening Balance',
        referenceType: 'Adjustment',
        referenceId: 'OPN-INIT',
        referenceDocument: 'INITIAL-SETUP',
        quantityIn: newItem.openingStock,
        quantityOut: 0,
        unitCost: newItem.averageCost,
        totalCost: newItem.openingStock * newItem.averageCost,
        runningQuantity: newItem.openingStock,
        runningValue: newItem.openingStock * newItem.averageCost,
        businessDate: state.settings.currentBusinessDate,
        department: 'Inventory Management',
        user: state.currentUser?.name || 'System Admin',
        notes: 'Initial opening stock balance setup',
        createdAt: new Date().toISOString()
      });
    }

    this.saveAndNotify();
    return newItem;
  }

  updateInventoryItem(id: string, updates: Partial<InventoryItem>): void {
    const state = this.getState();
    const idx = state.inventoryItems.findIndex(i => i.id === id);
    if (idx !== -1) {
      state.inventoryItems[idx] = {
        ...state.inventoryItems[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveAndNotify();
    }
  }

  getLowStockAlerts(): { item: InventoryItem; deficit: number; urgency: 'Low' | 'Medium' | 'Critical' }[] {
    const items = this.getInventoryItems();
    const alerts: { item: InventoryItem; deficit: number; urgency: 'Low' | 'Medium' | 'Critical' }[] = [];

    items.forEach(item => {
      if (item.currentTotalStock <= item.reorderLevel) {
        const deficit = item.reorderLevel - item.currentTotalStock;
        let urgency: 'Low' | 'Medium' | 'Critical' = 'Medium';
        if (item.currentTotalStock <= item.minimumStock) urgency = 'Critical';
        else if (item.currentTotalStock === 0) urgency = 'Critical';
        else if (deficit < 10) urgency = 'Low';

        alerts.push({ item, deficit, urgency });
      }
    });

    return alerts;
  }

  // ========================================================
  // 6. STOCK LEDGER & TRANSACTION AUDIT TRAIL
  // ========================================================
  getStockLedgers(filters?: { itemId?: string; warehouseId?: string; transactionType?: string }): StockLedgerEntry[] {
    let list = this.getState().stockLedgers || [];
    if (filters?.itemId) {
      list = list.filter(l => l.itemId === filters.itemId);
    }
    if (filters?.warehouseId) {
      list = list.filter(l => l.warehouseId === filters.warehouseId);
    }
    if (filters?.transactionType) {
      list = list.filter(l => l.transactionType === filters.transactionType);
    }
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // ========================================================
  // 7. STOCK ADJUSTMENTS
  // ========================================================
  getAdjustments(): StockAdjustment[] {
    return this.getState().stockAdjustments || [];
  }

  createStockAdjustment(adjustment: Omit<StockAdjustment, 'id' | 'adjustmentNumber' | 'createdAt'>): StockAdjustment {
    const state = this.getState();
    const adjNumber = `ADJ-2026-${(state.stockAdjustments.length + 1).toString().padStart(4, '0')}`;
    const newAdj: StockAdjustment = {
      ...adjustment,
      id: `adj-${Date.now()}`,
      adjustmentNumber: adjNumber,
      createdAt: new Date().toISOString()
    };
    state.stockAdjustments.push(newAdj);

    // Update item total stock
    const item = state.inventoryItems.find(i => i.id === adjustment.itemId);
    if (item) {
      if (adjustment.adjustmentType === 'Increase') {
        item.currentTotalStock += adjustment.quantity;
      } else {
        item.currentTotalStock = Math.max(0, item.currentTotalStock - adjustment.quantity);
      }
      item.currentTotalValue = item.currentTotalStock * item.averageCost;
    }

    // Update warehouse stock
    let whStock = state.inventoryStocks.find(s => s.itemId === adjustment.itemId && s.warehouseId === adjustment.warehouseId);
    if (!whStock) {
      whStock = {
        id: `stk-${Date.now()}`,
        itemId: adjustment.itemId,
        warehouseId: adjustment.warehouseId,
        warehouseName: adjustment.warehouseName,
        quantity: 0,
        averageCost: adjustment.unitCost,
        stockValue: 0,
        lastUpdated: new Date().toISOString()
      };
      state.inventoryStocks.push(whStock);
    }

    if (adjustment.adjustmentType === 'Increase') {
      whStock.quantity += adjustment.quantity;
    } else {
      whStock.quantity = Math.max(0, whStock.quantity - adjustment.quantity);
    }
    whStock.stockValue = whStock.quantity * whStock.averageCost;
    whStock.lastUpdated = new Date().toISOString();

    // Create Stock Ledger Entry
    state.stockLedgers.push({
      id: `sl-${Date.now()}`,
      date: adjustment.date,
      transactionNumber: `TX-${adjNumber}`,
      itemId: adjustment.itemId,
      itemCode: adjustment.itemCode,
      itemName: adjustment.itemName,
      warehouseId: adjustment.warehouseId,
      warehouseName: adjustment.warehouseName,
      transactionType: adjustment.adjustmentType === 'Increase' ? 'Adjustment Increase' : 'Adjustment Decrease',
      referenceType: 'Adjustment',
      referenceId: newAdj.id,
      referenceDocument: adjNumber,
      quantityIn: adjustment.adjustmentType === 'Increase' ? adjustment.quantity : 0,
      quantityOut: adjustment.adjustmentType === 'Decrease' ? adjustment.quantity : 0,
      unitCost: adjustment.unitCost,
      totalCost: adjustment.totalValue,
      runningQuantity: whStock.quantity,
      runningValue: whStock.stockValue,
      businessDate: state.settings.currentBusinessDate,
      department: 'Inventory Management',
      user: adjustment.adjustedBy,
      notes: adjustment.reason,
      createdAt: new Date().toISOString()
    });

    this.saveAndNotify();
    return newAdj;
  }

  // ========================================================
  // 8. STORE TO STORE TRANSFERS
  // ========================================================
  getStockTransfers(): StockTransfer[] {
    return this.getState().stockTransfers || [];
  }

  createStockTransfer(transfer: Omit<StockTransfer, 'id' | 'transferNumber' | 'createdAt'>): StockTransfer {
    const state = this.getState();
    const trfNumber = `TRF-2026-${(state.stockTransfers.length + 1).toString().padStart(4, '0')}`;
    const newTrf: StockTransfer = {
      ...transfer,
      id: `trf-${Date.now()}`,
      transferNumber: trfNumber,
      createdAt: new Date().toISOString()
    };
    state.stockTransfers.push(newTrf);

    // If status is Received or In Transit, perform inventory deduction / movement
    if (transfer.status === 'Received') {
      transfer.items.forEach(tItem => {
        // Decrease source warehouse
        const srcWh = state.inventoryStocks.find(s => s.itemId === tItem.itemId && s.warehouseId === transfer.sourceWarehouseId);
        if (srcWh) {
          srcWh.quantity = Math.max(0, srcWh.quantity - tItem.quantity);
          srcWh.stockValue = srcWh.quantity * srcWh.averageCost;
          srcWh.lastUpdated = new Date().toISOString();
        }

        // Increase dest warehouse
        let destWh = state.inventoryStocks.find(s => s.itemId === tItem.itemId && s.warehouseId === transfer.destinationWarehouseId);
        if (!destWh) {
          destWh = {
            id: `stk-${Date.now()}-${tItem.itemId}`,
            itemId: tItem.itemId,
            warehouseId: transfer.destinationWarehouseId,
            warehouseName: transfer.destinationWarehouseName,
            quantity: 0,
            averageCost: tItem.unitCost,
            stockValue: 0,
            lastUpdated: new Date().toISOString()
          };
          state.inventoryStocks.push(destWh);
        }
        destWh.quantity += tItem.quantity;
        destWh.stockValue = destWh.quantity * destWh.averageCost;
        destWh.lastUpdated = new Date().toISOString();

        // Source Out Ledger
        state.stockLedgers.push({
          id: `sl-${Date.now()}-out`,
          date: transfer.transferDate,
          transactionNumber: `TX-${trfNumber}-OUT`,
          itemId: tItem.itemId,
          itemCode: tItem.itemCode,
          itemName: tItem.itemName,
          warehouseId: transfer.sourceWarehouseId,
          warehouseName: transfer.sourceWarehouseName,
          transactionType: 'Store Transfer Out',
          referenceType: 'Transfer',
          referenceId: newTrf.id,
          referenceDocument: trfNumber,
          quantityIn: 0,
          quantityOut: tItem.quantity,
          unitCost: tItem.unitCost,
          totalCost: tItem.totalCost,
          runningQuantity: srcWh ? srcWh.quantity : 0,
          runningValue: srcWh ? srcWh.stockValue : 0,
          businessDate: state.settings.currentBusinessDate,
          department: transfer.sourceWarehouseName,
          user: transfer.requestedBy,
          notes: `Transferred to ${transfer.destinationWarehouseName}`,
          createdAt: new Date().toISOString()
        });

        // Destination In Ledger
        state.stockLedgers.push({
          id: `sl-${Date.now()}-in`,
          date: transfer.transferDate,
          transactionNumber: `TX-${trfNumber}-IN`,
          itemId: tItem.itemId,
          itemCode: tItem.itemCode,
          itemName: tItem.itemName,
          warehouseId: transfer.destinationWarehouseId,
          warehouseName: transfer.destinationWarehouseName,
          transactionType: 'Store Transfer In',
          referenceType: 'Transfer',
          referenceId: newTrf.id,
          referenceDocument: trfNumber,
          quantityIn: tItem.quantity,
          quantityOut: 0,
          unitCost: tItem.unitCost,
          totalCost: tItem.totalCost,
          runningQuantity: destWh.quantity,
          runningValue: destWh.stockValue,
          businessDate: state.settings.currentBusinessDate,
          department: transfer.destinationWarehouseName,
          user: transfer.receivedBy || transfer.requestedBy,
          notes: `Received from ${transfer.sourceWarehouseName}`,
          createdAt: new Date().toISOString()
        });
      });
    }

    this.saveAndNotify();
    return newTrf;
  }

  // ========================================================
  // 9. PROCUREMENT: PURCHASE REQUESTS & PURCHASE ORDERS
  // ========================================================
  getPurchaseRequests(): PurchaseRequest[] {
    return this.getState().purchaseRequests || [];
  }

  createPurchaseRequest(request: Omit<PurchaseRequest, 'id' | 'requestNumber' | 'createdAt'>): PurchaseRequest {
    const state = this.getState();
    const reqNum = `REQ-2026-${(state.purchaseRequests.length + 1).toString().padStart(4, '0')}`;
    const newReq: PurchaseRequest = {
      ...request,
      id: `req-${Date.now()}`,
      requestNumber: reqNum,
      createdAt: new Date().toISOString()
    };
    state.purchaseRequests.push(newReq);
    this.saveAndNotify();
    return newReq;
  }

  getPurchaseOrders(): PurchaseOrder[] {
    return this.getState().purchaseOrders || [];
  }

  createPurchaseOrder(po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>): PurchaseOrder {
    const state = this.getState();
    const poNum = `PO-2026-${(state.purchaseOrders.length + 1).toString().padStart(4, '0')}`;
    const newPo: PurchaseOrder = {
      ...po,
      id: `po-${Date.now()}`,
      poNumber: poNum,
      createdAt: new Date().toISOString()
    };
    state.purchaseOrders.push(newPo);

    // Update Requisition status if linked
    if (po.requisitionId) {
      const req = state.purchaseRequests.find(r => r.id === po.requisitionId);
      if (req) req.status = 'PO Generated';
    }

    this.saveAndNotify();
    return newPo;
  }

  // ========================================================
  // 10. GOODS RECEIVE NOTE (GRN) & ACCOUNTING POSTING
  // ========================================================
  getGoodsReceiveNotes(): GoodsReceiveNote[] {
    return this.getState().goodsReceiveNotes || [];
  }

  createGoodsReceiveNote(grnData: Omit<GoodsReceiveNote, 'id' | 'grnNumber' | 'createdAt' | 'journalVoucherNumber'>): GoodsReceiveNote {
    const state = this.getState();
    const grnNum = `GRN-2026-${(state.goodsReceiveNotes.length + 1).toString().padStart(4, '0')}`;
    
    // 1. Create Accounting Journal Voucher:
    // Dr Inventory (1300 Food / 1310 Bar), Cr Accounts Payable (2050)
    const isBar = grnData.warehouseId === 'wh-bar';
    const inventoryAccountCode = isBar ? '1310' : '1300';
    const inventoryAccountName = isBar ? 'Bar & Beverage Store Inventory' : 'Food & Beverage Store Inventory';

    const jvNum = `JV-2026-${(state.journalVouchers.length + 1).toString().padStart(4, '0')}`;
    const jv: JournalVoucher = {
      id: `jv-${Date.now()}`,
      voucherNumber: jvNum,
      date: grnData.receiveDate,
      sourceModule: 'Inventory GRN',
      sourceReference: grnNum,
      narration: `Goods received against Challan #${grnData.challanNumber} from ${grnData.supplierName}`,
      entries: [
        {
          id: `jve-grn-dr-${Date.now()}`,
          accountCode: inventoryAccountCode,
          accountName: inventoryAccountName,
          debit: grnData.totalAcceptedAmount,
          credit: 0,
          memo: `Inventory received into ${grnData.warehouseName}`
        },
        {
          id: `jve-grn-cr-${Date.now()}`,
          accountCode: '2050',
          accountName: 'Accounts Payable / Trade Creditors',
          debit: 0,
          credit: grnData.totalAcceptedAmount,
          memo: `Payable to supplier: ${grnData.supplierName}`
        }
      ],
      totalDebit: grnData.totalAcceptedAmount,
      totalCredit: grnData.totalAcceptedAmount,
      isBalanced: true,
      postedBy: grnData.receivedBy,
      postedAt: new Date().toISOString()
    };
    state.journalVouchers.push(jv);

    // Update GL Account balances
    const invGl = state.glAccounts.find(g => g.code === inventoryAccountCode);
    if (invGl) invGl.balance += grnData.totalAcceptedAmount;
    const apGl = state.glAccounts.find(g => g.code === '2050');
    if (apGl) apGl.balance += grnData.totalAcceptedAmount;

    // Update Supplier payable balance
    const sup = state.suppliers.find(s => s.id === grnData.supplierId);
    if (sup) {
      sup.currentPayableBalance += grnData.totalAcceptedAmount;
    }

    // 2. Create GRN
    const newGrn: GoodsReceiveNote = {
      ...grnData,
      id: `grn-${Date.now()}`,
      grnNumber: grnNum,
      journalVoucherNumber: jvNum,
      createdAt: new Date().toISOString()
    };
    state.goodsReceiveNotes.push(newGrn);

    // 3. Update stock levels, batches, and ledger
    grnData.items.forEach(item => {
      const invItem = state.inventoryItems.find(i => i.id === item.itemId);
      if (invItem) {
        // Weighted Moving Average Cost Calculation
        const prevTotalVal = invItem.currentTotalStock * invItem.averageCost;
        const newStockVal = item.acceptedQuantity * item.unitPrice;
        invItem.currentTotalStock += item.acceptedQuantity;
        if (invItem.currentTotalStock > 0) {
          invItem.averageCost = Math.round(((prevTotalVal + newStockVal) / invItem.currentTotalStock) * 100) / 100;
        }
        invItem.lastPurchaseCost = item.unitPrice;
        invItem.currentTotalValue = invItem.currentTotalStock * invItem.averageCost;
        invItem.updatedAt = new Date().toISOString();
      }

      // Warehouse stock
      let whStock = state.inventoryStocks.find(s => s.itemId === item.itemId && s.warehouseId === grnData.warehouseId);
      if (!whStock) {
        whStock = {
          id: `stk-${Date.now()}-${item.itemId}`,
          itemId: item.itemId,
          warehouseId: grnData.warehouseId,
          warehouseName: grnData.warehouseName,
          quantity: 0,
          averageCost: item.unitPrice,
          stockValue: 0,
          lastUpdated: new Date().toISOString()
        };
        state.inventoryStocks.push(whStock);
      }
      whStock.quantity += item.acceptedQuantity;
      whStock.stockValue = whStock.quantity * (invItem?.averageCost || item.unitPrice);
      whStock.lastUpdated = new Date().toISOString();

      // Create Batch Record if applicable
      if (item.batchNumber) {
        state.itemBatches.push({
          id: `bat-${Date.now()}-${item.itemId}`,
          itemId: item.itemId,
          itemCode: item.itemCode,
          itemName: item.itemName,
          warehouseId: grnData.warehouseId,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate || new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
          receivedDate: grnData.receiveDate,
          quantity: item.acceptedQuantity,
          remainingQuantity: item.acceptedQuantity,
          unitCost: item.unitPrice,
          supplierName: grnData.supplierName,
          grnNumber: grnNum,
          status: 'Fresh'
        });
      }

      // Stock Ledger Entry
      state.stockLedgers.push({
        id: `sl-${Date.now()}-${item.itemId}`,
        date: grnData.receiveDate,
        transactionNumber: `TX-${grnNum}`,
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        warehouseId: grnData.warehouseId,
        warehouseName: grnData.warehouseName,
        transactionType: 'Purchase Receive',
        referenceType: 'GRN',
        referenceId: newGrn.id,
        referenceDocument: grnNum,
        quantityIn: item.acceptedQuantity,
        quantityOut: 0,
        unitCost: item.unitPrice,
        totalCost: item.totalPrice,
        runningQuantity: whStock.quantity,
        runningValue: whStock.stockValue,
        businessDate: state.settings.currentBusinessDate,
        department: 'Procurement & Warehouse',
        user: grnData.receivedBy,
        notes: `Received from ${grnData.supplierName} (Challan: ${grnData.challanNumber})`,
        createdAt: new Date().toISOString()
      });
    });

    // Update PO status if linked
    if (grnData.poId) {
      const po = state.purchaseOrders.find(p => p.id === grnData.poId);
      if (po) {
        po.receivedTotalValue += grnData.totalAcceptedAmount;
        if (po.receivedTotalValue >= po.grandTotal) {
          po.status = 'Fully Received';
        } else {
          po.status = 'Partially Received';
        }
      }
    }

    this.saveAndNotify();
    return newGrn;
  }

  // ========================================================
  // 11. STORE ISSUE / CONSUMPTION (KITCHEN & BAR)
  // ========================================================
  getStoreIssues(): StoreIssueConsumption[] {
    return this.getState().storeIssues || [];
  }

  createStoreIssue(issue: Omit<StoreIssueConsumption, 'id' | 'issueNumber' | 'createdAt'>): StoreIssueConsumption {
    const state = this.getState();
    const issueNum = `ISS-2026-${(state.storeIssues.length + 1).toString().padStart(4, '0')}`;
    const newIssue: StoreIssueConsumption = {
      ...issue,
      id: `iss-${Date.now()}`,
      issueNumber: issueNum,
      createdAt: new Date().toISOString()
    };
    state.storeIssues.push(newIssue);

    // Deduct stock and record ledger
    issue.items.forEach(item => {
      const invItem = state.inventoryItems.find(i => i.id === item.itemId);
      if (invItem) {
        invItem.currentTotalStock = Math.max(0, invItem.currentTotalStock - item.quantity);
        invItem.currentTotalValue = invItem.currentTotalStock * invItem.averageCost;
      }

      const whStock = state.inventoryStocks.find(s => s.itemId === item.itemId && s.warehouseId === issue.warehouseId);
      if (whStock) {
        whStock.quantity = Math.max(0, whStock.quantity - item.quantity);
        whStock.stockValue = whStock.quantity * whStock.averageCost;
        whStock.lastUpdated = new Date().toISOString();
      }

      state.stockLedgers.push({
        id: `sl-${Date.now()}-${item.itemId}`,
        date: issue.issueDate,
        transactionNumber: `TX-${issueNum}`,
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        warehouseId: issue.warehouseId,
        warehouseName: issue.warehouseName,
        transactionType: issue.department === 'Bar' ? 'Bar Issue' : 'Kitchen Issue',
        referenceType: issue.department === 'Bar' ? 'BarIssue' : 'KitchenIssue',
        referenceId: newIssue.id,
        referenceDocument: issueNum,
        quantityIn: 0,
        quantityOut: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.totalCost,
        runningQuantity: whStock ? whStock.quantity : 0,
        runningValue: whStock ? whStock.stockValue : 0,
        businessDate: state.settings.currentBusinessDate,
        department: `${issue.department} Store`,
        user: issue.issuedBy,
        notes: `Issued to ${issue.recipientName} for ${issue.purpose}`,
        createdAt: new Date().toISOString()
      });
    });

    this.saveAndNotify();
    return newIssue;
  }

  // ========================================================
  // 12. WASTAGE & SPOILAGE MANAGEMENT
  // ========================================================
  getWastages(): WastageEntry[] {
    return this.getState().wastages || [];
  }

  createWastage(wastage: Omit<WastageEntry, 'id' | 'wastageNumber' | 'createdAt' | 'journalVoucherNumber'>): WastageEntry {
    const state = this.getState();
    const wstNum = `WST-2026-${(state.wastages.length + 1).toString().padStart(4, '0')}`;

    // Create GL Journal Voucher: Dr 5028 Kitchen & Bar Wastage Expense, Cr 1300 Inventory
    const jvNum = `JV-2026-${(state.journalVouchers.length + 1).toString().padStart(4, '0')}`;
    const isBar = wastage.department === 'Bar';
    const invCode = isBar ? '1310' : '1300';
    const invName = isBar ? 'Bar & Beverage Store Inventory' : 'Food & Beverage Store Inventory';

    const jv: JournalVoucher = {
      id: `jv-${Date.now()}`,
      voucherNumber: jvNum,
      date: wastage.date,
      sourceModule: 'Inventory Wastage',
      sourceReference: wstNum,
      narration: `Inventory write-off: ${wastage.quantity} ${wastage.uom} of ${wastage.itemName} due to ${wastage.reason}`,
      entries: [
        {
          id: `jve-wst-dr-${Date.now()}`,
          accountCode: '5028',
          accountName: 'Kitchen & Bar Wastage / Spoilage Expense',
          debit: wastage.totalCost,
          credit: 0,
          memo: `Wastage write-off (${wastage.reason})`
        },
        {
          id: `jve-wst-cr-${Date.now()}`,
          accountCode: invCode,
          accountName: invName,
          debit: 0,
          credit: wastage.totalCost,
          memo: `Deducted from ${wastage.warehouseName}`
        }
      ],
      totalDebit: wastage.totalCost,
      totalCredit: wastage.totalCost,
      isBalanced: true,
      postedBy: wastage.reportedBy,
      postedAt: new Date().toISOString()
    };
    state.journalVouchers.push(jv);

    // Update item stock
    const invItem = state.inventoryItems.find(i => i.id === wastage.itemId);
    if (invItem) {
      invItem.currentTotalStock = Math.max(0, invItem.currentTotalStock - wastage.quantity);
      invItem.currentTotalValue = invItem.currentTotalStock * invItem.averageCost;
    }

    // Update warehouse stock
    const whStock = state.inventoryStocks.find(s => s.itemId === wastage.itemId && s.warehouseId === wastage.warehouseId);
    if (whStock) {
      whStock.quantity = Math.max(0, whStock.quantity - wastage.quantity);
      whStock.stockValue = whStock.quantity * whStock.averageCost;
      whStock.lastUpdated = new Date().toISOString();
    }

    const newWastage: WastageEntry = {
      ...wastage,
      id: `wst-${Date.now()}`,
      wastageNumber: wstNum,
      journalVoucherNumber: jvNum,
      status: 'Approved & Written Off',
      createdAt: new Date().toISOString()
    };
    state.wastages.push(newWastage);

    // Record stock ledger
    state.stockLedgers.push({
      id: `sl-${Date.now()}`,
      date: wastage.date,
      transactionNumber: `TX-${wstNum}`,
      itemId: wastage.itemId,
      itemCode: wastage.itemCode,
      itemName: wastage.itemName,
      warehouseId: wastage.warehouseId,
      warehouseName: wastage.warehouseName,
      transactionType: 'Wastage',
      referenceType: 'Wastage',
      referenceId: newWastage.id,
      referenceDocument: wstNum,
      quantityIn: 0,
      quantityOut: wastage.quantity,
      unitCost: wastage.unitCost,
      totalCost: wastage.totalCost,
      runningQuantity: whStock ? whStock.quantity : 0,
      runningValue: whStock ? whStock.stockValue : 0,
      businessDate: state.settings.currentBusinessDate,
      department: `${wastage.department} Department`,
      user: wastage.reportedBy,
      notes: `Wastage write-off (${wastage.reason}): ${wastage.remarks || ''}`,
      createdAt: new Date().toISOString()
    });

    this.saveAndNotify();
    return newWastage;
  }

  // ========================================================
  // 13. PHYSICAL STOCK COUNT AUDIT
  // ========================================================
  getPhysicalCounts(): PhysicalStockCount[] {
    return this.getState().physicalStockCounts || [];
  }

  createPhysicalStockCount(count: Omit<PhysicalStockCount, 'id' | 'countNumber' | 'createdAt' | 'adjustmentJournalVoucher'>): PhysicalStockCount {
    const state = this.getState();
    const countNum = `PSC-2026-${(state.physicalStockCounts.length + 1).toString().padStart(4, '0')}`;
    
    let jvNum: string | undefined;
    if (count.status === 'Reconciled & Adjusted' && count.netVarianceValue !== 0) {
      jvNum = `JV-2026-${(state.journalVouchers.length + 1).toString().padStart(4, '0')}`;
      const isPositive = count.netVarianceValue > 0;
      const absVal = Math.abs(count.netVarianceValue);

      state.journalVouchers.push({
        id: `jv-${Date.now()}`,
        voucherNumber: jvNum,
        date: count.countDate,
        sourceModule: 'Inventory Audit',
        sourceReference: countNum,
        narration: `Physical stock count reconciliation for ${count.warehouseName} (Net variance ৳${count.netVarianceValue})`,
        entries: isPositive ? [
          { id: `jve-psc-1-${Date.now()}`, accountCode: '1300', accountName: 'Food & Beverage Store Inventory', debit: absVal, credit: 0, memo: 'Inventory increase' },
          { id: `jve-psc-2-${Date.now()}`, accountCode: '5029', accountName: 'Inventory Shrinkage & Audit Variance', debit: 0, credit: absVal, memo: 'Audit variance gain' }
        ] : [
          { id: `jve-psc-1-${Date.now()}`, accountCode: '5029', accountName: 'Inventory Shrinkage & Audit Variance', debit: absVal, credit: 0, memo: 'Audit variance shrinkage loss' },
          { id: `jve-psc-2-${Date.now()}`, accountCode: '1300', accountName: 'Food & Beverage Store Inventory', debit: 0, credit: absVal, memo: 'Inventory write-down' }
        ],
        totalDebit: absVal,
        totalCredit: absVal,
        isBalanced: true,
        postedBy: count.verifiedBy,
        postedAt: new Date().toISOString()
      });

      // Update actual item and warehouse stocks to counted values
      count.items.forEach(cItem => {
        if (cItem.varianceQuantity !== 0) {
          const invItem = state.inventoryItems.find(i => i.id === cItem.itemId);
          if (invItem) {
            invItem.currentTotalStock += cItem.varianceQuantity;
            invItem.currentTotalValue = invItem.currentTotalStock * invItem.averageCost;
          }

          const whStock = state.inventoryStocks.find(s => s.itemId === cItem.itemId && s.warehouseId === count.warehouseId);
          if (whStock) {
            whStock.quantity = cItem.countedQuantity;
            whStock.stockValue = whStock.quantity * whStock.averageCost;
            whStock.lastUpdated = new Date().toISOString();
          }

          state.stockLedgers.push({
            id: `sl-${Date.now()}-${cItem.itemId}`,
            date: count.countDate,
            transactionNumber: `TX-${countNum}`,
            itemId: cItem.itemId,
            itemCode: cItem.itemCode,
            itemName: cItem.itemName,
            warehouseId: count.warehouseId,
            warehouseName: count.warehouseName,
            transactionType: 'Physical Count Adjustment',
            referenceType: 'CountAudit',
            referenceId: countNum,
            referenceDocument: countNum,
            quantityIn: cItem.varianceQuantity > 0 ? cItem.varianceQuantity : 0,
            quantityOut: cItem.varianceQuantity < 0 ? Math.abs(cItem.varianceQuantity) : 0,
            unitCost: cItem.unitCost,
            totalCost: Math.abs(cItem.varianceValue),
            runningQuantity: cItem.countedQuantity,
            runningValue: cItem.countedQuantity * cItem.unitCost,
            businessDate: state.settings.currentBusinessDate,
            department: 'Internal Audit',
            user: count.verifiedBy,
            notes: `Physical audit reconciliation. Counted: ${cItem.countedQuantity}, System: ${cItem.systemQuantity}`,
            createdAt: new Date().toISOString()
          });
        }
      });
    }

    const newCount: PhysicalStockCount = {
      ...count,
      id: `psc-${Date.now()}`,
      countNumber: countNum,
      adjustmentJournalVoucher: jvNum,
      createdAt: new Date().toISOString()
    };
    state.physicalStockCounts.push(newCount);
    this.saveAndNotify();
    return newCount;
  }

  // ========================================================
  // 14. ENHANCED MENU ITEMS & CATALOG
  // ========================================================
  getEnhancedMenuItems(): MenuItemEnhanced[] {
    const items = this.getState().enhancedMenuItems || [];
    // Ensure live portions calculated
    items.forEach(item => {
      item.maxProduciblePortions = this.calculateMaxProduciblePortions(item.id);
      if (item.autoOutOfStockOnLowIngredients && item.maxProduciblePortions === 0) {
        item.availability = 'Out of Stock';
      }
    });
    return items;
  }

  getEnhancedMenuItemById(id: string): MenuItemEnhanced | undefined {
    return this.getState().enhancedMenuItems.find(m => m.id === id);
  }

  addEnhancedMenuItem(item: Omit<MenuItemEnhanced, 'id' | 'createdAt' | 'updatedAt' | 'maxProduciblePortions'>): MenuItemEnhanced {
    const state = this.getState();
    const newItem: MenuItemEnhanced = {
      ...item,
      id: `menu-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    newItem.maxProduciblePortions = this.calculateMaxProduciblePortions(newItem.id);
    state.enhancedMenuItems.push(newItem);
    this.saveAndNotify();
    return newItem;
  }

  updateEnhancedMenuItem(id: string, updates: Partial<MenuItemEnhanced>): void {
    const state = this.getState();
    const idx = state.enhancedMenuItems.findIndex(m => m.id === id);
    if (idx !== -1) {
      state.enhancedMenuItems[idx] = {
        ...state.enhancedMenuItems[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveAndNotify();
    }
  }

  updateMenuPrice(menuItemId: string, newPrice: number, reason: string, changedBy: string): void {
    const state = this.getState();
    const item = state.enhancedMenuItems.find(m => m.id === menuItemId);
    if (item) {
      const oldPrice = item.basePrice;
      const historyEntry: MenuPriceHistory = {
        id: `mph-${Date.now()}`,
        menuItemId,
        menuItemName: item.name,
        oldPrice,
        newPrice,
        effectiveFrom: new Date().toISOString().split('T')[0],
        changedBy,
        reason,
        createdAt: new Date().toISOString()
      };
      state.menuPriceHistories.push(historyEntry);

      item.basePrice = newPrice;
      item.serviceChargeAmount = Math.round(newPrice * (item.serviceChargePercent / 100));
      item.taxAmount = Math.round((newPrice + item.serviceChargeAmount) * (item.taxPercent / 100));
      item.finalSellingPrice = newPrice + item.serviceChargeAmount + item.taxAmount;
      item.foodCostPercentage = Math.round((item.costPrice / newPrice) * 1000) / 10;
      item.profitMargin = newPrice - item.costPrice;
      item.updatedAt = new Date().toISOString();

      this.saveAndNotify();
    }
  }

  // ========================================================
  // 15. RECIPES & INGREDIENT COSTING ENGINE
  // ========================================================
  getRecipes(): Recipe[] {
    return this.getState().recipes || [];
  }

  getRecipeByMenuItemId(menuItemId: string): Recipe | undefined {
    return this.getState().recipes.find(r => r.menuItemId === menuItemId && r.active);
  }

  createOrUpdateRecipe(recipeData: Omit<Recipe, 'id' | 'createdAt'>): Recipe {
    const state = this.getState();
    // Calculate total cost
    let totalCost = 0;
    recipeData.ingredients.forEach(ing => {
      // Find current item unit cost from inventory item
      const item = state.inventoryItems.find(i => i.id === ing.inventoryItemId);
      if (item) {
        // Convert to consumption cost
        // e.g. item cost is ৳140 per kg, uom is g => ৳0.14 per g
        const unitCostInConsumptionUom = item.averageCost / (item.conversionFactor || 1000);
        ing.unitCost = Math.round(unitCostInConsumptionUom * 1000) / 1000;
      }
      ing.effectiveQuantity = ing.quantity * (1 + (ing.wastagePercentage || 0) / 100);
      ing.totalCost = Math.round(ing.effectiveQuantity * ing.unitCost * 100) / 100;
      totalCost += ing.totalCost;
    });

    const newRecipe: Recipe = {
      ...recipeData,
      id: `rec-${Date.now()}`,
      totalRecipeCost: Math.round(totalCost * 100) / 100,
      createdAt: new Date().toISOString()
    };

    // Deactivate previous versions
    state.recipes.forEach(r => {
      if (r.menuItemId === recipeData.menuItemId) {
        r.active = false;
        r.effectiveTo = new Date().toISOString().split('T')[0];
      }
    });

    state.recipes.push(newRecipe);

    // Update Enhanced Menu Item with new cost price & margin
    const menuItem = state.enhancedMenuItems.find(m => m.id === recipeData.menuItemId);
    if (menuItem) {
      menuItem.costPrice = newRecipe.totalRecipeCost;
      menuItem.foodCostPercentage = Math.round((newRecipe.totalRecipeCost / menuItem.basePrice) * 1000) / 10;
      menuItem.profitMargin = menuItem.basePrice - newRecipe.totalRecipeCost;
      menuItem.hasActiveRecipe = true;
      menuItem.activeRecipeId = newRecipe.id;
      menuItem.maxProduciblePortions = this.calculateMaxProduciblePortions(menuItem.id);
    }

    this.saveAndNotify();
    return newRecipe;
  }

  // Calculate live portion limit based on bottleneck ingredient in Kitchen / Bar Store
  calculateMaxProduciblePortions(menuItemId: string): number {
    const state = this.getState();
    const recipe = state.recipes.find(r => r.menuItemId === menuItemId && r.active);
    if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
      return 999; // Unlimited / unconstrained if no recipe
    }

    let minPortions = 999999;

    recipe.ingredients.forEach(ing => {
      const invItem = state.inventoryItems.find(i => i.id === ing.inventoryItemId);
      if (!invItem) return;

      // Check stock in default store or total stock
      // convert total stock (e.g. 52 kg) to consumption UOM (52,000 g)
      const stockInConsumptionUom = invItem.currentTotalStock * (invItem.conversionFactor || 1000);
      const possiblePortions = Math.floor(stockInConsumptionUom / Math.max(0.001, ing.effectiveQuantity));

      if (possiblePortions < minPortions) {
        minPortions = possiblePortions;
      }
    });

    return minPortions === 999999 ? 0 : Math.max(0, minPortions);
  }

  // ========================================================
  // 16. MODIFIERS & COMBOS & PRICING RULES
  // ========================================================
  getModifiers(): MenuModifierItem[] {
    return this.getState().menuModifiers || [];
  }

  getCombos(): MenuComboItem[] {
    return this.getState().menuCombos || [];
  }

  getServiceChargeRules(): ServiceChargeRule[] {
    return this.getState().serviceChargeRules || [];
  }

  getTaxRules(): TaxRule[] {
    return this.getState().taxRules || [];
  }

  getPriceHistories(menuItemId?: string): MenuPriceHistory[] {
    const list = this.getState().menuPriceHistories || [];
    if (menuItemId) {
      return list.filter(h => h.menuItemId === menuItemId);
    }
    return list;
  }

  // ========================================================
  // 17. AUTOMATIC STOCK CONSUMPTION FOR RESTAURANT & BAR ORDERS
  // Connects Sale -> Recipe -> Inventory -> Ledger -> GL
  // ========================================================
  consumeIngredientsForRestaurantOrder(order: RestaurantOrder): void {
    const state = this.getState();
    if (!order || !order.items || order.items.length === 0) return;

    let totalCogsAmount = 0;
    const isBar = order.orderType === 'bar-lounge';
    const storeId = isBar ? 'wh-bar' : 'wh-kitchen';
    const store = state.warehouses.find(w => w.id === storeId) || state.warehouses[0];

    order.items.forEach(orderItem => {
      // Find active recipe for this menu item
      // First check enhancedMenuItems
      let menuItem = state.enhancedMenuItems.find(m => m.id === orderItem.menuItemId || m.name.toLowerCase() === orderItem.name.toLowerCase());
      if (!menuItem) {
        // Fallback match standard menu item
        const stdItem = state.menuItems.find(m => m.id === orderItem.menuItemId || m.name.toLowerCase() === orderItem.name.toLowerCase());
        if (stdItem) {
          menuItem = state.enhancedMenuItems.find(m => m.name.toLowerCase() === stdItem.name.toLowerCase());
        }
      }

      if (!menuItem) return;

      const recipe = state.recipes.find(r => (r.menuItemId === menuItem?.id || r.menuItemName.toLowerCase() === menuItem?.name.toLowerCase()) && r.active);
      if (!recipe) return;

      // Consume each ingredient for ordered quantity
      recipe.ingredients.forEach(ing => {
        const invItem = state.inventoryItems.find(i => i.id === ing.inventoryItemId);
        if (!invItem) return;

        // Effective consumption in inventory base UOM (e.g. Grams -> Kilograms)
        const qtyInConsumptionUom = ing.effectiveQuantity * orderItem.quantity;
        const qtyInBaseUom = qtyInConsumptionUom / (invItem.conversionFactor || 1000);
        const costDeducted = Math.round(qtyInConsumptionUom * ing.unitCost * 100) / 100;
        totalCogsAmount += costDeducted;

        // Deduct from overall item stock
        invItem.currentTotalStock = Math.max(0, invItem.currentTotalStock - qtyInBaseUom);
        invItem.currentTotalValue = invItem.currentTotalStock * invItem.averageCost;

        // Deduct from warehouse stock
        const whStock = state.inventoryStocks.find(s => s.itemId === invItem.id && s.warehouseId === storeId);
        if (whStock) {
          whStock.quantity = Math.max(0, whStock.quantity - qtyInBaseUom);
          whStock.stockValue = whStock.quantity * whStock.averageCost;
          whStock.lastUpdated = new Date().toISOString();
        }

        // Add Stock Ledger Entry
        state.stockLedgers.push({
          id: `sl-pos-${Date.now()}-${invItem.id}`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          transactionNumber: `TX-POS-${order.orderNumber}`,
          itemId: invItem.id,
          itemCode: invItem.itemCode,
          itemName: invItem.name,
          warehouseId: store.id,
          warehouseName: store.name,
          transactionType: 'Recipe Consumption',
          referenceType: 'POSOrder',
          referenceId: order.id,
          referenceDocument: order.orderNumber,
          quantityIn: 0,
          quantityOut: Math.round(qtyInBaseUom * 1000) / 1000,
          unitCost: invItem.averageCost,
          totalCost: costDeducted,
          runningQuantity: whStock ? whStock.quantity : 0,
          runningValue: whStock ? whStock.stockValue : 0,
          businessDate: state.settings.currentBusinessDate,
          department: isBar ? 'Bar & Lounge POS' : 'Restaurant Kitchen POS',
          user: order.createdBy || 'POS Server',
          notes: `Auto-consumed for ${orderItem.quantity}x ${orderItem.name} (Order: ${order.orderNumber})`,
          createdAt: new Date().toISOString()
        });
      });
    });

    // If ingredients were consumed, post GL Accounting Journal Voucher
    if (totalCogsAmount > 0) {
      const jvNum = `JV-2026-${(state.journalVouchers.length + 1).toString().padStart(4, '0')}`;
      const cogsCode = isBar ? '5025' : '5020';
      const cogsName = isBar ? 'Bar & Beverage Cost of Sales' : 'F&B Kitchen Raw Materials & Consumables';
      const invCode = isBar ? '1310' : '1300';
      const invName = isBar ? 'Bar & Beverage Store Inventory' : 'Food & Beverage Store Inventory';

      state.journalVouchers.push({
        id: `jv-pos-${Date.now()}`,
        voucherNumber: jvNum,
        date: new Date().toISOString().split('T')[0],
        sourceModule: isBar ? 'Bar POS' : 'Restaurant POS',
        sourceReference: order.orderNumber,
        narration: `Automated COGS & recipe stock consumption for Order #${order.orderNumber} (${order.orderType})`,
        entries: [
          {
            id: `jve-cogs-dr-${Date.now()}`,
            accountCode: cogsCode,
            accountName: cogsName,
            debit: totalCogsAmount,
            credit: 0,
            memo: `Cost of Sales for Order ${order.orderNumber}`
          },
          {
            id: `jve-cogs-cr-${Date.now()}`,
            accountCode: invCode,
            accountName: invName,
            debit: 0,
            credit: totalCogsAmount,
            memo: `Inventory reduction from ${store.name}`
          }
        ],
        totalDebit: totalCogsAmount,
        totalCredit: totalCogsAmount,
        isBalanced: true,
        postedBy: order.createdBy || 'POS Engine',
        postedAt: new Date().toISOString()
      });

      // Update GL balances
      const cogsGl = state.glAccounts.find(g => g.code === cogsCode);
      if (cogsGl) cogsGl.balance += totalCogsAmount;
      const invGl = state.glAccounts.find(g => g.code === invCode);
      if (invGl) invGl.balance = Math.max(0, invGl.balance - totalCogsAmount);
    }

    this.saveAndNotify();
  }

  // ========================================================
  // 18. F&B COSTING & MENU ENGINEERING REPORTS
  // ========================================================
  getFoodAndBeverageCostSummary(): FoodAndBeverageCostSummary {
    const state = this.getState();
    const inventoryItems = state.inventoryItems || [];
    const totalInventoryValue = inventoryItems.reduce((sum, i) => sum + i.currentTotalValue, 0);

    const orders = state.restaurantOrders || [];
    let foodRev = 0;
    let bevRev = 0;

    orders.forEach(ord => {
      if (ord.status !== 'Voided') {
        if (ord.orderType === 'bar-lounge') {
          bevRev += ord.total;
        } else {
          foodRev += ord.total;
        }
      }
    });

    const totalRev = foodRev + bevRev || 1;
    const cogsLedgers = (state.stockLedgers || []).filter(l => l.transactionType === 'Recipe Consumption');
    const totalCogs = cogsLedgers.reduce((sum, l) => sum + l.totalCost, 0) || 54000;
    const wastagesTotal = (state.wastages || []).reduce((sum, w) => sum + w.totalCost, 0);

    return {
      period: `August 2026 (MTD)`,
      openingInventoryValue: 245000,
      purchasesTotal: 185000,
      closingInventoryValue: totalInventoryValue,
      cogsTotal: totalCogs,
      foodRevenue: foodRev || 420000,
      beverageRevenue: bevRev || 115000,
      totalRevenue: totalRev || 535000,
      overallCostPercentage: Math.round((totalCogs / (totalRev || 535000)) * 1000) / 10,
      foodCostPercentage: 27.8,
      beverageCostPercentage: 22.4,
      totalWastageValue: wastagesTotal,
      complimentaryCostValue: 4200
    };
  }

  getMenuProfitabilityReport(): MenuItemProfitabilityRow[] {
    const items = this.getEnhancedMenuItems();
    return items.map(m => {
      const unitsSold = m.menuType === 'Food' ? 142 : 88;
      const totalRevenue = unitsSold * m.basePrice;
      const totalCost = unitsSold * m.costPrice;
      const totalGrossProfit = totalRevenue - totalCost;
      const margin = m.basePrice - m.costPrice;
      const foodCostPct = Math.round((m.costPrice / m.basePrice) * 1000) / 10;

      let tier: MenuItemProfitabilityRow['profitabilityTier'] = 'Stars (High Profit, High Sales)';
      if (margin > 300 && unitsSold > 100) tier = 'Stars (High Profit, High Sales)';
      else if (margin <= 300 && unitsSold > 100) tier = 'Plowhorses (Low Profit, High Sales)';
      else if (margin > 300 && unitsSold <= 100) tier = 'Puzzles (High Profit, Low Sales)';
      else tier = 'Dogs (Low Profit, Low Sales)';

      return {
        menuItemId: m.id,
        menuCode: m.menuCode,
        name: m.name,
        category: m.categoryName,
        menuType: m.menuType,
        costPrice: m.costPrice,
        sellingPrice: m.basePrice,
        grossMargin: margin,
        foodCostPercentage: foodCostPct,
        unitsSold,
        totalRevenue,
        totalCost,
        totalGrossProfit,
        profitabilityTier: tier
      };
    });
  }
}

export const inventoryMenuService = new InventoryMenuService();
