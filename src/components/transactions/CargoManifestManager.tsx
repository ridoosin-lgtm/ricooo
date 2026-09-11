import React, { useState } from 'react';
import { 
  Boxes, 
  Truck, 
  Plus, 
  Search, 
  Scale, 
  CheckCircle, 
  AlertTriangle, 
  Printer, 
  Edit3, 
  Trash2, 
  X, 
  ArrowDownCircle,
  FileText
} from 'lucide-react';
import { CargoItem, VoyageSchedule, Ship as ShipType, CargoCategoryMaster, CargoStatus } from '../../types';
import { db } from '../../services/dbService';

interface CargoManifestManagerProps {
  cargoItems: CargoItem[];
  schedules: VoyageSchedule[];
  ships: ShipType[];
  categories: CargoCategoryMaster[];
}

export const CargoManifestManager: React.FC<CargoManifestManagerProps> = ({
  cargoItems,
  schedules,
  ships,
  categories,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchedule, setFilterSchedule] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<CargoItem | null>(null);
  const [viewingManifestSlip, setViewingManifestSlip] = useState<CargoItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<CargoItem, 'id'>>({
    manifestNumber: '',
    scheduleId: schedules[0]?.id || '',
    category: 'Golongan IV (Mobil Pribadi / Sedan / Minibus)',
    vehiclePlateNumber: '',
    driverName: '',
    driverPhone: '',
    weightTon: 1.6,
    measuredWeightTon: 1.6,
    fare: 450000,
    deckLocation: 'Car Deck 1 (Upper)',
    status: 'Terdaftar',
    registeredAt: new Date().toISOString(),
    notes: '',
  });

  const openCreateModal = () => {
    setEditingCargo(null);
    const defaultCat = categories[3] || categories[0];
    setFormData({
      manifestNumber: 'MFS-2026-' + Math.floor(1000 + Math.random() * 9000),
      scheduleId: schedules[0]?.id || '',
      category: defaultCat?.name || 'Golongan IV (Mobil Pribadi / Sedan / Minibus)',
      vehiclePlateNumber: 'B ' + Math.floor(1000 + Math.random() * 9000) + ' ZXA',
      driverName: '',
      driverPhone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
      weightTon: defaultCat?.standardWeightTon || 1.6,
      measuredWeightTon: defaultCat?.standardWeightTon || 1.6,
      fare: defaultCat?.fare || 450000,
      deckLocation: 'Car Deck 1 (Upper)',
      status: 'Terdaftar',
      registeredAt: new Date().toISOString(),
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cargo: CargoItem) => {
    setEditingCargo(cargo);
    setFormData({
      manifestNumber: cargo.manifestNumber,
      scheduleId: cargo.scheduleId,
      category: cargo.category,
      vehiclePlateNumber: cargo.vehiclePlateNumber || '',
      driverName: cargo.driverName,
      driverPhone: cargo.driverPhone,
      weightTon: cargo.weightTon,
      measuredWeightTon: cargo.measuredWeightTon || cargo.weightTon,
      fare: cargo.fare,
      deckLocation: cargo.deckLocation,
      status: cargo.status,
      registeredAt: cargo.registeredAt,
      loadedAt: cargo.loadedAt,
      notes: cargo.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleCategoryChange = (catName: string) => {
    const found = categories.find(c => c.name === catName);
    setFormData({
      ...formData,
      category: catName as any,
      weightTon: found ? found.standardWeightTon : formData.weightTon,
      measuredWeightTon: found ? found.standardWeightTon : formData.measuredWeightTon,
      fare: found ? found.fare : formData.fare,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCargo) {
      db.updateCargo(editingCargo.id, formData);
    } else {
      db.createCargo(formData);
    }
    setIsModalOpen(false);
  };

  const handleSimulateWeighing = (cargo: CargoItem) => {
    // slight variation in real scale
    const weighed = parseFloat((cargo.weightTon * (0.98 + Math.random() * 0.05)).toFixed(2));
    db.updateCargo(cargo.id, {
      measuredWeightTon: weighed,
      status: 'Ditimbang',
    });
  };

  const handleLoadToShip = (cargo: CargoItem) => {
    db.updateCargo(cargo.id, {
      status: 'Dimuat (Loaded)',
      loadedAt: new Date().toISOString(),
    });
  };

  const handleDelete = (id: string) => {
    db.deleteCargo(id);
    setDeleteConfirmId(null);
  };

  const filteredCargo = cargoItems.filter((c) => {
    const matchSearch =
      c.manifestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.vehiclePlateNumber && c.vehiclePlateNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSchedule = filterSchedule === 'all' || c.scheduleId === filterSchedule;
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchSchedule && matchStatus;
  });

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900">Manifest Muatan Kendaraan & Kargo</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registrasi kendaraan, penimbangan jembatan timbang (weighbridge), penempatan dek, dan surat jalan kargo
          </p>
        </div>

        <button
          id="btn-add-cargo"
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Muatan / Kendaraan</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan No. Plat, pengemudi, atau nomor manifest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={filterSchedule}
          onChange={(e) => setFilterSchedule(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium w-full md:w-auto"
        >
          <option value="all">Semua Jadwal Trip</option>
          {schedules.map((s) => (
            <option key={s.id} value={s.id}>{s.tripNumber} ({s.dockName})</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium w-full md:w-auto"
        >
          <option value="all">Semua Status Muatan</option>
          <option value="Terdaftar">Terdaftar</option>
          <option value="Ditimbang">Ditimbang</option>
          <option value="Dimuat (Loaded)">Dimuat (Loaded)</option>
          <option value="Selesai Bongkar">Selesai Bongkar</option>
          <option value="Ditolak (Overweight)">Ditolak (Overweight)</option>
        </select>
      </div>

      {/* Cargo Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">No. Manifest & Kendaraan</th>
                <th className="py-3 px-4">Pengemudi & Kontak</th>
                <th className="py-3 px-4">Kategori Golongan</th>
                <th className="py-3 px-4">Tonase Timbang</th>
                <th className="py-3 px-4">Penempatan Dek</th>
                <th className="py-3 px-4">Tarif Retribusi</th>
                <th className="py-3 px-4">Status & Alur</th>
                <th className="py-3 px-4 text-center">Cetak Slip</th>
                <th className="py-3 px-4 text-center">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredCargo.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data muatan kargo.
                  </td>
                </tr>
              ) : (
                filteredCargo.map((c) => {
                  const sch = schedules.find(s => s.id === c.scheduleId);
                  const ship = sch ? ships.find(sh => sh.id === sch.shipId) : null;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-black text-slate-900 text-sm">{c.vehiclePlateNumber || 'NON-KENDARAAN'}</div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">{c.manifestNumber}</span>
                        <div className="text-[11px] text-slate-400 mt-0.5">{sch?.tripNumber} ({ship?.name})</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{c.driverName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{c.driverPhone}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 max-w-[170px] truncate" title={c.category}>
                          {c.category}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          <Scale className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.measuredWeightTon || c.weightTon} Ton</span>
                        </div>
                        {c.measuredWeightTon && c.measuredWeightTon !== c.weightTon && (
                          <div className="text-[10px] text-amber-600 font-medium">Hasil Timbang Jembatan</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {c.deckLocation}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-black text-emerald-700">
                        {formatIDR(c.fare)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="mb-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'Dimuat (Loaded)'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'Ditimbang'
                              ? 'bg-sky-100 text-sky-800'
                              : c.status === 'Selesai Bongkar'
                              ? 'bg-purple-100 text-purple-800'
                              : c.status === 'Ditolak (Overweight)'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.status}
                          </span>
                        </div>

                        {c.status === 'Terdaftar' && (
                          <button
                            type="button"
                            onClick={() => handleSimulateWeighing(c)}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline block"
                          >
                            + Timbang Sekarang
                          </button>
                        )}
                        {c.status === 'Ditimbang' && (
                          <button
                            type="button"
                            onClick={() => handleLoadToShip(c)}
                            className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700 block mt-1"
                          >
                            Muat ke Kapal
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewingManifestSlip(c)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 mx-auto"
                          title="Cetak Surat Jalan / Slip Manifest"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Slip</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="Ubah Muatan"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(c.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                            title="Hapus Muatan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Manifest Modal */}
      {viewingManifestSlip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100">
            <div className="bg-slate-900 text-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <span className="font-black text-sm tracking-wider uppercase">SURAT JALAN RETRIBUSI MUATAN</span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingManifestSlip(null)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3">
                <div className="text-xs text-slate-400">Nomor Registrasi Manifest</div>
                <div className="text-lg font-black tracking-wider font-mono text-blue-400">{viewingManifestSlip.manifestNumber}</div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Plat Nomor Kendaraan</span>
                  <div className="text-base font-black font-mono text-slate-900">{viewingManifestSlip.vehiclePlateNumber || 'NON-KENDARAAN'}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pengemudi (Driver)</span>
                  <div className="font-bold text-slate-900">{viewingManifestSlip.driverName}</div>
                  <div className="text-slate-500 font-mono text-[11px]">{viewingManifestSlip.driverPhone}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Klasifikasi Golongan Muatan</span>
                <div className="font-bold text-slate-900 text-sm">{viewingManifestSlip.category}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-dashed border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Berat Tonase (Aktual)</span>
                  <div className="text-sm font-black text-slate-900">{viewingManifestSlip.measuredWeightTon || viewingManifestSlip.weightTon} Ton</div>
                  <div className="text-[10px] text-emerald-600 font-bold">Lolos Uji Beban Kapal</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Dek Muat Kapal</span>
                  <div className="text-sm font-bold text-blue-700">{viewingManifestSlip.deckLocation}</div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                <span className="font-bold text-slate-700">Total Retribusi Muatan:</span>
                <span className="text-base font-black text-emerald-700">{formatIDR(viewingManifestSlip.fare)}</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Surat Jalan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingManifestSlip(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl text-center">
            <h3 className="text-base font-bold text-slate-900">Hapus Data Muatan</h3>
            <p className="text-xs text-slate-500 mt-1.5">
              Apakah Anda yakin ingin menghapus data muatan ini dari manifest kapal?
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Cargo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingCargo ? 'Ubah Data Muatan' : 'Tambah Muatan Kendaraan Baru'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Jadwal Trip Kapal</label>
                  <select
                    value={formData.scheduleId}
                    onChange={(e) => setFormData({ ...formData, scheduleId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {schedules.map((s) => (
                      <option key={s.id} value={s.id}>{s.tripNumber} ({s.dockName})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Plat Kendaraan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: B 9912 XZ"
                    value={formData.vehiclePlateNumber || ''}
                    onChange={(e) => setFormData({ ...formData, vehiclePlateNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Golongan / Jenis Muatan</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name} - ({c.standardWeightTon} Ton, {formatIDR(c.fare)})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pengemudi (Driver)</label>
                  <input
                    type="text"
                    required
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    placeholder="Nama Lengkap Sopir"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. HP / WhatsApp Sopir</label>
                  <input
                    type="text"
                    required
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Berat Tonase (Ton)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.weightTon}
                    onChange={(e) => setFormData({ ...formData, weightTon: parseFloat(e.target.value) || 0, measuredWeightTon: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penempatan Dek</label>
                  <select
                    value={formData.deckLocation}
                    onChange={(e) => setFormData({ ...formData, deckLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Car Deck 1 (Upper)">Car Deck 1 (Upper)</option>
                    <option value="Car Deck 2 (Lower)">Car Deck 2 (Lower)</option>
                    <option value="Main Deck (Truk Besar)">Main Deck (Truk Besar)</option>
                    <option value="Dek Khusus Kontainer">Dek Khusus Kontainer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Biaya Retribusi (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.fare}
                    onChange={(e) => setFormData({ ...formData, fare: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Muatan</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as CargoStatus })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Terdaftar">Terdaftar</option>
                  <option value="Ditimbang">Ditimbang</option>
                  <option value="Dimuat (Loaded)">Dimuat (Loaded)</option>
                  <option value="Selesai Bongkar">Selesai Bongkar</option>
                  <option value="Ditolak (Overweight)">Ditolak (Overweight)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
                >
                  Simpan Muatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
