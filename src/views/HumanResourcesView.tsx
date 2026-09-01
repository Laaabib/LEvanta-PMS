import React, { useState } from 'react';
import {
  Users, Building, CalendarCheck, Clock, CheckCircle2,
  AlertCircle, Plus, Search, Filter, Mail, Phone, Shield
} from 'lucide-react';
import { rbacService } from '../services/rbacService';

export const HumanResourcesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'staff' | 'attendance' | 'roster'>('staff');
  const [searchTerm, setSearchTerm] = useState('');

  const users = rbacService.getUsers();

  const attendanceRecords = [
    { id: 'att-1', name: 'Shamima Akter', dept: 'Front Office', shift: 'Morning (07:00 - 15:30)', inTime: '06:55 AM', status: 'On Time' },
    { id: 'att-2', name: 'Kazi Farhan', dept: 'Restaurant', shift: 'General (10:00 - 19:00)', inTime: '09:58 AM', status: 'On Time' },
    { id: 'att-3', name: 'Rasheda Begum', dept: 'Housekeeping', shift: 'Morning (08:00 - 16:30)', inTime: '08:05 AM', status: 'Slight Delay' },
    { id: 'att-4', name: 'Tanvir Hossain', dept: 'Bar & Lounge', shift: 'Evening (15:00 - 23:30)', inTime: '—', status: 'Shift Pending' },
    { id: 'att-5', name: 'Kamrul Hasan', dept: 'Inventory', shift: 'Morning (09:00 - 18:00)', inTime: '08:50 AM', status: 'On Time' }
  ];

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100">Human Resources & Staff Directory</h1>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                HR & ROSTERS
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Staff directory, department allocations, biometric shift attendance, and duty rosters.
            </p>
          </div>
        </div>

        <button className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors shadow text-xs">
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'staff' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Staff Directory & Roles
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'attendance' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Biometric Shift Attendance
        </button>
      </div>

      {/* Directory Tab */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map(u => (
            <div key={u.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center space-x-3 hover:border-slate-700 transition-colors">
              <img
                src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'}
                alt={u.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-100 text-xs truncate">{u.name}</h3>
                <p className="text-[11px] text-amber-400 font-medium truncate">{u.roleName}</p>
                <p className="text-[10px] text-slate-400 truncate">{u.department}</p>
                <span className="text-[9px] text-slate-500 font-mono truncate block mt-0.5">{u.email}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5 font-bold">Staff Member</th>
                <th className="px-3 py-2.5 font-bold">Department</th>
                <th className="px-3 py-2.5 font-bold">Assigned Shift</th>
                <th className="px-3 py-2.5 font-bold">Clock In</th>
                <th className="px-3 py-2.5 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {attendanceRecords.map(att => (
                <tr key={att.id} className="hover:bg-slate-800/40">
                  <td className="px-3 py-2.5 font-bold text-slate-200">{att.name}</td>
                  <td className="px-3 py-2.5 text-slate-300">{att.dept}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-400">{att.shift}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-200">{att.inTime}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      att.status === 'On Time' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {att.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
