import React, { useState } from 'react';
import { 
  Boxes, 
  Truck, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Scale, 
  DollarSign, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { CargoCategoryMaster, VehicleOrCargoCategory } from '../../types';
import { db } from '../../services/dbService';

interface CargoMasterProps {
  categories: CargoCategoryMaster[];
}

export const CargoMaster: React.FC<CargoMasterProps> = ({ categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Kendaraan' | 'Barang Kargo'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CargoCategoryMaster | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<CargoCategoryMaster, 'id'>>({
    code: '',
    name: 'Golongan IV (Mobil Pribadi / Sedan / Minibus)' as VehicleOrCargoCategory,
    categoryType: 'Kendaraan',
    standardWeightTon: 1.5,
    fare: 450000,
    description: '',
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      code: 'GOL-' + (categories.length + 1),
      name: 'Golongan IV (Mobil Pribadi / Sedan / Minibus)' as VehicleOrCargoCategory,
      categoryType: 'Kendaraan',
      standardWeightTon: 1.6,
      fare: 500000,
      description: 'Mobil pribadi / MPV / SUV panjang < 5 meter',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CargoCategoryMaster) => {
    setEditingCategory(cat);
    setFormData({
      code: cat.code,
      name: cat.name,
      categoryType: cat.categoryType,
      standardWeightTon: cat.standardWeightTon,
      fare: cat.fare,
      description: cat.description,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      db.updateCargoCategory(editingCategory.id, formData);
    } else {
      db.createCargoCategory(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    db.deleteCargoCategory(id);
    setDeleteConfirmId(null);
  };

  const filteredCategories = categories.filter((cat) => {
    const matchSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || cat.categoryType === filterType;
    return matchSearch && matchType;
  });

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900">Master Kategori & Tarif Muatan Kapal</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Klasifikasi golongan kendaraan (Golongan I s/d VII), kargo curah, serta standar berat tonase
          </p>
        </div>

        <button
          id="btn-add-cargo-cat"
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Muatan</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama golongan atau kode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium w-full md:w-auto"
        >
          <option value="all">Semua Tipe (Kendaraan & Kargo)</option>
          <option value="Kendaraan">Khusus Kendaraan</option>
          <option value="Barang Kargo">Khusus Barang Kargo / Kontainer</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Kode & Golongan Muatan</th>
                <th className="py-3 px-4">Klasifikasi Tipe</th>
                <th className="py-3 px-4">Standar Tonase Berat</th>
                <th className="py-3 px-4">Tarif Angkut Kapal</th>
                <th className="py-3 px-4">Deskripsi / Peruntukan</th>
                <th className="py-3 px-4 text-center">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{cat.name}</div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">{cat.code}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cat.categoryType === 'Kendaraan'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}>
                      {cat.categoryType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cat.standardWeightTon} Ton</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                    {formatIDR(cat.fare)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs">
                    {cat.description}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        title="Ubah Tarif"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(cat.id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl text-center">
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Kategori</h3>
            <p className="text-xs text-slate-500 mt-1.5">
              Apakah Anda yakin ingin menghapus kategori muatan ini?
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

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Ubah Kategori & Tarif' : 'Tambah Kategori Muatan Baru'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Golongan</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Klasifikasi</label>
                  <select
                    value={formData.categoryType}
                    onChange={(e) => setFormData({ ...formData, categoryType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Barang Kargo">Barang Kargo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kategori / Golongan</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Standar Berat (Ton)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.standardWeightTon}
                    onChange={(e) => setFormData({ ...formData, standardWeightTon: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tarif Tiket / Biaya (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.fare}
                    onChange={(e) => setFormData({ ...formData, fare: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi & Peruntukan</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="Keterangan ukuran, panjang dimensi, atau jenis muatan"
                />
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
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
