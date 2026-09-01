import React, { useState } from 'react';
import {
  BedDouble, Plus, Search, Filter, Trash2, Edit3, CheckCircle2,
  AlertCircle, Building, Layers, Sparkles, Key, Check, X, ShieldAlert
} from 'lucide-react';
import { pmsService } from '../services/pmsService';
import { Room, OperationalStatus, HousekeepingStatus } from '../types/pms';

export const AdminRoomsView: React.FC = () => {
  const db = pmsService.getState();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

  // Form State
  const [roomNumber, setRoomNumber] = useState('');
  const [roomTypeId, setRoomTypeId] = useState(db.roomTypes[0]?.id || '');
  const [floor, setFloor] = useState<number>(1);
  const [building, setBuilding] = useState('Main Resort Complex');
  const [wing, setWing] = useState('East Garden Wing');
  const [isSmoking, setIsSmoking] = useState(false);
  const [keyCardCode, setKeyCardCode] = useState('');
  const [featuresStr, setFeaturesStr] = useState('Wi-Fi, Balcony, Smart TV, Mini Fridge, Air Conditioned');
  const [amenitiesStr, setAmenitiesStr] = useState('King Bed, Rain Shower, Safety Deposit Locker, Electric Kettle');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const canManageRooms = pmsService.hasPermission('can_manage_rooms');

  // Filtered rooms
  const filteredRooms = db.rooms.filter(room => {
    const matchSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.roomTypeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.wing || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchFloor = selectedFloor === 'all' || String(room.floor) === selectedFloor;
    const matchType = selectedType === 'all' || room.roomTypeId === selectedType;
    return matchSearch && matchFloor && matchType;
  });

  const resetForm = () => {
    setRoomNumber('');
    setRoomTypeId(db.roomTypes[0]?.id || '');
    setFloor(1);
    setBuilding('Main Resort Complex');
    setWing('East Garden Wing');
    setIsSmoking(false);
    setKeyCardCode('');
    setFeaturesStr('Wi-Fi, Balcony, Smart TV, Mini Fridge, Air Conditioned');
    setAmenitiesStr('King Bed, Rain Shower, Safety Deposit Locker, Electric Kettle');
    setFormError('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setRoomTypeId(room.roomTypeId);
    setFloor(room.floor);
    setBuilding(room.building || 'Main Resort Complex');
    setWing(room.wing || 'East Garden Wing');
    setIsSmoking(room.isSmoking || false);
    setKeyCardCode(room.keyCardCode || `KC-${room.roomNumber}`);
    setFeaturesStr(room.features?.join(', ') || '');
    setAmenitiesStr(room.amenities?.join(', ') || '');
    setFormError('');
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!roomNumber.trim()) {
      setFormError('Room number is required.');
      return;
    }

    const features = (featuresStr || '').split(',').map(s => s.trim()).filter(Boolean);
    const amenities = (amenitiesStr || '').split(',').map(s => s.trim()).filter(Boolean);

    try {
      pmsService.addRoom({
        roomNumber: roomNumber.trim(),
        roomTypeId,
        floor: Number(floor),
        building,
        wing,
        features,
        amenities,
        isSmoking,
        keyCardCode: keyCardCode.trim() || `KC-${roomNumber.trim()}`
      });

      setIsAddModalOpen(false);
      setFormSuccess(`Room ${roomNumber} added to inventory successfully!`);
      setTimeout(() => setFormSuccess(''), 3000);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create room.');
    }
  };

  const handleUpdateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    setFormError('');

    const features = (featuresStr || '').split(',').map(s => s.trim()).filter(Boolean);
    const amenities = (amenitiesStr || '').split(',').map(s => s.trim()).filter(Boolean);

    try {
      pmsService.updateRoom(editingRoom.id, {
        roomNumber: roomNumber.trim(),
        roomTypeId,
        floor: Number(floor),
        building,
        wing,
        features,
        amenities,
        isSmoking,
        keyCardCode: keyCardCode.trim() || `KC-${roomNumber.trim()}`
      });

      setEditingRoom(null);
      setFormSuccess(`Room ${roomNumber} updated successfully!`);
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update room.');
    }
  };

  const handleDeleteRoom = () => {
    if (!deletingRoom) return;
    try {
      pmsService.deleteRoom(deletingRoom.id);
      setFormSuccess(`Room ${deletingRoom.roomNumber} removed from inventory.`);
      setDeletingRoom(null);
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err: any) {
      alert(`Delete Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <BedDouble className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Room Inventory Administration</h1>
              <p className="text-sm text-slate-300">
                Add, modify, and delete physical rooms, floor plans, keycard assignments, and amenity setups.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={!canManageRooms}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition ${
            canManageRooms
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add New Room
        </button>
      </div>

      {/* Success Alert */}
      {formSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by room number, type, wing..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedFloor}
              onChange={e => setSelectedFloor(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="all">All Floors</option>
              <option value="1">1st Floor</option>
              <option value="2">2nd Floor</option>
              <option value="3">3rd Floor</option>
              <option value="4">4th Floor</option>
            </select>

            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="all">All Room Types</option>
              {db.roomTypes.map(rt => (
                <option key={rt.id} value={rt.id}>{rt.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredRooms.length}</strong> of {db.rooms.length} Rooms
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Room #</th>
                <th className="px-4 py-3.5">Room Type & Category</th>
                <th className="px-4 py-3.5">Floor & Wing</th>
                <th className="px-4 py-3.5">Base Rate</th>
                <th className="px-4 py-3.5">KeyCard Code</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Features & Amenities</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No rooms found matching your search filters.
                  </td>
                </tr>
              ) : (
                filteredRooms.map(room => {
                  const type = db.roomTypes.find(t => t.id === room.roomTypeId);
                  return (
                    <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3.5 font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-mono font-bold">
                          {room.roomNumber}
                        </span>
                        {room.isSmoking && (
                          <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 text-[10px] rounded font-semibold">
                            Smoking
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{room.roomTypeName}</div>
                        <div className="text-[11px] text-slate-400">{type?.bedType || 'King Bed'} • Max {type?.maxAdults || 2} Adults</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div>Floor {room.floor}</div>
                        <div className="text-[11px] text-slate-400">{room.wing || 'Main Wing'}</div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                        ৳{(type?.basePrice || 7500).toLocaleString()}<span className="text-[10px] font-normal text-slate-400">/night</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">
                        {room.keyCardCode || `KC-${room.roomNumber}`}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          room.operationalStatus === 'Occupied'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : room.operationalStatus === 'Reserved'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {room.operationalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <div className="truncate text-[11px] text-slate-500" title={room.features?.join(', ')}>
                          {room.features?.slice(0, 3).join(', ')}
                          {(room.features?.length || 0) > 3 ? '...' : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(room)}
                          disabled={!canManageRooms}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Edit Room"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingRoom(room)}
                          disabled={!canManageRooms}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Delete Room"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Room Modal */}
      {(isAddModalOpen || editingRoom) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-indigo-600" />
                {editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add New Room to Resort'}
              </h3>
              <button
                onClick={() => { setIsAddModalOpen(false); setEditingRoom(null); }}
                className="text-slate-400 hover:text-slate-600 text-lg"
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

            <form onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 205 or 401"
                    value={roomNumber}
                    onChange={e => setRoomNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Room Type *</label>
                  <select
                    value={roomTypeId}
                    onChange={e => setRoomTypeId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {db.roomTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>{rt.name} (৳{rt.basePrice.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Floor Level *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={floor}
                    onChange={e => setFloor(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Resort Wing</label>
                  <select
                    value={wing}
                    onChange={e => setWing(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="East Garden Wing">East Garden Wing</option>
                    <option value="West Lake Wing">West Lake Wing</option>
                    <option value="Padma View Wing">Padma View Wing</option>
                    <option value="VIP Presidential Block">VIP Presidential Block</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">KeyCard NFC Code</label>
                  <input
                    type="text"
                    placeholder={`KC-${roomNumber || '101'}`}
                    value={keyCardCode}
                    onChange={e => setKeyCardCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Features (comma separated)</label>
                <input
                  type="text"
                  value={featuresStr}
                  onChange={e => setFeaturesStr(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Amenities (comma separated)</label>
                <input
                  type="text"
                  value={amenitiesStr}
                  onChange={e => setAmenitiesStr(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="smokingCheck"
                  checked={isSmoking}
                  onChange={e => setIsSmoking(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="smokingCheck" className="text-slate-700 dark:text-slate-300 font-medium">
                  Designated Smoking Room
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingRoom(null); }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  {editingRoom ? 'Save Room Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Room {deletingRoom.roomNumber}?
                </h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to permanently remove Room {deletingRoom.roomNumber} ({deletingRoom.roomTypeName}) from the inventory?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300">
              <p>• Cannot delete rooms with active in-house guests.</p>
              <p>• Cannot delete rooms assigned to upcoming reservations.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingRoom(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition"
              >
                Confirm Delete Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
