import React, { useState } from 'react';
import {
  Settings, Building, DollarSign, Clock, ShieldAlert,
  RotateCcw, CheckCircle2, Save, Moon, Check
} from 'lucide-react';
import { pmsService } from '../services/pmsService';

export const SettingsView: React.FC = () => {
  const db = pmsService.getState();
  const [resortName, setResortName] = useState(db.settings.resortName || 'CCULB Resort & Convention Hall');
  const [address, setAddress] = useState(db.settings.address || 'Joypara, Dohar, Dhaka-1330, Bangladesh');
  const [phone, setPhone] = useState(db.settings.phone || '+880 1713-388000');
  const [email, setEmail] = useState(db.settings.email || 'info@cculbresort.com');
  const [vatRate, setVatRate] = useState(db.settings.vatRate || db.settings.taxRatePercent || 15);
  const [serviceCharge, setServiceCharge] = useState(db.settings.serviceChargeRate || db.settings.serviceChargePercent || 10);
  const [checkInTime, setCheckInTime] = useState(db.settings.checkInTime || '14:00');
  const [checkOutTime, setCheckOutTime] = useState(db.settings.checkOutTime || '12:00');

  // Night Audit Settings
  const [autoNightAuditEnabled, setAutoNightAuditEnabled] = useState(db.settings.autoNightAuditEnabled ?? true);
  const [autoNightAuditTime, setAutoNightAuditTime] = useState(db.settings.autoNightAuditTime || '05:00');

  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    pmsService.updateNightAuditSettings(autoNightAuditEnabled, autoNightAuditTime);
    setSavedMessage('Property parameters and Night Audit schedule saved successfully.');
    setTimeout(() => setSavedMessage(''), 4000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset database to clean seed state? This will restore initial rooms, bookings, and folios.')) {
      pmsService.resetToSeed();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30 rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Property Configuration & System Settings</h1>
            <p className="text-slate-300 text-xs mt-0.5">
              Resort parameters, Night Audit 05:00 AM automation, tax rules, standard check-in timings, and database maintenance.
            </p>
          </div>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl flex items-center space-x-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resort Identity Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Building className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">Resort Property Identity</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Property Name:</span>
              <input
                type="text"
                value={resortName}
                onChange={(e) => setResortName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Physical Address:</span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block mb-1">Central Hotline:</span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Reservation Email:</span>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Night Audit 05:00 AM Automation Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-slate-100 text-sm">Automated Night Audit Service (05:00 AM)</h3>
            </div>
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold rounded-full border border-indigo-500/30">
              Biz Date: {db.settings.currentBusinessDate}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="font-bold text-slate-200 block">Auto Night Audit Service</span>
                <p className="text-[11px] text-slate-400">
                  Automatically posts daily room charges and rolls the operational day at 05:00 AM.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoNightAuditEnabled}
                onChange={e => setAutoNightAuditEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block mb-1">Scheduled Close Time (24H):</span>
                <input
                  type="time"
                  value={autoNightAuditTime}
                  onChange={e => setAutoNightAuditTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs font-bold"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Last Audit Executed:</span>
                <input
                  type="text"
                  disabled
                  value={db.settings.lastNightAuditDate || 'Never'}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial & Front Desk Timing Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm lg:col-span-2">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-sm">Financial Rates & Operational Timings</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Government VAT Rate (%):</span>
              <input
                type="number"
                value={vatRate}
                onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Service Charge Rate (%):</span>
              <input
                type="number"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Default Check-In Time:</span>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Default Check-Out Time:</span>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow text-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </div>
      </form>

      {/* Database Maintenance Tools */}
      <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 space-y-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <h3 className="font-bold text-rose-400 text-sm">Development Database Utilities</h3>
        </div>
        <p className="text-slate-400 text-xs">
          Reset all rooms, reservations, in-house stays, convention bookings, and folios to default development seed data.
        </p>
        <button
          type="button"
          onClick={handleResetData}
          className="flex items-center space-x-1.5 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold rounded-xl border border-rose-500/30 transition text-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Clean Seed State</span>
        </button>
      </div>
    </div>
  );
};
