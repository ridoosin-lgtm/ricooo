import React, { useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  QrCode, 
  CheckCircle, 
  Printer, 
  Edit3, 
  Trash2, 
  User, 
  Calendar, 
  X, 
  AlertCircle,
  Ship,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { PassengerTicket, VoyageSchedule, Ship as ShipType, Route, TicketStatus } from '../../types';
import { db } from '../../services/dbService';

interface PassengerTicketsProps {
  passengers: PassengerTicket[];
  schedules: VoyageSchedule[];
  ships: ShipType[];
  routes: Route[];
}

export const PassengerTickets: React.FC<PassengerTicketsProps> = ({
  passengers,
  schedules,
  ships,
  routes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchedule, setFilterSchedule] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<PassengerTicket | null>(null);
  const [viewingBoardingPass, setViewingBoardingPass] = useState<PassengerTicket | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<PassengerTicket, 'id' | 'qrCodeToken'>>({
    ticketNumber: '',
    scheduleId: schedules[0]?.id || '',
    passengerName: '',
    identityType: 'KTP',
    identityNumber: '',
    gender: 'L',
    age: 30,
    passengerType: 'Dewasa',
    seatClass: 'Ekonomi',
    seatNumber: 'DEK-A',
    fare: 25000,
    status: 'Terbit',
    bookingDate: new Date().toISOString(),
  });

  const openCreateModal = () => {
    setEditingTicket(null);
    const selectedSch = schedules[0];
    const route = routes.find(r => r.id === selectedSch?.routeId);
    const baseFare = route?.baseFarePassenger || 25000;

    setFormData({
      ticketNumber: 'TIX-2026-' + Math.floor(10000 + Math.random() * 90000),
      scheduleId: selectedSch?.id || '',
      passengerName: '',
      identityType: 'KTP',
      identityNumber: '',
      gender: 'L',
      age: 28,
      passengerType: 'Dewasa',
      seatClass: 'Ekonomi',
      seatNumber: 'DEK-' + Math.floor(10 + Math.random() * 80),
      fare: baseFare,
      status: 'Terbit',
      bookingDate: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tix: PassengerTicket) => {
    setEditingTicket(tix);
    setFormData({
      ticketNumber: tix.ticketNumber,
      scheduleId: tix.scheduleId,
      passengerName: tix.passengerName,
      identityType: tix.identityType,
      identityNumber: tix.identityNumber,
      gender: tix.gender,
      age: tix.age,
      passengerType: tix.passengerType,
      seatClass: tix.seatClass,
      seatNumber: tix.seatNumber || '',
      fare: tix.fare,
      status: tix.status,
      bookingDate: tix.bookingDate,
      checkInTime: tix.checkInTime,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTicket) {
      db.updatePassenger(editingTicket.id, formData);
    } else {
      db.createPassenger(formData);
    }
    setIsModalOpen(false);
  };

  const handleCheckIn = (tix: PassengerTicket) => {
    db.updatePassenger(tix.id, {
      status: 'Checked-in',
      checkInTime: new Date().toISOString(),
    });
  };

  const handleBoarding = (tix: PassengerTicket) => {
    db.updatePassenger(tix.id, {
      status: 'Boarded',
    });
  };

  const handleDelete = (id: string) => {
    db.deletePassenger(id);
    setDeleteConfirmId(null);
  };

  const filteredPassengers = passengers.filter((p) => {
    const matchSearch =
      p.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.identityNumber.includes(searchTerm);
    const matchSchedule = filterSchedule === 'all' || p.scheduleId === filterSchedule;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchSchedule && matchStatus;
  });

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900">Manifest & Tiket Penumpang</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Penerbitan tiket resmi, verifikasi identitas (KTP/Paspor), check-in, dan cetak boarding pass kapal
          </p>
        </div>

        <button
          id="btn-add-ticket"
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Terbitkan Tiket Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama penumpang, nomor tiket, atau No. KTP..."
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
          <option value="all">Semua Status Tiket</option>
          <option value="Terbit">Terbit</option>
          <option value="Checked-in">Checked-in</option>
          <option value="Boarded">Boarded (Di Kapal)</option>
          <option value="Batal">Batal</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">No. Tiket & Penumpang</th>
                <th className="py-3 px-4">Identitas & Usia</th>
                <th className="py-3 px-4">Jadwal & Kapal</th>
                <th className="py-3 px-4">Kelas & Kursi</th>
                <th className="py-3 px-4">Tarif</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Boarding Pass</th>
                <th className="py-3 px-4 text-center">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredPassengers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data penumpang yang cocok.
                  </td>
                </tr>
              ) : (
                filteredPassengers.map((pax) => {
                  const sch = schedules.find(s => s.id === pax.scheduleId);
                  const ship = sch ? ships.find(sh => sh.id === sch.shipId) : null;
                  return (
                    <tr key={pax.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{pax.passengerName}</div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">{pax.ticketNumber}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{pax.identityType}: {pax.identityNumber}</div>
                        <div className="text-[11px] text-slate-400">{pax.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {pax.age} Thn ({pax.passengerType})</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{sch?.tripNumber}</div>
                        <div className="text-[11px] text-slate-500">{ship?.name}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          pax.seatClass === 'VIP Eksekutif'
                            ? 'bg-purple-100 text-purple-800'
                            : pax.seatClass === 'Bisnis'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {pax.seatClass}
                        </span>
                        {pax.seatNumber && (
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">Kursi: {pax.seatNumber}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatIDR(pax.fare)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pax.status === 'Boarded'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pax.status === 'Checked-in'
                            ? 'bg-sky-100 text-sky-800'
                            : pax.status === 'Terbit'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {pax.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingBoardingPass(pax)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            title="Lihat / Cetak Boarding Pass"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Pass</span>
                          </button>
                          {pax.status === 'Terbit' && (
                            <button
                              type="button"
                              onClick={() => handleCheckIn(pax)}
                              className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                              title="Tandai Check-in"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {pax.status === 'Checked-in' && (
                            <button
                              type="button"
                              onClick={() => handleBoarding(pax)}
                              className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700"
                              title="Boarding ke Kapal"
                            >
                              Boarding
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(pax)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="Ubah Data Tiket"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(pax.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                            title="Hapus / Batalkan Tiket"
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

      {/* Boarding Pass Preview Modal (Print Ready) */}
      {viewingBoardingPass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100">
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-blue-700 to-sky-600 text-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ship className="w-5 h-5 text-sky-200" />
                  <span className="font-extrabold text-sm tracking-wider uppercase">SIMPEL KAPAL BOARDING PASS</span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingBoardingPass(null)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3">
                <div className="text-xs text-sky-200 font-medium">Nomor Tiket Elektronik</div>
                <div className="text-xl font-black tracking-wider font-mono">{viewingBoardingPass.ticketNumber}</div>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Nama Penumpang</span>
                <div className="text-base font-black text-slate-900">{viewingBoardingPass.passengerName}</div>
                <div className="text-xs text-slate-500 font-mono">
                  {viewingBoardingPass.identityType}: {viewingBoardingPass.identityNumber} ({viewingBoardingPass.passengerType})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-dashed border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Kelas & Kursi</span>
                  <div className="text-sm font-bold text-blue-700">{viewingBoardingPass.seatClass}</div>
                  <div className="text-xs text-slate-600 font-mono">Seat: {viewingBoardingPass.seatNumber || 'Bebas'}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Tarif Tiket</span>
                  <div className="text-sm font-black text-slate-900">{formatIDR(viewingBoardingPass.fare)}</div>
                  <div className="text-[11px] text-emerald-600 font-bold">LUNAS / VERIFIED</div>
                </div>
              </div>

              {/* QR Code Simulation */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Barcode Verifikasi</span>
                  <div className="text-[11px] font-mono text-slate-600 font-bold mt-0.5">{viewingBoardingPass.qrCodeToken}</div>
                  <div className="text-[10px] text-slate-400">Scan di pintu boarding dermaga</div>
                </div>
                <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center">
                  <QrCode className="w-14 h-14 text-slate-900" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Boarding Pass (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingBoardingPass(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl text-center">
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Tiket</h3>
            <p className="text-xs text-slate-500 mt-1.5">
              Batalkan dan hapus tiket penumpang ini dari manifest?
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

      {/* Modal Add / Edit Ticket */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingTicket ? 'Ubah Data Tiket Penumpang' : 'Terbitkan Tiket Penumpang Baru'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Penumpang</label>
                <input
                  type="text"
                  required
                  value={formData.passengerName}
                  onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                  placeholder="Sesuai KTP / Paspor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Identitas</label>
                  <select
                    value={formData.identityType}
                    onChange={(e) => setFormData({ ...formData, identityType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="KTP">KTP (Kartu Tanda Penduduk)</option>
                    <option value="Paspor">Paspor Internasional</option>
                    <option value="SIM">SIM (Surat Izin Mengemudi)</option>
                    <option value="Kartu Identitas Anak">KIA (Kartu Identitas Anak)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Identitas (NIK/No Paspor)</label>
                  <input
                    type="text"
                    required
                    value={formData.identityNumber}
                    onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Usia (Tahun)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.passengerType}
                    onChange={(e) => setFormData({ ...formData, passengerType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Dewasa">Dewasa</option>
                    <option value="Anak">Anak</option>
                    <option value="Bayi">Bayi</option>
                  </select>
                </div>
              </div>

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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Kabin / Tiket</label>
                  <select
                    value={formData.seatClass}
                    onChange={(e) => setFormData({ ...formData, seatClass: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="Ekonomi">Ekonomi</option>
                    <option value="Bisnis">Bisnis</option>
                    <option value="VIP Eksekutif">VIP Eksekutif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Kursi / Dek</label>
                  <input
                    type="text"
                    value={formData.seatNumber || ''}
                    onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                    placeholder="Contoh: A-14 / DEK-B"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tarif Tiket (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.fare}
                    onChange={(e) => setFormData({ ...formData, fare: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700"
                  />
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
                >
                  Simpan Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
