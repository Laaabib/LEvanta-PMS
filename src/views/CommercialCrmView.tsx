import React, { useState } from 'react';
import {
  Briefcase, Users, Star, Gift, PhoneCall, FileText, CheckCircle2,
  Plus, Search, Filter, Mail, Building, Award, Calendar, DollarSign
} from 'lucide-react';
import { pmsService } from '../services/pmsService';

interface CommercialCrmProps {
  initialTab?: 'corporate' | 'agents' | 'leads' | 'vip' | 'feedback';
}

export const CommercialCrmView: React.FC<CommercialCrmProps> = ({ initialTab = 'corporate' }) => {
  const [activeTab, setActiveTab] = useState<'corporate' | 'agents' | 'leads' | 'vip' | 'feedback'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

  const db = pmsService.getState();

  const corporateAccounts = [
    { id: 'corp-1', name: 'Standard Chartered Bank Ltd.', contact: 'Tanveer Ahmed (AVP)', phone: '+880 1711-223344', email: 'tanveer.ahmed@sc.com', discountPct: 20, creditLimit: 500000, balance: 145000, status: 'Active' },
    { id: 'corp-2', name: 'Grameenphone Corporate HR', contact: 'Farzana Haque (Lead HR)', phone: '+880 1713-998877', email: 'farzana.h@grameenphone.com', discountPct: 25, creditLimit: 1000000, balance: 320000, status: 'Active' },
    { id: 'corp-3', name: 'Beximco Pharmaceuticals Ltd.', contact: 'Dr. Asif Kamal', phone: '+880 1819-445566', email: 'asif.kamal@beximco.net', discountPct: 15, creditLimit: 300000, balance: 80000, status: 'Active' },
    { id: 'corp-4', name: 'CCULB Union Central Committee', contact: 'Secretary General', phone: '+880 1711-000111', email: 'secretariat@cculb.org', discountPct: 35, creditLimit: 2000000, balance: 450000, status: 'Active' }
  ];

  const travelAgents = [
    { id: 'ta-1', name: 'ShareTrip Travel Services', commission: '10%', contact: 'Shakil Rahman', phone: '+880 1911-334455', activeBookings: 14, totalRevenue: 850000 },
    { id: 'ta-2', name: 'GoZayaan Bangladesh', commission: '12%', contact: 'Nabil Hasan', phone: '+880 1712-667788', activeBookings: 22, totalRevenue: 1420000 },
    { id: 'ta-3', name: 'Flight Expert Hospitality Desk', commission: '8%', contact: 'Mehnaz Kabir', phone: '+880 1814-112233', activeBookings: 9, totalRevenue: 490000 }
  ];

  const leads = [
    { id: 'lead-1', title: 'Annual General Meeting 2026', client: 'Dhaka Chamber of Commerce (DCCI)', expectedPax: 350, expectedRevenue: 750000, stage: 'Proposal Sent', date: '2026-09-20' },
    { id: 'lead-2', title: 'Winter Executive Retreat', client: 'Unilever Bangladesh Leadership Team', expectedPax: 45, expectedRevenue: 480000, stage: 'Negotiation', date: '2026-10-05' },
    { id: 'lead-3', title: 'Medical Association Gala Dinner', client: 'Bangladesh Orthopedic Society', expectedPax: 500, expectedRevenue: 950000, stage: 'Contract Signed', date: '2026-11-12' }
  ];

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">Commercial, Sales & CRM Engine</h1>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                CORPORATE & CRM
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Corporate contracts, travel agent commissions, sales pipeline leads, VIP guest preferences and feedback.
            </p>
          </div>
        </div>

        <button className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors shadow text-xs">
          <Plus className="w-4 h-4" />
          <span>New Corporate Contract</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
        <button
          onClick={() => setActiveTab('corporate')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'corporate' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Corporate Accounts & Tariffs
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'agents' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Travel Agents & OTAs
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'leads' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sales Leads & Event Pipeline
        </button>
      </div>

      {/* Corporate Tab */}
      {activeTab === 'corporate' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-200 text-xs">Active Corporate Rate Agreements</span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Search corporate client..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 w-56 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5 font-bold">Company / Organization</th>
                <th className="px-3 py-2.5 font-bold">Key Contact Person</th>
                <th className="px-3 py-2.5 font-bold">Contract Discount</th>
                <th className="px-3 py-2.5 font-bold text-right">Credit Limit (৳)</th>
                <th className="px-3 py-2.5 font-bold text-right">Current Balance (৳)</th>
                <th className="px-3 py-2.5 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {corporateAccounts.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/40">
                  <td className="px-3 py-2.5">
                    <p className="font-bold text-slate-100">{c.name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{c.email}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-semibold text-slate-200">{c.contact}</p>
                    <span className="text-[10px] text-slate-400">{c.phone}</span>
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-amber-400">{c.discountPct}% Flat Off</td>
                  <td className="px-3 py-2.5 text-right font-mono">৳{c.creditLimit.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-400">৳{c.balance.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Travel Agents Tab */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {travelAgents.map(ta => (
            <div key={ta.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm">{ta.name}</h3>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-bold text-[10px]">
                  {ta.commission} Comm.
                </span>
              </div>
              <div className="space-y-1 text-slate-300">
                <p>Account Manager: <strong>{ta.contact}</strong></p>
                <p>Phone: <span className="font-mono text-slate-400">{ta.phone}</span></p>
                <p>Active In-House Bookings: <strong className="text-amber-400">{ta.activeBookings}</strong></p>
                <p>YTD Net Revenue: <strong className="text-emerald-400">৳{ta.totalRevenue.toLocaleString()}</strong></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leads Tab */}
      {activeTab === 'leads' && (
        <div className="space-y-3">
          {leads.map(l => (
            <div key={l.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase">{l.stage}</span>
                <h3 className="text-sm font-bold text-slate-100">{l.title}</h3>
                <p className="text-slate-400 text-xs">{l.client} • Expected Date: {l.date} • {l.expectedPax} Guests</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Estimated Value</span>
                <p className="text-base font-bold text-emerald-400">৳{l.expectedRevenue.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
