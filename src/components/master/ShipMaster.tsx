import React, { useState } from 'react';
import { 
  Ship as ShipIcon, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Anchor, 
  Filter, 
  Check, 
  X, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { Ship, ShipStatus } from '../../types';
import { db } from '../../services/dbService';

interface ShipMasterProps {
  ships: Ship[];
}

export const ShipMaster: React.FC<ShipMasterProps> = ({ ships }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShip, setEditingShip] = useState<Ship | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Ship, 'id'>>({
    code: '',
    name: '',
    type: 'Ferry Ro-Ro',
    passengerCapacity: 500,
    cargoCapacityDWT: 2000,
    maxVehicles: 80,
    deckCount: 3,
    yearBuilt: 2018,
    captainName: '',
    callSign: '',
    lengthMeters: 90,
    breadthMeters: 16,
    status: 'Aktif Berlayar',
    currentLocation: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingShip(null);
    setFormData({
      code: `KMP-0${ships.length + 1}`,
      name: '',
      type: 'Ferry Ro-Ro',
      passengerCapacity: 600,
      cargoCapacityDWT: 2500,
      maxVehicles: 100,
      deckCount: 3,
      yearBuilt: new Date().getFullYear(),
      captainName: 'Capt. ',
      callSign: 'YDC' + Math.floor(10 + Math.random() * 90),
      lengthMeters: 100,
      breadthMeters: 18,
      status: 'Aktif Berlayar',
      currentLocation: 'Pelabuhan Merak',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ship: Ship) => {
    setEditingShip(ship);
    setFormData({
      code: ship.code,
      name: ship.name,
      type: ship.type,
      passengerCapacity: ship.passengerCapacity,
      cargoCapacityDWT: ship.cargoCapacityDWT,
      maxVehicles: ship.maxVehicles,
      deckCount: ship.deckCount,
      yearBuilt: ship.yearBuilt,
      captainName: ship.captainName,
      callSign: ship.callSign,
      lengthMeters: ship.lengthMeters,
      breadthMeters: ship.breadthMeters,
      status: ship.status,
      currentLocation: ship.currentLocation || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.code.trim()) {
      setFormError('Nama Kapal dan Kode Kapal wajib diisi.');
      return;
    }

    if (formData.passengerCapacity <= 0 || formData.cargoCapacityDWT <= 0) {
      setFormError('Kapasitas Penumpang dan Kapasitas Muatan (DWT) harus lebih besar dari 0.');
      return;
    }

    if (editingShip) {
      db.updateShip(editingShip.id, formData);
    } else {
      db.createShip(formData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    db.deleteShip(id);
    setDeleteConfirmId(null);
  };

  // Filter & Search logic
  const filteredShips = ships.filter((ship) => {
    const matchSearch =
      ship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.captainName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || ship.type === filterType;
    const matchStatus = filterStatus === 'all' || ship.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">Master Data Armada Kapal</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {ships.length} Kapal Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data spesifikasi teknis, kapasitas muat DWT, batas penumpang, dan status armada kapal
          </p>
        </div>

        <button
          id="btn-add-ship"
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kapal Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama kapal, kode lambung, atau nama nahkoda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Semua Tipe Kapal</option>
            <option value="Ferry Ro-Ro">Ferry Ro-Ro</option>
            <option value="Cargo / Kontainer">Cargo / Kontainer</option>
            <option value="Kapal Motor Penumpang">Kapal Motor Penumpang</option>
            <option value="Fast Boat">Fast Boat</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif Berlayar">Aktif Berlayar</option>
            <option value="Sandar di Pelabuhan">Sandar di Pelabuhan</option>
            <option value="Docking / Perawatan">Docking / Perawatan</option>
            <option value="Siaga">Siaga</option>
          </select>
        </div>
      </div>

      {/* Ship Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Kapal & Identitas</th>
                <th className="py-3 px-4">Tipe & Dimensi</th>
                <th className="py-3 px-4">Kapasitas Penumpang</th>
                <th className="py-3 px-4">Beban Muatan (DWT)</th>
                <th className="py-3 px-4">Nahkoda & Call Sign</th>
                <th className="py-3 px-4">Status Armada</th>
                <th className="py-3 px-4 text-center">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredShips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ditemukan data kapal yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredShips.map((ship) => (
                  <tr key={ship.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0">
                          <ShipIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{ship.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">Kode: {ship.code} • Thn {ship.yearBuilt}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{ship.type}</div>
                      <div className="text-[11px] text-slate-500">{ship.lengthMeters}m x {ship.breadthMeters}m • {ship.deckCount} Dek</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{ship.passengerCapacity.toLocaleString()}</span>
                      <span className="text-slate-500 text-[11px]"> Orang Max</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ship.cargoCapacityDWT.toLocaleString()} Ton</div>
                      <div className="text-[11px] text-teal-600 font-medium">Kapasitas: {ship.maxVehicles} Kendaraan</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{ship.captainName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">CS: {ship.callSign}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ship.status === 'Aktif Berlayar'
                          ? 'bg-blue-100 text-blue-800'
                          : ship.status === 'Sandar di Pelabuhan'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ship.status}
                      </span>
                      {ship.currentLocation && (
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">{ship.currentLocation}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(ship)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Ubah Data Kapal"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(ship.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Kapal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Kapal</h3>
            <p className="text-xs text-slate-500 mt-1.5">
              Apakah Anda yakin ingin menghapus data kapal ini dari master data? Aksi ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Ship Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingShip ? 'Ubah Data Kapal' : 'Tambah Armada Kapal Baru'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isi spesifikasi teknis dan legalitas kapal laut
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kode Kapal
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Contoh: KMP-06"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Kapal
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: KMP Legundi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jenis / Tipe Kapal
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Ferry Ro-Ro">Ferry Ro-Ro (Roll-on/roll-off)</option>
                    <option value="Cargo / Kontainer">Cargo / Kontainer</option>
                    <option value="Kapal Motor Penumpang">Kapal Motor Penumpang (Pelni)</option>
                    <option value="Fast Boat">Fast Boat / Kapal Cepat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status Armada
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Aktif Berlayar">Aktif Berlayar</option>
                    <option value="Sandar di Pelabuhan">Sandar di Pelabuhan</option>
                    <option value="Docking / Perawatan">Docking / Perawatan</option>
                    <option value="Siaga">Siaga</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kapasitas Pax (Orang)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.passengerCapacity}
                    onChange={(e) => setFormData({ ...formData, passengerCapacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kapasitas Muatan (Ton DWT)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.cargoCapacityDWT}
                    onChange={(e) => setFormData({ ...formData, cargoCapacityDWT: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Maks. Kendaraan (Unit)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxVehicles}
                    onChange={(e) => setFormData({ ...formData, maxVehicles: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Nahkoda (Captain)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.captainName}
                    onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                    placeholder="Capt. Hendra Wijaya"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Call Sign Radio
                  </label>
                  <input
                    type="text"
                    value={formData.callSign}
                    onChange={(e) => setFormData({ ...formData, callSign: e.target.value })}
                    placeholder="YDCB"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tahun Pembuatan
                  </label>
                  <input
                    type="number"
                    value={formData.yearBuilt}
                    onChange={(e) => setFormData({ ...formData, yearBuilt: parseInt(e.target.value) || 2020 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Posisi / Dermaga Saat Ini
                  </label>
                  <input
                    type="text"
                    value={formData.currentLocation || ''}
                    onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                    placeholder="Dermaga 3 Eksekutif Merak"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Panjang (m)
                    </label>
                    <input
                      type="number"
                      value={formData.lengthMeters}
                      onChange={(e) => setFormData({ ...formData, lengthMeters: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Lebar (m)
                    </label>
                    <input
                      type="number"
                      value={formData.breadthMeters}
                      onChange={(e) => setFormData({ ...formData, breadthMeters: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                >
                  {editingShip ? 'Simpan Perubahan' : 'Tambah Kapal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
