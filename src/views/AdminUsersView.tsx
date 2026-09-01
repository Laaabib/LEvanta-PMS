import React, { useState, useEffect } from 'react';
import {
  Users, Shield, UserPlus, KeyRound, CheckCircle2, Lock, Edit3,
  Trash2, Plus, Check, X, ShieldAlert, AlertCircle, Sparkles, Filter, Search
} from 'lucide-react';
import { pmsService } from '../services/pmsService';
import { PmsDatabaseState } from '../services/mockPmsDatabase';
import { User, UserRoleName, PermissionKey } from '../types/pms';

export const AdminUsersView: React.FC = () => {
  const [db, setDb] = useState<PmsDatabaseState>(pmsService.getState());
  const currentUser = db.currentUser;

  const [activeTab, setActiveTab] = useState<'users' | 'permissions'>('users');
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<UserRoleName>('Front Desk');
  const [searchTerm, setSearchTerm] = useState('');

  // User Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // User Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRoleName>('Front Desk');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    return pmsService.subscribe(setDb);
  }, []);

  const rolesList: UserRoleName[] = [
    'Super Admin',
    'General Manager',
    'Front Office Manager',
    'Front Desk',
    'Accounts',
    'Housekeeping',
    'Maintenance',
    'Event Manager',
    'Restaurant Staff',
    'Management'
  ];

  const permissionDefinitions: { key: PermissionKey; label: string; description: string; category: string }[] = [
    { key: 'can_void_bills', label: 'Void Bills & Charges', description: 'Authorize cancellation/voiding of guest folios, restaurant & bar bills', category: 'Billing & Cashiering' },
    { key: 'can_void_payments', label: 'Void Payment Receipts', description: 'Authorize reversing payment receipts and cashier settlements', category: 'Billing & Cashiering' },
    { key: 'can_post_charges', label: 'Post Charges to Folios', description: 'Post room service, restaurant, banquet, or extra amenities', category: 'Billing & Cashiering' },
    { key: 'can_modify_reservations', label: 'Modify Bookings', description: 'Alter reservation dates, room assignments, rates, and guest details', category: 'Reservations & Front Desk' },
    { key: 'can_delete_reservations', label: 'Cancel / Delete Bookings', description: 'Cancel or purge confirmed and unconfirmed reservations', category: 'Reservations & Front Desk' },
    { key: 'can_checkin_checkout', label: 'Guest Check-In / Check-Out', description: 'Execute guest arrivals, registration cards, and departures', category: 'Reservations & Front Desk' },
    { key: 'can_run_night_audit', label: 'Execute Night Audit', description: 'Trigger manual day close, roll business date & post room charges', category: 'Operations & Auditing' },
    { key: 'can_manage_rooms', label: 'Manage Room Inventory', description: 'Add, modify, and delete hotel rooms and floor inventory', category: 'Administration' },
    { key: 'can_manage_halls', label: 'Manage Convention Halls', description: 'Add, modify, and delete banquet halls, meeting rooms, and venues', category: 'Administration' },
    { key: 'can_manage_users', label: 'Manage Staff Accounts', description: 'Create, update, and remove system staff user logins', category: 'Administration' },
    { key: 'can_manage_roles', label: 'Manage Role Permissions', description: 'Alter system-wide permission sets for security roles', category: 'Administration' },
    { key: 'can_view_reports', label: 'View Financial & Operational Reports', description: 'Access revenue reports, manager flash summaries, and tax ledgers', category: 'Operations & Auditing' },
  ];

  const canManageUsers = pmsService.hasPermission('can_manage_users');
  const canManageRoles = pmsService.hasPermission('can_manage_roles');

  const filteredUsers = db.users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddUser = () => {
    setName('');
    setEmail('');
    setRole('Front Desk');
    setFormError('');
    setIsAddUserOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setFormError('');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim() || !email.trim()) {
      setFormError('Staff name and email/login are required.');
      return;
    }
    try {
      pmsService.addUser({ name: name.trim(), email: email.trim(), role, active: true });
      setIsAddUserOpen(false);
      setFormSuccess(`User account for "${name}" created successfully!`);
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create user.');
    }
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError('');
    try {
      pmsService.updateUser(editingUser.id, {
        name: name.trim(),
        email: email.trim(),
        role
      });
      setEditingUser(null);
      setFormSuccess(`User "${name}" updated successfully!`);
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update user.');
    }
  };

  const handleDeleteUser = () => {
    if (!deletingUser) return;
    try {
      pmsService.deleteUser(deletingUser.id);
      setFormSuccess(`User "${deletingUser.name}" removed from system.`);
      setDeletingUser(null);
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err: any) {
      alert(`Delete Error: ${err.message}`);
    }
  };

  const handleTogglePermission = (roleName: UserRoleName, permKey: PermissionKey) => {
    if (!canManageRoles) return;
    const currentPerms = db.rolePermissions[roleName] || [];
    let updated: PermissionKey[];
    if (currentPerms.includes(permKey)) {
      updated = currentPerms.filter(p => p !== permKey);
    } else {
      updated = [...currentPerms, permKey];
    }
    pmsService.updateRolePermissions(roleName, updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Staff Access & RBAC Permissions</h1>
              <p className="text-sm text-slate-300">
                Manage user credentials, assign system roles, and configure granular permissions (Void bills, void payments, delete reservations, manage rooms & halls).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 px-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs flex items-center gap-2">
            <span className="text-slate-400">Current Session:</span>
            <span className="font-bold text-amber-300">{currentUser.name}</span>
            <span className="px-1.5 py-0.5 bg-indigo-900/80 text-indigo-300 text-[10px] font-semibold rounded">
              {currentUser.role}
            </span>
          </div>

          {activeTab === 'users' && (
            <button
              onClick={handleOpenAddUser}
              disabled={!canManageUsers}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-1.5 transition ${
                canManageUsers
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Add Staff User
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {formSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Staff User Accounts ({db.users.length})
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'permissions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Role Permission Matrix & Void Privileges
        </button>
      </div>

      {activeTab === 'users' ? (
        /* Users Tab Content */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff name, email, or role..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredUsers.length}</strong> active staff members
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Login Email</th>
                  <th className="px-4 py-3">System Role</th>
                  <th className="px-4 py-3">Key Privileges</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredUsers.map(u => {
                  const isCurrent = u.id === currentUser.id;
                  const perms = db.rolePermissions[u.role] || [];
                  const canVoid = perms.includes('can_void_bills');
                  const canNightAudit = perms.includes('can_run_night_audit');
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div>{u.name}</div>
                          {isCurrent && (
                            <span className="text-[10px] text-amber-500 font-semibold">(Current Logged-in User)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">
                        {u.email}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-[11px] border border-slate-200 dark:border-slate-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {canVoid && (
                            <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-semibold rounded">
                              Void Bills
                            </span>
                          )}
                          {canNightAudit && (
                            <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold rounded">
                              Night Audit
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] rounded">
                            {perms.length} perms
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => pmsService.setCurrentUser(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            isCurrent
                              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isCurrent ? 'Active User' : 'Switch User'}
                        </button>
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          disabled={!canManageUsers}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Edit User"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          disabled={!canManageUsers || db.users.length <= 1}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Permission Matrix Content */
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Role Permission Matrix Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Check or uncheck capabilities to instantly grant or revoke permissions for each role across the resort PMS.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Target Role:</span>
              <select
                value={selectedRoleForEdit}
                onChange={e => setSelectedRoleForEdit(e.target.value as UserRoleName)}
                className="py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              >
                {rolesList.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Permission / Action</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Functional Scope</th>
                    <th className="px-4 py-3.5 text-center">
                      Granted to <span className="text-indigo-600 dark:text-indigo-400">{selectedRoleForEdit}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {permissionDefinitions.map(def => {
                    const isGranted = (db.rolePermissions[selectedRoleForEdit] || []).includes(def.key);
                    return (
                      <tr key={def.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          {def.label}
                          <div className="font-mono text-[10px] text-slate-400 font-normal">{def.key}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-semibold">
                            {def.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 max-w-sm text-xs">
                          {def.description}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isGranted}
                            disabled={!canManageRoles || selectedRoleForEdit === 'Super Admin'}
                            onChange={() => handleTogglePermission(selectedRoleForEdit, def.key)}
                            className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {(isAddUserOpen || editingUser) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                {editingUser ? `Edit Staff Account: ${editingUser.name}` : 'Register New Staff Member'}
              </h3>
              <button
                onClick={() => { setIsAddUserOpen(false); setEditingUser(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-500/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Nazmul Hossain"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Email / Login ID *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g., nazmul@cculbresort.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">System Role *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRoleName)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold"
                >
                  {rolesList.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsAddUserOpen(false); setEditingUser(null); }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  {editingUser ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Remove Staff Account: {deletingUser.name}?
                </h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to delete this staff member login ({deletingUser.email})?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
