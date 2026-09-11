import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Anchor, 
  Clock, 
  DollarSign, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { Port, Route } from '../../types';
import { db } from '../../services/dbService';

interface PortRouteMasterProps {
  ports: Port[];
  routes: Route[];
}

export const PortRouteMaster: React.FC<PortRouteMasterProps> = ({ ports, routes }) => {
  const [activeSubTab, setActiveSubTab] = useState<'routes' | 'ports'>('routes');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isPortModalOpen, setIsPortModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);

  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ type: 'port' | 'route'; id: string; name: string } | null>(null);

  // Form Port
  const [portForm, setPortForm] = useState<Omit<Port, 'id'>>({
    code: '',
    name: '',
    city: '',
    province: '',
    dockCount: 4,
    latitude: 0,
    longitude: 0,
    activeDocks: ['Dermaga 1', 'Dermaga 2'],
  });

  // Form Route
  const [routeForm, setRouteForm] = useState<Omit<Route, 'id'>>({
    code: '',
    name: '',
    originPortId: ports[0]?.id || '',
    destinationPortId: ports[1]?.id || '',
    distanceNm: 15,
    estimatedDurationHours: 1.5,
    baseFarePassenger: 25000,
    baseFareCargoPerTon: 150000,
  });

  // Open Port Modal
  const openCreatePortModal = () => {
    setEditingPort(null);
    setPortForm({
      code: 'PLB-' + Math.floor(10 + Math.random() * 90),
      name: '',
      city: '',
      province: '',
      dockCount: 4,
      latitude: 0,
      longitude: 0,
      activeDocks: ['Dermaga 1', 'Dermaga 2', 'Dermaga 3'],
    });
    setIsPortModalOpen(true);
  };

  const openEditPortModal = (port: Port) => {
    setEditingPort(port);
    setPortForm({
      code: port.code,
      name: port.name,
      city: port.city,
      province: port.province,
      dockCount: port.dockCount,
      latitude: port.latitude,
      longitude: port.longitude,
      activeDocks: port.activeDocks || [],
    });
    setIsPortModalOpen(true);
  };

  // Open Route Modal
  const openCreateRouteModal = () => {
    setEditingRoute(null);
    setRouteForm({
      code: 'RTE-' + Math.floor(100 + Math.random() * 900),
      name: '',
      originPortId: ports[0]?.id || '',
      destinationPortId: ports[1]?.id || '',
      distanceNm: 20,
      estimatedDurationHours: 2.0,
      baseFarePassenger: 28000,
      baseFareCargoPerTon: 180000,
    });
    setIsRouteModalOpen(true);
  };

  const openEditRouteModal = (route: Route) => {
    setEditingRoute(route);
    setRouteForm({
      code: route.code,
      name: route.name,
      originPortId: route.originPortId,
      destinationPortId: route.destinationPortId,
      distanceNm: route.distanceNm,
      estimatedDurationHours: route.estimatedDurationHours,
      baseFarePassenger: route.baseFarePassenger,
      baseFareCargoPerTon: route.baseFareCargoPerTon,
    });
    setIsRouteModalOpen(true);
  };

  const handleSavePort = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPort) {
      db.updatePort(editingPort.id, portForm);
    } else {
      db.createPort(portForm);
    }
    setIsPortModalOpen(false);
  };

  const handleSaveRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const origin = ports.find(p => p.id === routeForm.originPortId)?.name || 'Asal';
    const dest = ports.find(p => p.id === routeForm.destinationPortId)?.name || 'Tujuan';
    const autoName = `${origin.replace('Pelabuhan ', '')} - ${dest.replace('Pelabuhan ', '')}`;
    
    const payload = {
      ...routeForm,
      name: routeForm.name.trim() || autoName,
    };

    if (editingRoute) {
      db.updateRoute(editingRoute.id, payload);
    } else {
      db.createRoute(payload);
    }
    setIsRouteModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'port') {
      db.deletePort(deleteTarget.id);
    } else {
      db.deleteRoute(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900">Master Pelabuhan & Rute Penyeberangan</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen terminal dermaga, koordinat pelabuhan, jarak mil laut, dan tarif dasar lintasan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'routes' ? (
            <button
              id="btn-add-route"
              type="button"
              onClick={openCreateRouteModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rute Baru</span>
            </button>
          ) : (
            <button
              id="btn-add-port"
              type="button"
              onClick={openCreatePortModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pelabuhan</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('routes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'routes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Rute Penyeberangan ({routes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'ports'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Daftar Pelabuhan & Dermaga ({ports.length})</span>
        </button>
      </div>

      {/* Tab Content: Routes */}
      {activeSubTab === 'routes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Kode & Nama Lintasan</th>
                  <th className="py-3 px-4">Pelabuhan Asal ➔ Tujuan</th>
                  <th className="py-3 px-4">Jarak & Durasi Tempuh</th>
                  <th className="py-3 px-4">Tarif Dasar Penumpang</th>
                  <th className="py-3 px-4">Tarif Dasar Kargo/Ton</th>
                  <th className="py-3 px-4 text-center">Aksi (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {routes.map((route) => {
                  const origin = ports.find(p => p.id === route.originPortId);
                  const dest = ports.find(p => p.id === route.destinationPortId);
                  return (
                    <tr key={route.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{route.name}</div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">{route.code}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span>{origin?.name || 'Pelabuhan Asal'}</span>
                          <span className="text-blue-600">➔</span>
                          <span>{dest?.name || 'Pelabuhan Tujuan'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {origin?.province} ke {dest?.province}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{route.distanceNm} Mil Laut (NM)</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>± {route.estimatedDurationHours} Jam Pelayaran</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatIDR(route.baseFarePassenger)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-teal-700">
                        {formatIDR(route.baseFareCargoPerTon)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditRouteModal(route)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="Ubah Rute"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ type: 'route', id: route.id, name: route.name })}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                            title="Hapus Rute"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Ports */}
      {activeSubTab === 'ports' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Pelabuhan & Kode</th>
                  <th className="py-3 px-4">Kota & Wilayah</th>
                  <th className="py-3 px-4">Jumlah Dermaga</th>
                  <th className="py-3 px-4">Dermaga Aktif</th>
                  <th className="py-3 px-4 text-center">Aksi (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {ports.map((port) => (
                  <tr key={port.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{port.name}</div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">{port.code}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{port.city}</div>
                      <div className="text-[11px] text-slate-400">{port.province}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{port.dockCount}</span> Dermaga
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {port.activeDocks?.map((d, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditPortModal(port)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          title="Ubah Pelabuhan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'port', id: port.id, name: port.name })}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus Pelabuhan"
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
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus</h3>
            <p className="text-xs text-slate-500 mt-1.5">
              Hapus {deleteTarget.type === 'port' ? 'Pelabuhan' : 'Rute'} "{deleteTarget.name}"?
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route Modal */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingRoute ? 'Ubah Rute Penyeberangan' : 'Tambah Rute Penyeberangan Baru'}
              </h3>
              <button type="button" onClick={() => setIsRouteModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSaveRoute} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Rute</label>
                  <input
                    type="text"
                    required
                    value={routeForm.code}
                    onChange={(e) => setRouteForm({ ...routeForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Rute (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Merak - Bakauheni"
                    value={routeForm.name}
                    onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pelabuhan Asal</label>
                  <select
                    value={routeForm.originPortId}
                    onChange={(e) => setRouteForm({ ...routeForm, originPortId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pelabuhan Tujuan</label>
                  <select
                    value={routeForm.destinationPortId}
                    onChange={(e) => setRouteForm({ ...routeForm, destinationPortId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jarak (Mil Laut / NM)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={routeForm.distanceNm}
                    onChange={(e) => setRouteForm({ ...routeForm, distanceNm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimasi Waktu (Jam)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={routeForm.estimatedDurationHours}
                    onChange={(e) => setRouteForm({ ...routeForm, estimatedDurationHours: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tarif Dasar Penumpang (Rp)</label>
                  <input
                    type="number"
                    required
                    value={routeForm.baseFarePassenger}
                    onChange={(e) => setRouteForm({ ...routeForm, baseFarePassenger: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tarif Kargo per Ton (Rp)</label>
                  <input
                    type="number"
                    required
                    value={routeForm.baseFareCargoPerTon}
                    onChange={(e) => setRouteForm({ ...routeForm, baseFareCargoPerTon: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRouteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Simpan Rute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Port Modal */}
      {isPortModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingPort ? 'Ubah Data Pelabuhan' : 'Tambah Pelabuhan Baru'}
              </h3>
              <button type="button" onClick={() => setIsPortModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSavePort} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Pelabuhan</label>
                  <input
                    type="text"
                    required
                    value={portForm.code}
                    onChange={(e) => setPortForm({ ...portForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pelabuhan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pelabuhan Merak"
                    value={portForm.name}
                    onChange={(e) => setPortForm({ ...portForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    required
                    value={portForm.city}
                    onChange={(e) => setPortForm({ ...portForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Provinsi</label>
                  <input
                    type="text"
                    required
                    value={portForm.province}
                    onChange={(e) => setPortForm({ ...portForm, province: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Dermaga Sandar</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={portForm.dockCount}
                  onChange={(e) => setPortForm({ ...portForm, dockCount: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPortModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Simpan Pelabuhan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
