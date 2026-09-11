import React, { useState } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Navigation, 
  Ship, 
  Users, 
  Boxes, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Play, 
  Anchor,
  Wind
} from 'lucide-react';
import { VoyageSchedule, Ship as ShipType, Route, ScheduleStatus, PassengerTicket, CargoItem } from '../../types';
import { db } from '../../services/dbService';

interface ScheduleManagerProps {
  schedules: VoyageSchedule[];
  ships: ShipType[];
  routes: Route[];
  passengers: PassengerTicket[];
  cargoItems: CargoItem[];
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  schedules,
  ships,
  routes,
  passengers,
  cargoItems,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<VoyageSchedule | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<VoyageSchedule, 'id'>>({
    tripNumber: '',
    shipId: ships[0]?.id || '',
    routeId: routes[0]?.id || '',
    dockName: 'Dermaga 3 Eksekutif',
    departureTime: new Date().toISOString().slice(0, 16),
    estimatedArrivalTime: new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 16),
    status: 'Terjadwal',
    weatherCondition: 'Normal / Laut Tenang',
    notes: '',
  });

  const openCreateModal = () => {
    setEditingSchedule(null);
    const now = new Date();
    const est = new Date(now.getTime() + 2 * 3600000);
    setFormData({
      tripNumber: 'VOY-' + Math.floor(100 + Math.random() * 900),
      shipId: ships[0]?.id || '',
      routeId: routes[0]?.id || '',
      dockName: 'Dermaga 3 Eksekutif',
      departureTime: now.toISOString().slice(0, 16),
      estimatedArrivalTime: est.toISOString().slice(0, 16),
      status: 'Terjadwal',
      weatherCondition: 'Normal / Laut Tenang',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sch: VoyageSchedule) => {
    setEditingSchedule(sch);
    setFormData({
      tripNumber: sch.tripNumber,
      shipId: sch.shipId,
      routeId: sch.routeId,
      dockName: sch.dockName,
      departureTime: sch.departureTime.slice(0, 16),
      estimatedArrivalTime: sch.estimatedArrivalTime.slice(0, 16),
      status: sch.status,
      weatherCondition: sch.weatherCondition,
      notes: sch.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchedule) {
      db.updateSchedule(editingSchedule.id, formData);
    } else {
      db.createSchedule(formData);
    }
    setIsModalOpen(false);
  };

  const handleUpdateStatus = (sch: VoyageSchedule, newStatus: ScheduleStatus) => {
    const updates: Partial<VoyageSchedule> = { status: newStatus };
    if (newStatus === 'Berlayar' && !sch.actualDepartureTime) {
      updates.actualDepartureTime = new Date().toISOString();
      // update ship status to sailing
      db.updateShip(sch.shipId, { status: 'Aktif Berlayar' });
    } else if (newStatus === 'Tiba') {
      updates.actualArrivalTime = new Date().toISOString();
      db.updateShip(sch.shipId, { status: 'Sandar di Pelabuhan' });
    }
    db.updateSchedule(sch.id, updates);
  };

  const handleDelete = (id: string) => {
    db.deleteSchedule(id);
    setDeleteConfirmId(null);
  };

  const filteredSchedules = schedules.filter((sch) => {
    const matchSearch =
      sch.tripNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.dockName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || sch.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: ScheduleStatus) => {
    switch (status) {
      case 'Berlayar':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 flex items-center gap-1"><Play className="w-3 h-3 fill-current" /> Berlayar</span>;
      case 'Boarding':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Proses Boarding</span>;
      case 'Terjadwal':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Terjadwal</span>;
      case 'Tiba':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Tiba / Selesai</span>;
      case 'Ditunda (Cuaca)':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">Ditunda (Cuaca)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900">Jadwal & Perjalanan Kapal (Voyage Schedules)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola trip pelayaran, jadwal keberangkatan (ETD), kedatangan (ETA), serta kendali status berlayar
          </p>
        </div>

        <button
          id="btn-add-schedule"
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Jadwal Pelayaran Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan No. Trip Pelayaran atau Dermaga..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium w-full md:w-auto"
        >
          <option value="all">Semua Status Pelayaran</option>
          <option value="Terjadwal">Terjadwal</option>
          <option value="Boarding">Boarding</option>
          <option value="Berlayar">Berlayar</option>
          <option value="Tiba">Tiba</option>
          <option value="Ditunda (Cuaca)">Ditunda (Cuaca)</option>
        </select>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">No. Trip & Kapal Bertugas</th>
                <th className="py-3 px-4">Rute Penyeberangan</th>
                <th className="py-3 px-4">Waktu Keberangkatan & ETA</th>
                <th className="py-3 px-4">Okupansi Muatan Real-Time</th>
                <th className="py-3 px-4">Status & Cuaca</th>
                <th className="py-3 px-4 text-center">Update Status Cepat</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredSchedules.map((sch) => {
                const ship = ships.find(s => s.id === sch.shipId);
                const route = routes.find(r => r.id === sch.routeId);

                // compute real-time numbers for this schedule
                const paxCount = passengers.filter(p => p.scheduleId === sch.id && p.status !== 'Batal').length;
                const cargoTon = cargoItems
                  .filter(c => c.scheduleId === sch.id && c.status !== 'Ditolak (Overweight)')
                  .reduce((acc, c) => acc + c.weightTon, 0);

                const paxPercent = Math.min(100, Math.round((paxCount / (ship?.passengerCapacity || 1)) * 100));
                const cargoPercent = Math.min(100, Math.round((cargoTon / (ship?.cargoCapacityDWT || 1)) * 100));

                return (
                  <tr key={sch.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{sch.tripNumber}</div>
                      <div className="flex items-center gap-1.5 text-blue-700 font-semibold mt-0.5">
                        <Ship className="w-3.5 h-3.5" />
                        <span>{ship?.name || 'Kapal Tidak Ditemukan'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">Dermaga: {sch.dockName}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-blue-600" />
                        <span>{route?.name || 'Rute'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{route?.distanceNm} NM • ±{route?.estimatedDurationHours} Jam</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        ETD: {new Date(sch.departureTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                      <div className="text-[11px] text-slate-500">
                        ETA: {new Date(sch.estimatedArrivalTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(sch.departureTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1 max-w-[140px]">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                          <span>Pax: {paxCount}/{ship?.passengerCapacity}</span>
                          <span>{paxPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full bg-sky-500" style={{ width: `${paxPercent}%` }} />
                        </div>

                        <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                          <span>DWT: {cargoTon.toFixed(1)}/{ship?.cargoCapacityDWT}T</span>
                          <span>{cargoPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full bg-teal-500" style={{ width: `${cargoPercent}%` }} />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="mb-1">{getStatusBadge(sch.status)}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Wind className="w-3 h-3 text-slate-400" />
                        <span>{sch.weatherCondition}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {sch.status === 'Terjadwal' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(sch, 'Boarding')}
                            className="px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 text-[10px] font-bold"
                          >
                            Mulai Boarding
                          </button>
                        )}
                        {sch.status === 'Boarding' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(sch, 'Berlayar')}
                            className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-bold flex items-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" /> Berangkat
                          </button>
                        )}
                        {sch.status === 'Berlayar' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(sch, 'Tiba')}
                            className="px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-bold flex items-center gap-1"
                          >
                            <Anchor className="w-2.5 h-2.5" /> Sandar / Tiba
                          </button>
                        )}
                        {sch.status !== 'Ditunda (Cuaca)' && sch.status !== 'Tiba' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(sch, 'Ditunda (Cuaca)')}
                            className="px-1.5 py-1 rounded bg-slate-100 text-slate-600 hover:text-rose-600 text-[10px]"
                            title="Tunda Keberangkatan karena Cuaca"
                          >
                            Tunda
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(sch)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          title="Ubah Jadwal"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(sch.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus Jadwal"
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

      {/* Delete Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl text-center">
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Jadwal</h3>
            <p className="text-xs text-slate-500 mt-1.5">
              Apakah Anda yakin ingin menghapus jadwal trip pelayaran ini?
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

      {/* Modal Add / Edit Schedule */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingSchedule ? 'Ubah Jadwal Pelayaran' : 'Buat Jadwal Pelayaran Baru'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. Trip / Pelayaran</label>
                  <input
                    type="text"
                    required
                    value={formData.tripNumber}
                    onChange={(e) => setFormData({ ...formData, tripNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dermaga Sandar</label>
                  <input
                    type="text"
                    required
                    value={formData.dockName}
                    onChange={(e) => setFormData({ ...formData, dockName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kapal Bertugas</label>
                  <select
                    value={formData.shipId}
                    onChange={(e) => setFormData({ ...formData, shipId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {ships.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rute Penyeberangan</label>
                  <select
                    value={formData.routeId}
                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Berangkat (ETD)</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimasi Tiba (ETA)</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.estimatedArrivalTime}
                    onChange={(e) => setFormData({ ...formData, estimatedArrivalTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Keberangkatan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Berlayar">Berlayar</option>
                    <option value="Tiba">Tiba</option>
                    <option value="Ditunda (Cuaca)">Ditunda (Cuaca)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kondisi Cuaca BMKG</label>
                  <select
                    value={formData.weatherCondition}
                    onChange={(e) => setFormData({ ...formData, weatherCondition: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Normal / Laut Tenang">Normal / Laut Tenang</option>
                    <option value="Waspada Gelombang 1.5 - 2.5m">Waspada Gelombang 1.5 - 2.5m</option>
                    <option value="Cuaca Buruk / Gelombang > 2.5m">Cuaca Buruk / Gelombang &gt; 2.5m</option>
                  </select>
                </div>
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
