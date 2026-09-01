// CCULB PMS - Menu Management & Recipe Engineering Module
// Connects Menu -> Recipe -> Ingredients -> Inventory -> Costing -> Profitability

import React, { useState, useEffect, useMemo } from 'react';
import {
  UtensilsCrossed, ChefHat, BookOpen, Layers, DollarSign,
  TrendingUp, Sparkles, AlertCircle, Plus, Search, Filter,
  CheckCircle2, Clock, Percent, ShieldCheck, Flame, Wine,
  Coffee, RefreshCw, BarChart2, Eye, Edit3, ArrowRight,
  Package, Tag, Award, Zap
} from 'lucide-react';
import { inventoryMenuService } from '../services/inventoryMenuService';
import { pmsService } from '../services/pmsService';
import { PmsDatabaseState } from '../services/mockPmsDatabase';
import {
  MenuItemEnhanced, Recipe, RecipeIngredientItem, MenuModifierItem,
  MenuComboItem, MenuPriceHistory, MenuItemProfitabilityRow
} from '../types/inventoryMenu';

interface MenuManagementViewProps {
  initialTab?: string;
}

export const MenuManagementView: React.FC<MenuManagementViewProps> = ({ initialTab = 'dashboard' }) => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [menuTypeFilter, setMenuTypeFilter] = useState<string>('all');

  // Recipe Builder Modal & States
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedMenuItemForRecipe, setSelectedMenuItemForRecipe] = useState<MenuItemEnhanced | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientItem[]>([]);
  const [preparationInstructions, setPreparationInstructions] = useState('');
  const [preparationTimeMins, setPreparationTimeMins] = useState(15);
  const [yieldPortions, setYieldPortions] = useState(1);

  // Price Change Modal
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [itemToUpdatePrice, setItemToUpdatePrice] = useState<MenuItemEnhanced | null>(null);
  const [newBasePrice, setNewBasePrice] = useState(0);
  const [priceChangeReason, setPriceChangeReason] = useState('Raw material cost increase');

  useEffect(() => {
    return pmsService.subscribe(setDb);
  }, []);

  const menuItems = useMemo(() => inventoryMenuService.getEnhancedMenuItems(), [db]);
  const inventoryItems = useMemo(() => inventoryMenuService.getInventoryItems(), [db]);
  const recipes = useMemo(() => inventoryMenuService.getRecipes(), [db]);
  const modifiers = useMemo(() => inventoryMenuService.getModifiers(), [db]);
  const combos = useMemo(() => inventoryMenuService.getCombos(), [db]);
  const priceHistories = useMemo(() => inventoryMenuService.getPriceHistories(), [db]);
  const profitabilityReport = useMemo(() => inventoryMenuService.getMenuProfitabilityReport(), [db]);
  const costSummary = useMemo(() => inventoryMenuService.getFoodAndBeverageCostSummary(), [db]);

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.menuCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'all' || item.categoryName === categoryFilter;
      const matchType = menuTypeFilter === 'all' || item.menuType === menuTypeFilter;
      return matchSearch && matchCat && matchType;
    });
  }, [menuItems, searchQuery, categoryFilter, menuTypeFilter]);

  // Categories list
  const categoriesList = useMemo(() => {
    const set = new Set(menuItems.map(m => m.categoryName));
    return Array.from(set);
  }, [menuItems]);

  // Open Recipe Builder
  const handleOpenRecipeBuilder = (item: MenuItemEnhanced) => {
    setSelectedMenuItemForRecipe(item);
    const existingRecipe = recipes.find(r => r.menuItemId === item.id && r.active);
    if (existingRecipe) {
      setRecipeIngredients(existingRecipe.ingredients || []);
      setPreparationInstructions(existingRecipe.instructions || '');
      setPreparationTimeMins(existingRecipe.preparationTimeMinutes || 15);
      setYieldPortions(existingRecipe.yieldPortions || 1);
    } else {
      // Initialize with default empty ingredient
      setRecipeIngredients([]);
      setPreparationInstructions('');
      setPreparationTimeMins(item.preparationTimeMinutes || 15);
      setYieldPortions(1);
    }
    setIsRecipeModalOpen(true);
  };

  // Add Ingredient Row to Recipe
  const handleAddIngredientRow = () => {
    if (inventoryItems.length === 0) return;
    const defaultItem = inventoryItems[0];
    const unitCostInGrams = defaultItem.averageCost / (defaultItem.conversionFactor || 1000);

    const newIng: RecipeIngredientItem = {
      id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      inventoryItemId: defaultItem.id,
      inventoryItemCode: defaultItem.itemCode,
      inventoryItemName: defaultItem.name,
      quantity: 100,
      uomCode: defaultItem.consumptionUomCode || 'g',
      unitCost: Math.round(unitCostInGrams * 1000) / 1000,
      wastagePercentage: 5,
      effectiveQuantity: 105,
      totalCost: Math.round(105 * unitCostInGrams * 100) / 100
    };
    setRecipeIngredients([...recipeIngredients, newIng]);
  };

  // Update Ingredient Row
  const handleUpdateIngredient = (index: number, updates: Partial<RecipeIngredientItem>) => {
    setRecipeIngredients(prev => {
      const next = [...prev];
      const cur = { ...next[index], ...updates };

      if (updates.inventoryItemId) {
        const itm = inventoryItems.find(i => i.id === updates.inventoryItemId);
        if (itm) {
          cur.inventoryItemCode = itm.itemCode;
          cur.inventoryItemName = itm.name;
          cur.uomCode = itm.consumptionUomCode || 'g';
          cur.unitCost = Math.round((itm.averageCost / (itm.conversionFactor || 1000)) * 1000) / 1000;
        }
      }

      const effectiveQty = cur.quantity * (1 + (cur.wastagePercentage || 0) / 100);
      cur.effectiveQuantity = Math.round(effectiveQty * 100) / 100;
      cur.totalCost = Math.round(cur.effectiveQuantity * cur.unitCost * 100) / 100;

      next[index] = cur;
      return next;
    });
  };

  // Remove Ingredient Row
  const handleRemoveIngredient = (index: number) => {
    setRecipeIngredients(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate live recipe total cost
  const liveRecipeTotalCost = useMemo(() => {
    return recipeIngredients.reduce((sum, ing) => sum + (ing.totalCost || 0), 0);
  }, [recipeIngredients]);

  // Save Recipe
  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenuItemForRecipe) return;

    const existing = recipes.find(r => r.menuItemId === selectedMenuItemForRecipe.id && r.active);
    const newVersion = existing ? `V${(parseFloat(existing.version.replace('V', '')) + 0.1).toFixed(1)}` : 'V1.0';

    inventoryMenuService.createOrUpdateRecipe({
      menuItemId: selectedMenuItemForRecipe.id,
      menuItemCode: selectedMenuItemForRecipe.menuCode,
      menuItemName: selectedMenuItemForRecipe.name,
      version: newVersion,
      yieldQuantity: yieldPortions,
      yieldUnit: 'Portion',
      preparationTimeMinutes: preparationTimeMins,
      ingredients: recipeIngredients,
      instructions: preparationInstructions,
      totalRecipeCost: liveRecipeTotalCost,
      suggestedSellingPrice: selectedMenuItemForRecipe.basePrice,
      targetFoodCostPercentage: 30,
      active: true,
      createdBy: 'Executive Chef Mohammad Ali',
      effectiveFrom: new Date().toISOString().split('T')[0]
    });

    setIsRecipeModalOpen(false);
  };

  // Open Price Change
  const handleOpenPriceModal = (item: MenuItemEnhanced) => {
    setItemToUpdatePrice(item);
    setNewBasePrice(item.basePrice);
    setPriceChangeReason('Raw ingredient inflation adjustment');
    setIsPriceModalOpen(true);
  };

  // Execute Price Change
  const handleSavePriceChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToUpdatePrice || newBasePrice <= 0) return;

    inventoryMenuService.updateMenuPrice(
      itemToUpdatePrice.id,
      newBasePrice,
      priceChangeReason,
      db.currentUser.name || 'F&B Director'
    );
    setIsPriceModalOpen(false);
  };

  // Tabs definitions
  const tabs = [
    { id: 'dashboard', label: 'Menu Dashboard', icon: UtensilsCrossed },
    { id: 'catalog', label: 'Menu Catalog', icon: BookOpen, badge: menuItems.length },
    { id: 'recipes', label: 'Recipe & Costing Engine', icon: ChefHat, badge: recipes.filter(r => r.active).length },
    { id: 'modifiers', label: 'Modifiers & Add-ons', icon: Layers, badge: modifiers.length },
    { id: 'combos', label: 'Combos & Set Menus', icon: Package, badge: combos.length },
    { id: 'matrix', label: 'BCG Profitability Matrix', icon: Award },
    { id: 'cost-report', label: 'Food & Beverage Cost Report', icon: BarChart2 },
    { id: 'pricing-audit', label: 'Price Change Audit Log', icon: DollarSign, badge: priceHistories.length }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Menu Engineering & Recipe Costing
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Portion Capacity & Profit Matrix
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live recipe ingredient costing, automated kitchen portion bottleneck simulator & price history versioning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('matrix')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            <Award className="w-4 h-4" />
            <span>Stars vs Dogs Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
          >
            <BookOpen className="w-4 h-4" />
            <span>View Full Menu</span>
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

      {/* 3. TAB 1: MENU DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow space-y-1">
              <span className="text-xs text-slate-400 font-medium">Active Menu Items</span>
              <div className="text-2xl font-bold font-mono text-white">
                {menuItems.filter(m => m.active).length} Dishes
              </div>
              <div className="text-[11px] text-slate-400">
                {menuItems.filter(m => m.hasActiveRecipe).length} with active costed recipes
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow space-y-1">
              <span className="text-xs text-slate-400 font-medium">Average Food Cost %</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {costSummary.foodCostPercentage}%
              </div>
              <div className="text-[11px] text-emerald-300">
                Well within hospitality benchmark (28-32%)
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow space-y-1">
              <span className="text-xs text-slate-400 font-medium">Average Beverage Cost %</span>
              <div className="text-2xl font-bold font-mono text-indigo-400">
                {costSummary.beverageCostPercentage}%
              </div>
              <div className="text-[11px] text-indigo-300">
                High gross margin beverage profit
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow space-y-1">
              <span className="text-xs text-slate-400 font-medium">Stars (High Profit & Sales)</span>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {profitabilityReport.filter(r => r.profitabilityTier.startsWith('Stars')).length} Items
              </div>
              <div className="text-[11px] text-slate-400">
                Top resort revenue drivers
              </div>
            </div>
          </div>

          {/* Real-time Producible Portions Bottleneck Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Live Kitchen Production Capacity & Out-of-Stock Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time analysis: exactly how many portions can the kitchen cook right now before stock runs out?
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Synced with Live Warehouse Store
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {menuItems.slice(0, 6).map(item => {
                const portions = item.maxProduciblePortions || 0;
                const isOutOfStock = portions === 0;
                const isLow = portions > 0 && portions <= 20;

                return (
                  <div key={item.id} className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-xs text-white block">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.categoryName} • Base Price ৳{item.basePrice}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isOutOfStock
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isLow
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {isOutOfStock ? '0 Portions' : `${portions} Portions`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
                      <span>Recipe Cost: <strong className="text-white font-mono">৳{item.costPrice}</strong></span>
                      <span>Food Cost: <strong className="text-amber-400 font-mono">{item.foodCostPercentage}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: MENU CATALOG */}
      {activeTab === 'catalog' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                Enhanced Menu Items Catalog ({filteredMenuItems.length} Items)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full pricing matrix including 10% Service Charge, 15% VAT, Food Cost % and live recipe link
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dish name, code..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300"
              >
                <option value="all">All Categories</option>
                {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-3 py-3">Code</th>
                  <th className="px-3 py-3">Dish / Drink Name</th>
                  <th className="px-3 py-3">Category & Type</th>
                  <th className="px-3 py-3 text-right">Recipe Cost</th>
                  <th className="px-3 py-3 text-right">Base Price</th>
                  <th className="px-3 py-3 text-right">10% SC</th>
                  <th className="px-3 py-3 text-right">15% VAT</th>
                  <th className="px-3 py-3 text-right">Final Bill</th>
                  <th className="px-3 py-3 text-right">Food Cost %</th>
                  <th className="px-3 py-3 text-right">Can Cook</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredMenuItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-3 py-3 font-mono font-bold text-amber-400">{item.menuCode}</td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-white">{item.name}</div>
                      <span className="text-[10px] text-slate-400">{item.preparationTimeMinutes} mins prep • {item.kitchenStation} Station</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                        {item.categoryName}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-300 font-semibold">
                      ৳{item.costPrice.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-white">
                      ৳{item.basePrice}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-400">
                      ৳{item.serviceChargeAmount}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-400">
                      ৳{item.taxAmount}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-emerald-400">
                      ৳{item.finalSellingPrice}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold">
                      <span className={item.foodCostPercentage > 35 ? 'text-rose-400' : 'text-emerald-400'}>
                        {item.foodCostPercentage}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold">
                      <span className={item.maxProduciblePortions === 0 ? 'text-rose-400' : 'text-amber-400'}>
                        {item.maxProduciblePortions}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenRecipeBuilder(item)}
                          className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold transition"
                        >
                          Recipe
                        </button>
                        <button
                          onClick={() => handleOpenPriceModal(item)}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-lg text-xs font-semibold transition"
                        >
                          Price
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 3: RECIPES & COSTING ENGINE */}
      {activeTab === 'recipes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-400" />
                Active Standardized Recipes Master
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every recipe specifies raw ingredient consumption with preparation wastage % to calculate theoretical food cost
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recipes.filter(r => r.active).map(rec => (
              <div key={rec.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-amber-400 font-bold">{rec.recipeCode} • {rec.version}</span>
                    <h4 className="font-bold text-sm text-white">{rec.menuItemName}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      Total Cost: ৳{rec.totalRecipeCost.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Prep: {rec.preparationTimeMinutes} mins • Yield: {rec.yieldPortions} portion
                    </span>
                  </div>
                </div>

                {/* Ingredients table */}
                <div className="p-2.5 bg-slate-900 rounded-lg space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Raw Ingredients:</span>
                  <div className="divide-y divide-slate-800 text-xs">
                    {rec.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex justify-between py-1 text-slate-300">
                        <span>{ing.itemName} ({ing.quantity} {ing.uom} + {ing.wastagePercentage}% loss)</span>
                        <span className="font-mono font-semibold">৳{ing.totalCost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px]">Approved by: {rec.approvedBy}</span>
                  <button
                    onClick={() => {
                      const item = menuItems.find(m => m.id === rec.menuItemId);
                      if (item) handleOpenRecipeBuilder(item);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    Edit / Version Up →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 6: BCG PROFITABILITY MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Menu Engineering BCG Profitability Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Classifies dishes into Stars, Plowhorses, Puzzles, and Dogs based on Profit Margin vs Volume Sold
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stars */}
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  ⭐ Stars (High Margin, High Volume)
                </span>
                <span className="text-[11px] text-emerald-300 font-medium">Action: Maintain quality & promote</span>
              </div>
              <div className="space-y-2">
                {profitabilityReport.filter(r => r.profitabilityTier.startsWith('Stars')).map(r => (
                  <div key={r.menuItemId} className="p-2.5 bg-slate-900 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{r.name}</span>
                      <span className="text-[10px] text-slate-400">{r.unitsSold} sold • Margin ৳{r.grossMargin}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-xs">৳{r.totalGrossProfit.toLocaleString()} Profit</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plowhorses */}
            <div className="p-4 bg-blue-950/20 border border-blue-500/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  🐎 Plowhorses (Low Margin, High Volume)
                </span>
                <span className="text-[11px] text-blue-300 font-medium">Action: Increase price or reduce portion size</span>
              </div>
              <div className="space-y-2">
                {profitabilityReport.filter(r => r.profitabilityTier.startsWith('Plowhorses')).map(r => (
                  <div key={r.menuItemId} className="p-2.5 bg-slate-900 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{r.name}</span>
                      <span className="text-[10px] text-slate-400">{r.unitsSold} sold • Food Cost {r.foodCostPercentage}%</span>
                    </div>
                    <span className="font-mono font-bold text-blue-400 text-xs">৳{r.totalGrossProfit.toLocaleString()} Profit</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Puzzles */}
            <div className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  🧩 Puzzles (High Margin, Low Volume)
                </span>
                <span className="text-[11px] text-amber-300 font-medium">Action: Reposition, highlight in menu & servers pitch</span>
              </div>
              <div className="space-y-2">
                {profitabilityReport.filter(r => r.profitabilityTier.startsWith('Puzzles')).map(r => (
                  <div key={r.menuItemId} className="p-2.5 bg-slate-900 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{r.name}</span>
                      <span className="text-[10px] text-slate-400">{r.unitsSold} sold • Margin ৳{r.grossMargin}</span>
                    </div>
                    <span className="font-mono font-bold text-amber-400 text-xs">৳{r.totalGrossProfit.toLocaleString()} Profit</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dogs */}
            <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  🐕 Dogs (Low Margin, Low Volume)
                </span>
                <span className="text-[11px] text-rose-300 font-medium">Action: Discontinue or revamp recipe</span>
              </div>
              <div className="space-y-2">
                {profitabilityReport.filter(r => r.profitabilityTier.startsWith('Dogs')).map(r => (
                  <div key={r.menuItemId} className="p-2.5 bg-slate-900 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{r.name}</span>
                      <span className="text-[10px] text-slate-400">{r.unitsSold} sold • Food Cost {r.foodCostPercentage}%</span>
                    </div>
                    <span className="font-mono font-bold text-rose-400 text-xs">৳{r.totalGrossProfit.toLocaleString()} Profit</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 7: FOOD & BEVERAGE COST REPORT */}
      {activeTab === 'cost-report' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              Monthly Food & Beverage Cost Reconciliation Statement
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Formula: Opening Stock + Net Purchases - Closing Stock = Cost of Goods Sold (COGS)
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">1. Opening Inventory (1st August 2026):</span>
              <span className="font-mono font-bold text-slate-200">৳{costSummary.openingInventoryValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">2. Inward Purchases Received via GRN (MTD):</span>
              <span className="font-mono font-bold text-slate-200">৳{costSummary.purchasesTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">3. Less: Closing Inventory Valuation (31st August 2026):</span>
              <span className="font-mono font-bold text-slate-200">-(৳{costSummary.closingInventoryValue.toLocaleString()})</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700 bg-slate-900 px-3 rounded-lg font-bold text-sm">
              <span className="text-white">Total Cost of Goods Sold (COGS):</span>
              <span className="font-mono text-indigo-400">৳{costSummary.cogsTotal.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total F&B Revenue</span>
                <span className="font-mono font-bold text-base text-white">৳{costSummary.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Food Cost Ratio</span>
                <span className="font-mono font-bold text-base text-emerald-400">{costSummary.foodCostPercentage}%</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Beverage Cost Ratio</span>
                <span className="font-mono font-bold text-base text-indigo-400">{costSummary.beverageCostPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB 8: PRICE CHANGE AUDIT */}
      {activeTab === 'pricing-audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              Menu Price Change Audit Trail
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical record of all menu item price revisions, authorized staff & justifications
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Menu Item</th>
                  <th className="px-3 py-3 text-right">Old Price</th>
                  <th className="px-3 py-3 text-right">New Price</th>
                  <th className="px-3 py-3 text-right">Variance</th>
                  <th className="px-3 py-3">Reason / Justification</th>
                  <th className="px-3 py-3">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {priceHistories.map(h => {
                  const diff = h.newPrice - h.oldPrice;
                  return (
                    <tr key={h.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-3 py-3 font-mono text-slate-400">{h.effectiveFrom}</td>
                      <td className="px-3 py-3 font-bold text-white">{h.menuItemName}</td>
                      <td className="px-3 py-3 text-right font-mono text-slate-400">৳{h.oldPrice}</td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-emerald-400">৳{h.newPrice}</td>
                      <td className={`px-3 py-3 text-right font-mono font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {diff >= 0 ? `+৳${diff}` : `-৳${Math.abs(diff)}`}
                      </td>
                      <td className="px-3 py-3 text-slate-300">{h.reason}</td>
                      <td className="px-3 py-3 text-slate-400">{h.changedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: RECIPE BUILDER & INGREDIENTS
      ======================================================== */}
      {isRecipeModalOpen && selectedMenuItemForRecipe && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-[10px] text-amber-400 font-bold uppercase">Recipe Costing Engine</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-amber-400" />
                  Recipe Builder: {selectedMenuItemForRecipe.name}
                </h3>
              </div>
              <button onClick={() => setIsRecipeModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4 text-xs">
              {/* Recipe Ingredients Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Recipe Raw Ingredients (From Live Inventory):</span>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Ingredient</span>
                  </button>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="px-3 py-2">Ingredient Item</th>
                        <th className="px-3 py-2 text-right">Quantity</th>
                        <th className="px-3 py-2">UOM</th>
                        <th className="px-3 py-2 text-right">Wastage %</th>
                        <th className="px-3 py-2 text-right">Unit Cost</th>
                        <th className="px-3 py-2 text-right">Line Total</th>
                        <th className="px-3 py-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {recipeIngredients.map((ing, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <select
                              value={ing.inventoryItemId}
                              onChange={e => handleUpdateIngredient(idx, { inventoryItemId: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1 text-white text-xs"
                            >
                              {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={ing.quantity}
                              onChange={e => handleUpdateIngredient(idx, { quantity: Number(e.target.value) })}
                              className="w-20 bg-slate-950 border border-slate-700 rounded-lg p-1 text-white text-right font-mono"
                            />
                          </td>
                          <td className="px-3 py-2 font-mono text-slate-400">
                            {ing.uomCode}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={ing.wastagePercentage}
                              onChange={e => handleUpdateIngredient(idx, { wastagePercentage: Number(e.target.value) })}
                              className="w-14 bg-slate-950 border border-slate-700 rounded-lg p-1 text-white text-right font-mono"
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            ৳{ing.unitCost.toFixed(3)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-amber-400">
                            ৳{ing.totalCost.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveIngredient(idx)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recipe Cost Calculation Banner */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs block">Theoretical Portion Cost:</span>
                  <span className="font-mono font-bold text-lg text-emerald-400">৳{liveRecipeTotalCost.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-xs block">Food Cost Percentage:</span>
                  <span className="font-mono font-bold text-lg text-amber-400">
                    {Math.round((liveRecipeTotalCost / selectedMenuItemForRecipe.basePrice) * 1000) / 10}%
                  </span>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Standard Cooking & Plating Instructions</label>
                <textarea
                  rows={3}
                  value={preparationInstructions}
                  onChange={e => setPreparationInstructions(e.target.value)}
                  placeholder="e.g. Sauté spices in ghee, add marinated meat, simmer on slow flame for 30 minutes..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecipeModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Save Standard Recipe & Update Costing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CHANGE MENU PRICE
      ======================================================== */}
      {isPriceModalOpen && itemToUpdatePrice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                Change Selling Price: {itemToUpdatePrice.name}
              </h3>
              <button onClick={() => setIsPriceModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSavePriceChange} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Current Base Price:</span>
                  <span className="font-mono font-bold text-white">৳{itemToUpdatePrice.basePrice}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Current Cost Price:</span>
                  <span className="font-mono font-bold text-slate-300">৳{itemToUpdatePrice.costPrice}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">New Base Selling Price (৳) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newBasePrice}
                  onChange={e => setNewBasePrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Price Revision Justification *</label>
                <input
                  type="text"
                  required
                  value={priceChangeReason}
                  onChange={e => setPriceChangeReason(e.target.value)}
                  placeholder="e.g. Meat & spice procurement inflation"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPriceModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                >
                  Confirm & Audit Log Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
