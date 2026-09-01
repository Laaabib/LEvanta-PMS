import React, { useState, useMemo } from 'react';
import {
  Landmark, BookOpen, Scale, Building2, CheckCircle2,
  AlertTriangle, Plus, Search, Filter, RefreshCw, FileSpreadsheet,
  DollarSign, ArrowUpRight, ArrowDownRight, ChevronRight,
  ChevronDown, ShieldCheck, CreditCard, Receipt, Clock,
  FileText, Check, AlertCircle, Sparkles, Layers
} from 'lucide-react';
import { pmsService } from '../services/pmsService';
import {
  GLAccount, JournalVoucher, JournalEntryItem, CityLedgerAccount,
  DepartmentalSyncStatus, AccountCategory
} from '../types/pms';
import * as XLSX from 'xlsx';

export const AccountingLedgerView: React.FC = () => {
  const db = pmsService.getState();
  const [activeTab, setActiveTab] = useState<'gl' | 'jv' | 'city-ledger' | 'sync'>('gl');

  // Chart of Accounts State
  const [glSearch, setGlSearch] = useState('');
  const [glTypeFilter, setGlTypeFilter] = useState<'All' | AccountCategory>('All');
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newAccCode, setNewAccCode] = useState('');
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<AccountCategory>('Asset');
  const [newAccCategory, setNewAccCategory] = useState('');
  const [newAccDesc, setNewAccDesc] = useState('');
  const [newAccBalance, setNewAccBalance] = useState(0);

  // Journal Vouchers State
  const [jvSearch, setJvSearch] = useState('');
  const [jvModuleFilter, setJvModuleFilter] = useState<string>('All');
  const [expandedJvId, setExpandedJvId] = useState<string | null>(null);
  const [isNewJvModalOpen, setIsNewJvModalOpen] = useState(false);
  const [jvDate, setJvDate] = useState(db.settings.currentBusinessDate || new Date().toISOString().split('T')[0]);
  const [jvSourceModule, setJvSourceModule] = useState<JournalVoucher['sourceModule']>('Manual Adjustment');
  const [jvSourceRef, setJvSourceRef] = useState('');
  const [jvNarration, setJvNarration] = useState('');
  const [jvEntries, setJvEntries] = useState<Array<{ accountCode: string; debit: number; credit: number; memo: string }>>([
    { accountCode: '1010', debit: 10000, credit: 0, memo: '' },
    { accountCode: '4010', debit: 0, credit: 10000, memo: '' }
  ]);

  // City Ledger State
  const [clSearch, setClSearch] = useState('');
  const [isAddClModalOpen, setIsAddClModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedClAccount, setSelectedClAccount] = useState<CityLedgerAccount | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('Bank Transfer');
  const [payReference, setPayReference] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // New Corporate Account State
  const [clCompanyName, setClCompanyName] = useState('');
  const [clContactPerson, setClContactPerson] = useState('');
  const [clPhone, setClPhone] = useState('');
  const [clEmail, setClEmail] = useState('');
  const [clCreditLimit, setClCreditLimit] = useState(500000);
  const [clPaymentTerms, setClPaymentTerms] = useState<CityLedgerAccount['paymentTerms']>('Net 30');
  const [clTaxNumber, setClTaxNumber] = useState('');
  const [clAddress, setClAddress] = useState('');
  const [clNotes, setClNotes] = useState('');

  // Toast / Feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // GL Calculations
  const glAccounts = useMemo(() => {
    return (db.glAccounts || []).filter(a => {
      const matchSearch =
        a.code.includes(glSearch) ||
        a.name.toLowerCase().includes(glSearch.toLowerCase()) ||
        a.category.toLowerCase().includes(glSearch.toLowerCase());
      const matchType = glTypeFilter === 'All' || a.type === glTypeFilter;
      return matchSearch && matchType;
    });
  }, [db.glAccounts, glSearch, glTypeFilter]);

  const glSummary = useMemo(() => {
    const all = db.glAccounts || [];
    const totalAssets = all.filter(a => a.type === 'Asset').reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = all.filter(a => a.type === 'Liability').reduce((sum, a) => sum + a.balance, 0);
    const totalEquity = all.filter(a => a.type === 'Equity').reduce((sum, a) => sum + a.balance, 0);
    const totalRevenue = all.filter(a => a.type === 'Revenue').reduce((sum, a) => sum + a.balance, 0);
    const totalExpenses = all.filter(a => a.type === 'Expense').reduce((sum, a) => sum + a.balance, 0);
    return { totalAssets, totalLiabilities, totalEquity, totalRevenue, totalExpenses };
  }, [db.glAccounts]);

  // JV Calculations
  const jvList = useMemo(() => {
    return (db.journalVouchers || []).filter(v => {
      const matchSearch =
        v.voucherNumber.toLowerCase().includes(jvSearch.toLowerCase()) ||
        v.narration.toLowerCase().includes(jvSearch.toLowerCase()) ||
        v.sourceReference.toLowerCase().includes(jvSearch.toLowerCase());
      const matchModule = jvModuleFilter === 'All' || v.sourceModule === jvModuleFilter;
      return matchSearch && matchModule;
    });
  }, [db.journalVouchers, jvSearch, jvModuleFilter]);

  // City Ledger Calculations
  const cityLedgerList = useMemo(() => {
    return (db.cityLedgerAccounts || []).filter(c => {
      return (
        c.accountNumber.toLowerCase().includes(clSearch.toLowerCase()) ||
        c.companyName.toLowerCase().includes(clSearch.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(clSearch.toLowerCase())
      );
    });
  }, [db.cityLedgerAccounts, clSearch]);

  const totalArOutstanding = useMemo(() => {
    return (db.cityLedgerAccounts || []).reduce((sum, c) => sum + c.currentBalance, 0);
  }, [db.cityLedgerAccounts]);

  // JV Builder Validation
  const currentJvDebits = jvEntries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const currentJvCredits = jvEntries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const isJvBalanced = currentJvDebits === currentJvCredits && currentJvDebits > 0;

  const handleAddJvRow = () => {
    setJvEntries(prev => [...prev, { accountCode: '1010', debit: 0, credit: 0, memo: '' }]);
  };

  const handleRemoveJvRow = (index: number) => {
    if (jvEntries.length <= 2) return;
    setJvEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateJvRow = (index: number, field: string, value: any) => {
    setJvEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmitNewJv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isJvBalanced) {
      setFeedbackMsg({
        type: 'error',
        text: `Voucher is out of balance. Total debits (৳${currentJvDebits.toLocaleString()}) must equal total credits (৳${currentJvCredits.toLocaleString()}).`
      });
      return;
    }

    const formattedEntries: JournalEntryItem[] = jvEntries.map((e, idx) => {
      const gl = db.glAccounts?.find(a => a.code === e.accountCode);
      return {
        id: `jve-new-${Date.now()}-${idx}`,
        accountCode: e.accountCode,
        accountName: gl?.name || 'General Ledger Account',
        debit: Number(e.debit) || 0,
        credit: Number(e.credit) || 0,
        memo: e.memo
      };
    });

    const res = pmsService.createJournalVoucher({
      date: jvDate,
      sourceModule: jvSourceModule,
      sourceReference: jvSourceRef || `MANUAL-${Date.now()}`,
      narration: jvNarration,
      entries: formattedEntries
    });

    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      setIsNewJvModalOpen(false);
      setJvNarration('');
      setJvSourceRef('');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
  };

  const handleSubmitNewGlAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const res = pmsService.createGLAccount({
      code: newAccCode.trim(),
      name: newAccName.trim(),
      type: newAccType,
      category: newAccCategory.trim() || `${newAccType} Group`,
      description: newAccDesc.trim(),
      balance: Number(newAccBalance) || 0
    });

    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      setIsAddAccountModalOpen(false);
      setNewAccCode('');
      setNewAccName('');
      setNewAccDesc('');
      setNewAccBalance(0);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
  };

  const handleSubmitNewCorporate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = pmsService.createCityLedgerAccount({
      companyName: clCompanyName.trim(),
      contactPerson: clContactPerson.trim(),
      phone: clPhone.trim(),
      email: clEmail.trim(),
      creditLimit: Number(clCreditLimit) || 100000,
      paymentTerms: clPaymentTerms,
      status: 'Active',
      taxNumber: clTaxNumber.trim(),
      address: clAddress.trim(),
      notes: clNotes.trim()
    });

    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      setIsAddClModalOpen(false);
      setClCompanyName('');
      setClContactPerson('');
      setClPhone('');
      setClEmail('');
      setClTaxNumber('');
      setClAddress('');
      setClNotes('');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
  };

  const handleOpenPaymentModal = (acc: CityLedgerAccount) => {
    setSelectedClAccount(acc);
    setPayAmount(acc.currentBalance);
    setPayReference(`TRF-${Date.now().toString().slice(-6)}`);
    setPayNotes('');
    setIsPaymentModalOpen(true);
  };

  const handleSubmitCityLedgerPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClAccount) return;

    const res = pmsService.recordCityLedgerPayment(
      selectedClAccount.id,
      Number(payAmount),
      payMethod,
      payReference,
      payNotes
    );

    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      setIsPaymentModalOpen(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
  };

  const handleSyncDept = (dept: string) => {
    const res = pmsService.syncDepartmentToGL(dept);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const exportGLToExcel = () => {
    const data = (db.glAccounts || []).map(a => ({
      'Account Code': a.code,
      'Account Name': a.name,
      'Type': a.type,
      'Category': a.category,
      'Balance (BDT)': a.balance,
      'System Account': a.isSystem ? 'Yes' : 'No',
      'Description': a.description
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chart of Accounts');
    XLSX.writeFile(wb, `CCULB_Chart_of_Accounts_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-900 text-white rounded-lg shadow-sm">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">General Ledger & Back-Office Accounting</h1>
              <p className="text-sm text-gray-500">Double-entry accounting ledger, Chart of Accounts, corporate City Ledger & revenue synchronization</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportGLToExcel}
            className="px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Ledger
          </button>
          {activeTab === 'gl' && (
            <button
              onClick={() => setIsAddAccountModalOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-900 hover:bg-indigo-950 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New GL Account
            </button>
          )}
          {activeTab === 'jv' && (
            <button
              onClick={() => setIsNewJvModalOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-900 hover:bg-indigo-950 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Post Journal Voucher
            </button>
          )}
          {activeTab === 'city-ledger' && (
            <button
              onClick={() => setIsAddClModalOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-900 hover:bg-indigo-950 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Corporate Account
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span className="text-sm font-medium">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Assets</div>
          <div className="mt-2 text-xl font-bold text-gray-900 font-mono">৳{glSummary.totalAssets.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-gray-500">Bank, Cash, Guest & AR</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Liabilities</div>
          <div className="mt-2 text-xl font-bold text-rose-700 font-mono">৳{glSummary.totalLiabilities.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-gray-500">Deposits, Tax & SC Pool</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Revenue (YTD)</div>
          <div className="mt-2 text-xl font-bold text-emerald-700 font-mono">৳{glSummary.totalRevenue.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-gray-500">Rooms, F&B, Halls, Sports</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">City Ledger AR</div>
          <div className="mt-2 text-xl font-bold text-blue-700 font-mono">৳{totalArOutstanding.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-gray-500">{(db.cityLedgerAccounts || []).length} Corporate Accounts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Operating Expenses</div>
          <div className="mt-2 text-xl font-bold text-amber-700 font-mono">৳{glSummary.totalExpenses.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-gray-500">Supplies, F&B Raw, Power</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('gl')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'gl' ? 'border-indigo-900 text-indigo-950 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <BookOpen className="w-4 h-4" />
            Chart of Accounts & GL ({(db.glAccounts || []).length})
          </button>
          <button
            onClick={() => setActiveTab('jv')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'jv' ? 'border-indigo-900 text-indigo-950 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Scale className="w-4 h-4" />
            Journal Vouchers (Double-Entry) ({(db.journalVouchers || []).length})
          </button>
          <button
            onClick={() => setActiveTab('city-ledger')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'city-ledger' ? 'border-indigo-900 text-indigo-950 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Building2 className="w-4 h-4" />
            City Ledger (Corporate AR) ({(db.cityLedgerAccounts || []).length})
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'sync' ? 'border-indigo-900 text-indigo-950 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <RefreshCw className="w-4 h-4" />
            Departmental Revenue Sync
          </button>
        </div>
      </div>

      {/* TAB 1: Chart of Accounts */}
      {activeTab === 'gl' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search code, account name..."
                  value={glSearch}
                  onChange={e => setGlSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1 text-xs">
                <span className="text-gray-400 px-1 font-medium">Type:</span>
                {(['All', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setGlTypeFilter(type)}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${glTypeFilter === type ? 'bg-indigo-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 font-medium">
              Showing {glAccounts.length} of {(db.glAccounts || []).length} accounts
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-28">GL Code</th>
                  <th className="py-3 px-4">Account Title & Description</th>
                  <th className="py-3 px-4">Account Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Current Balance (BDT)</th>
                  <th className="py-3 px-4 text-center">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {glAccounts.map(acc => (
                  <tr key={acc.code} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-950">
                      {acc.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{acc.name}</div>
                      <div className="text-[11px] text-gray-400">{acc.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        acc.type === 'Asset'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : acc.type === 'Liability'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : acc.type === 'Revenue'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : acc.type === 'Expense'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      {acc.category}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 text-sm">
                      ৳{acc.balance.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {acc.isSystem ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          <ShieldCheck className="w-3 h-3 text-indigo-600" />
                          System
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Custom
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Double-Entry Journal Vouchers */}
      {activeTab === 'jv' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search voucher #, narration, ref..."
                  value={jvSearch}
                  onChange={e => setJvSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1 text-xs">
                <span className="text-gray-400 px-1 font-medium">Source:</span>
                {(['All', 'Front Desk', 'Restaurant POS', 'Activities', 'Banquet & Events', 'Night Audit', 'Manual Adjustment'] as const).map(mod => (
                  <button
                    key={mod}
                    onClick={() => setJvModuleFilter(mod)}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${jvModuleFilter === mod ? 'bg-indigo-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {mod === 'Restaurant POS' ? 'POS' : mod === 'Banquet & Events' ? 'Banquet' : mod}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 font-medium">
              Showing {jvList.length} balanced journal vouchers
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-8"></th>
                  <th className="py-3 px-4">Voucher #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Source Module</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Narration / Description</th>
                  <th className="py-3 px-4 text-right">Debit (BDT)</th>
                  <th className="py-3 px-4 text-right">Credit (BDT)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jvList.map(voucher => {
                  const isExpanded = expandedJvId === voucher.id;
                  return (
                    <React.Fragment key={voucher.id}>
                      <tr
                        onClick={() => setExpandedJvId(isExpanded ? null : voucher.id)}
                        className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-2 text-center text-gray-400">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-600" /> : <ChevronRight className="w-4 h-4" />}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-950">
                          {voucher.voucherNumber}
                        </td>
                        <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                          {voucher.date}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                            {voucher.sourceModule}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500">
                          {voucher.sourceReference}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-gray-800 font-medium">
                          {voucher.narration}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                          ৳{voucher.totalDebit.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                          ৳{voucher.totalCredit.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Balanced
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Entries Breakdown */}
                      {isExpanded && (
                        <tr className="bg-indigo-50/40">
                          <td colSpan={9} className="p-4 pl-12">
                            <div className="bg-white rounded-lg border border-indigo-100 p-3 shadow-2xs">
                              <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2 border-b border-gray-100 pb-1.5">
                                <span>Itemized Journal Entries & GL Postings (Posted by: {voucher.postedBy})</span>
                                <span className="font-mono text-indigo-950 font-bold">Total: ৳{voucher.totalDebit.toLocaleString()}</span>
                              </div>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-gray-400 border-b border-gray-100">
                                    <th className="py-1 px-2 text-left">GL Code</th>
                                    <th className="py-1 px-2 text-left">Account Name</th>
                                    <th className="py-1 px-2 text-left">Memo</th>
                                    <th className="py-1 px-2 text-right">Debit (BDT)</th>
                                    <th className="py-1 px-2 text-right">Credit (BDT)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {voucher.entries.map((entry, idx) => (
                                    <tr key={idx} className="border-b border-gray-50">
                                      <td className="py-1.5 px-2 font-mono font-bold text-indigo-900">{entry.accountCode}</td>
                                      <td className="py-1.5 px-2 font-medium text-gray-800">{entry.accountName}</td>
                                      <td className="py-1.5 px-2 text-gray-400 italic">{entry.memo || '—'}</td>
                                      <td className="py-1.5 px-2 text-right font-mono font-bold text-gray-900">
                                        {entry.debit > 0 ? `৳${entry.debit.toLocaleString()}` : '—'}
                                      </td>
                                      <td className="py-1.5 px-2 text-right font-mono font-bold text-gray-900">
                                        {entry.credit > 0 ? `৳${entry.credit.toLocaleString()}` : '—'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: City Ledger (Corporate AR) */}
      {activeTab === 'city-ledger' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search company, contact person, account #..."
                value={clSearch}
                onChange={e => setClSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            <div className="text-xs text-gray-500 font-medium">
              Total Outstanding Receivables: <span className="font-bold text-blue-700 font-mono">৳{totalArOutstanding.toLocaleString()}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Account #</th>
                  <th className="py-3 px-4">Corporate Entity</th>
                  <th className="py-3 px-4">Contact & Protocol</th>
                  <th className="py-3 px-4 text-right">Credit Limit</th>
                  <th className="py-3 px-4 text-right">Outstanding (BDT)</th>
                  <th className="py-3 px-4 text-center">Credit Utilization</th>
                  <th className="py-3 px-4">Payment Terms</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cityLedgerList.map(acc => {
                  const percentUsed = Math.min(100, Math.round((acc.currentBalance / acc.creditLimit) * 100));
                  return (
                    <tr key={acc.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-950">
                        {acc.accountNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 text-sm">{acc.companyName}</div>
                        <div className="text-[11px] text-gray-400">{acc.address || 'Dhaka, Bangladesh'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">{acc.contactPerson}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{acc.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-gray-700">
                        ৳{acc.creditLimit.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm text-blue-800">
                        ৳{acc.currentBalance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center min-w-[140px]">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${percentUsed > 80 ? 'bg-rose-600' : percentUsed > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-semibold text-gray-600">{percentUsed}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          {acc.paymentTerms}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenPaymentModal(acc)}
                          disabled={acc.currentBalance <= 0}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-950 disabled:opacity-30 disabled:cursor-not-allowed rounded-md shadow-2xs transition-colors"
                        >
                          Receive Payment
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

      {/* TAB 4: Departmental Revenue Synchronization */}
      {activeTab === 'sync' && (
        <div className="space-y-4">
          <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-indigo-950">Automated POS, Front Desk & Banquet Revenue Mapping</h3>
              <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">
                All operating departments continuously feed transactions into the General Ledger during operation and finalize balances during the 05:00 AM Night Audit. You can trigger manual on-demand reconciliation at any time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(db.departmentalSyncs || []).map(dept => (
              <div key={dept.department} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Department</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {dept.syncStatus}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-gray-900">{dept.department}</h3>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Total Registered Bills:</span>
                      <span className="font-mono font-bold text-gray-900">{dept.totalBills}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Cumulative Volume:</span>
                      <span className="font-mono font-bold text-emerald-800">৳{dept.totalVolume.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Last Synchronized:</span>
                      <span className="text-gray-500">{new Date(dept.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-[11px] space-y-1">
                    <div className="text-gray-500 font-semibold">GL Account Mapping:</div>
                    <div className="text-indigo-900 font-mono truncate">Dr: {dept.glAccountMapping.debitAccount}</div>
                    <div className="text-emerald-900 font-mono truncate">Cr: {dept.glAccountMapping.creditAccount}</div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end">
                  <button
                    onClick={() => handleSyncDept(dept.department)}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-950 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Re-Sync Department
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD GL ACCOUNT */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add General Ledger Account</h2>
                <p className="text-xs text-gray-500">Create new account in Chart of Accounts</p>
              </div>
              <button onClick={() => setIsAddAccountModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSubmitNewGlAccount} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">GL Account Code <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5050"
                    value={newAccCode}
                    onChange={e => setNewAccCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Account Type <span className="text-rose-500">*</span></label>
                  <select
                    value={newAccType}
                    onChange={e => setNewAccType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  >
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Account Title / Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guest Laundry Chemicals & Detergents"
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category / Group</label>
                <input
                  type="text"
                  placeholder="e.g. Operations & Guest Services"
                  value={newAccCategory}
                  onChange={e => setNewAccCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Opening Balance (BDT)</label>
                <input
                  type="number"
                  value={newAccBalance}
                  onChange={e => setNewAccBalance(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Accounting notes or purpose..."
                  value={newAccDesc}
                  onChange={e => setNewAccDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-950 rounded-lg shadow-sm"
                >
                  Create GL Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: POST JOURNAL VOUCHER */}
      {isNewJvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Post Manual Journal Voucher (JV)</h2>
                <p className="text-xs text-gray-500">Double-entry balanced debits and credits ledger posting</p>
              </div>
              <button onClick={() => setIsNewJvModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSubmitNewJv} className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Voucher Date</label>
                  <input
                    type="date"
                    required
                    value={jvDate}
                    onChange={e => setJvDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Source Module</label>
                  <select
                    value={jvSourceModule}
                    onChange={e => setJvSourceModule(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  >
                    <option value="Manual Adjustment">Manual Adjustment</option>
                    <option value="Front Desk">Front Desk</option>
                    <option value="Restaurant POS">Restaurant POS</option>
                    <option value="Activities">Activities</option>
                    <option value="Amenities">Amenities</option>
                    <option value="Banquet & Events">Banquet & Events</option>
                    <option value="Cashier Settlement">Cashier Settlement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Reference / Doc #</label>
                  <input
                    type="text"
                    placeholder="e.g. ADJ-2026-004"
                    value={jvSourceRef}
                    onChange={e => setJvSourceRef(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Narration / Transaction Description <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Explain transaction reason and authorized approval..."
                  value={jvNarration}
                  onChange={e => setJvNarration(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              {/* Journal Entries Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Debit & Credit Entries</label>
                  <button
                    type="button"
                    onClick={handleAddJvRow}
                    className="px-2 py-1 text-xs font-semibold text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Row
                  </button>
                </div>

                <div className="space-y-2 border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                  {jvEntries.map((row, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <select
                          value={row.accountCode}
                          onChange={e => handleUpdateJvRow(index, 'accountCode', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                        >
                          {(db.glAccounts || []).map(gl => (
                            <option key={gl.code} value={gl.code}>
                              {gl.code} - {gl.name} ({gl.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          placeholder="Debit (৳)"
                          value={row.debit || ''}
                          onChange={e => {
                            handleUpdateJvRow(index, 'debit', Number(e.target.value));
                            if (Number(e.target.value) > 0) handleUpdateJvRow(index, 'credit', 0);
                          }}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-lg font-mono text-right focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          placeholder="Credit (৳)"
                          value={row.credit || ''}
                          onChange={e => {
                            handleUpdateJvRow(index, 'credit', Number(e.target.value));
                            if (Number(e.target.value) > 0) handleUpdateJvRow(index, 'debit', 0);
                          }}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-lg font-mono text-right focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                        />
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveJvRow(index)}
                          disabled={jvEntries.length <= 2}
                          className="p-1 text-gray-400 hover:text-rose-600 disabled:opacity-20"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Totals & Balance Checker */}
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs font-mono font-bold">
                    <div className="flex items-center gap-2">
                      {isJvBalanced ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Balanced
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" /> Out of Balance (Diff: ৳{Math.abs(currentJvDebits - currentJvCredits).toLocaleString()})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-gray-500 mr-2">Total Dr:</span>
                        <span className="text-gray-900">৳{currentJvDebits.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 mr-2">Total Cr:</span>
                        <span className="text-gray-900">৳{currentJvCredits.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsNewJvModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isJvBalanced}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-950 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm"
                >
                  Post Voucher to General Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD CORPORATE CITY LEDGER ACCOUNT */}
      {isAddClModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Register Corporate City Ledger Client</h2>
                <p className="text-xs text-gray-500">Enable direct folio credit billing & corporate AR invoicing</p>
              </div>
              <button onClick={() => setIsAddClModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSubmitNewCorporate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Company / Organization Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chevron Bangladesh Ltd."
                  value={clCompanyName}
                  onChange={e => setClCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Protocol Person <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asif Iqbal (Admin VP)"
                    value={clContactPerson}
                    onChange={e => setClContactPerson(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="+880 1711-..."
                    value={clPhone}
                    onChange={e => setClPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Billing Email</label>
                  <input
                    type="email"
                    placeholder="accounts@company.com"
                    value={clEmail}
                    onChange={e => setClEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">TIN / VAT Reg #</label>
                  <input
                    type="text"
                    placeholder="TIN-..."
                    value={clTaxNumber}
                    onChange={e => setClTaxNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Approved Credit Limit (BDT) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    min="10000"
                    step="10000"
                    required
                    value={clCreditLimit}
                    onChange={e => setClCreditLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Credit Payment Terms</label>
                  <select
                    value={clPaymentTerms}
                    onChange={e => setClPaymentTerms(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 45">Net 45 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Corporate Address</label>
                <input
                  type="text"
                  placeholder="Street, Area, Dhaka"
                  value={clAddress}
                  onChange={e => setClAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddClModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-950 rounded-lg shadow-sm"
                >
                  Register Corporate Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: RECEIVE CORPORATE PAYMENT */}
      {isPaymentModalOpen && selectedClAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Record Corporate Payment</h2>
                <p className="text-xs text-gray-500">{selectedClAccount.companyName} ({selectedClAccount.accountNumber})</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSubmitCityLedgerPayment} className="mt-4 space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-blue-800 font-semibold">Current Outstanding AR</div>
                  <div className="text-base font-bold text-blue-950 font-mono">৳{selectedClAccount.currentBalance.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-800">Approved Limit</div>
                  <div className="text-sm font-semibold text-blue-900 font-mono">৳{selectedClAccount.creditLimit.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Settlement Amount (BDT) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  max={selectedClAccount.currentBalance}
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono font-bold text-sm focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  >
                    <option value="Bank Transfer">Bank Transfer (BEFTN/RTGS)</option>
                    <option value="Cheque">Corporate Cheque</option>
                    <option value="Pay Order">Bank Pay Order</option>
                    <option value="Cash">Cash Deposit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Instrument / Ref # <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRF-992812"
                    value={payReference}
                    onChange={e => setPayReference(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 retreat event settlement"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-950 rounded-lg shadow-sm"
                >
                  Confirm & Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
