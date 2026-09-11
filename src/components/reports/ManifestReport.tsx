import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  Ship, 
  Users, 
  Truck, 
  ShieldCheck, 
  Anchor, 
  CheckCircle2 
} from 'lucide-react';
import { 
  VoyageSchedule, 
  Ship as ShipType, 
  Route, 
  PassengerTicket, 
  CargoItem, 
  Port 
} from '../../types';

interface ManifestReportProps {
  schedules: VoyageSchedule[];
  ships: ShipType[];
  routes: Route[];
  ports: Port[];
  passengers: PassengerTicket[];
  cargoItems: CargoItem[];
}

export const ManifestReport: React.FC<ManifestReportProps> = ({
  schedules,
  ships,
  routes,
  ports,
  passengers,
  cargoItems,
}) => {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(schedules[0]?.id || '');
  const [reportType, setReportType] = useState<'all' | 'passenger' | 'cargo'>('all');

  const currentSchedule = schedules.find(s => s.id === selectedScheduleId) || schedules[0];
  const currentShip = currentSchedule ? ships.find(s => s.id === currentSchedule.shipId) : null;
  const currentRoute = currentSchedule ? routes.find(r => r.id === currentSchedule.routeId) : null;
  const originPort = currentRoute ? ports.find(p => p.id === currentRoute.originPortId) : null;
  const destPort = currentRoute ? ports.find(p => p.id === currentRoute.destinationPortId) : null;

  const currentPassengers = currentSchedule
    ? passengers.filter(p => p.scheduleId === currentSchedule.id && p.status !== 'Batal')
    : [];

  const currentCargo = currentSchedule
    ? cargoItems.filter(c => c.scheduleId === currentSchedule.id && c.status !== 'Ditolak (Overweight)')
    : [];

  // Summary Metrics
  const totalPax = currentPassengers.length;
  const totalCargoTon = currentCargo.reduce((acc, c) => acc + (c.measuredWeightTon || c.weightTon), 0);
  const totalVehicles = currentCargo.filter(c => c.vehiclePlateNumber).length;
  const paxRevenue = currentPassengers.reduce((acc, p) => acc + p.fare, 0);
  const cargoRevenue = currentCargo.reduce((acc, c) => acc + c.fare, 0);
  const totalRevenue = paxRevenue + cargoRevenue;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Actions (Hidden on Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900">Laporan & Manifest Resmi Pelayaran</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen legal manifest penumpang dan muatan kapal sesuai regulasi Ditjen Perhubungan Laut (BPTD / KSOP)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedScheduleId}
            onChange={(e) => setSelectedScheduleId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600"
          >
            {schedules.map((s) => {
              const ship = ships.find(sh => sh.id === s.shipId);
              return (
                <option key={s.id} value={s.id}>
                  {s.tripNumber} - {ship?.name} ({s.dockName})
                </option>
              );
            })}
          </select>

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="all">Semua Manifest (Gabungan)</option>
            <option value="passenger">Manifest Penumpang Saja</option>
            <option value="cargo">Manifest Muatan & Kendaraan Saja</option>
          </select>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Print PDF</span>
          </button>
        </div>
      </div>

      {/* Official Manifest Document Sheet */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 max-w-5xl mx-auto text-slate-900 font-sans">
        {/* Document Header with Seal */}
        <div className="text-center pb-6 border-b-2 border-slate-900">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600">
            <span>REPUBLIK INDONESIA</span>
            <span>•</span>
            <span>KEMENTERIAN PERHUBUNGAN</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 mt-1">
            DAFTAR MANIFEST PENUMPANG & MUATAN KAPAL
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            SURAT PERNYATAAN NAHKODA & OPERATOR (SAILING DECLARATION MANIFEST)
          </p>
        </div>

        {/* Voyage Identity Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-200 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Nama Kapal / Call Sign</span>
            <span className="font-bold text-slate-900">{currentShip?.name}</span>
            <span className="text-[11px] font-mono text-slate-500 block">CS: {currentShip?.callSign || '-'} / {currentShip?.code}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">No. Trip Pelayaran</span>
            <span className="font-bold font-mono text-blue-700 text-sm">{currentSchedule?.tripNumber}</span>
            <span className="text-[11px] text-slate-500 block">{currentSchedule?.dockName}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Lintasan / Rute</span>
            <span className="font-bold text-slate-900">{originPort?.name.replace('Pelabuhan ', '')} ➔ {destPort?.name.replace('Pelabuhan ', '')}</span>
            <span className="text-[11px] text-slate-500 block">{currentRoute?.distanceNm} Mil Laut (NM)</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Waktu Keberangkatan</span>
            <span className="font-bold text-slate-900">
              {currentSchedule ? new Date(currentSchedule.departureTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
            </span>
            <span className="text-[11px] text-slate-500 font-mono block">
              Pukul {currentSchedule ? new Date(currentSchedule.departureTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'} WIB
            </span>
          </div>
        </div>

        {/* Operational Statistics Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Penumpang</span>
            <div className="text-lg font-black text-slate-900">{totalPax} Jiwa</div>
            <span className="text-[10px] text-slate-500">Maksimal: {currentShip?.passengerCapacity} Orang</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Kendaraan</span>
            <div className="text-lg font-black text-slate-900">{totalVehicles} Unit</div>
            <span className="text-[10px] text-slate-500">Maksimal: {currentShip?.maxVehicles} Unit</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Beban Tonase</span>
            <div className="text-lg font-black text-blue-700">{totalCargoTon.toFixed(1)} Ton</div>
            <span className="text-[10px] text-slate-500">Kapasitas DWT: {currentShip?.cargoCapacityDWT} Ton</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Retribusi & Tiket</span>
            <div className="text-lg font-black text-emerald-700">{formatIDR(totalRevenue)}</div>
            <span className="text-[10px] text-slate-500">Penerimaan Pelayaran</span>
          </div>
        </div>

        {/* Passenger Manifest Section */}
        {(reportType === 'all' || reportType === 'passenger') && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>BAGIAN I: DAFTAR MANIFEST PENUMPANG ({currentPassengers.length} ORANG)</span>
              </h3>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
                    <th className="py-2 px-3">No</th>
                    <th className="py-2 px-3">No. Tiket</th>
                    <th className="py-2 px-3">Nama Penumpang</th>
                    <th className="py-2 px-3">No. Identitas (KTP)</th>
                    <th className="py-2 px-3">L/P</th>
                    <th className="py-2 px-3">Usia</th>
                    <th className="py-2 px-3">Kelas / Kursi</th>
                    <th className="py-2 px-3 text-right">Tarif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentPassengers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-slate-400">Tidak ada data penumpang pada trip ini.</td>
                    </tr>
                  ) : (
                    currentPassengers.map((p, idx) => (
                      <tr key={p.id}>
                        <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold">{p.ticketNumber}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{p.passengerName}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{p.identityType}: {p.identityNumber}</td>
                        <td className="py-2 px-3 font-bold">{p.gender}</td>
                        <td className="py-2 px-3">{p.age} th</td>
                        <td className="py-2 px-3">{p.seatClass} ({p.seatNumber || '-'})</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{formatIDR(p.fare)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cargo Manifest Section */}
        {(reportType === 'all' || reportType === 'cargo') && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-teal-600" />
                <span>BAGIAN II: DAFTAR MANIFEST MUATAN & KENDARAAN ({currentCargo.length} UNIT)</span>
              </h3>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
                    <th className="py-2 px-3">No</th>
                    <th className="py-2 px-3">No. Manifest</th>
                    <th className="py-2 px-3">Plat Kendaraan</th>
                    <th className="py-2 px-3">Golongan / Jenis</th>
                    <th className="py-2 px-3">Pengemudi</th>
                    <th className="py-2 px-3">Dek Sandar</th>
                    <th className="py-2 px-3 text-right">Tonase</th>
                    <th className="py-2 px-3 text-right">Retribusi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentCargo.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-slate-400">Tidak ada muatan kendaraan pada trip ini.</td>
                    </tr>
                  ) : (
                    currentCargo.map((c, idx) => (
                      <tr key={c.id}>
                        <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-blue-700">{c.manifestNumber}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{c.vehiclePlateNumber || 'NON-KENDARAAN'}</td>
                        <td className="py-2 px-3">{c.category}</td>
                        <td className="py-2 px-3">{c.driverName}</td>
                        <td className="py-2 px-3 font-mono">{c.deckLocation}</td>
                        <td className="py-2 px-3 text-right font-bold">{c.measuredWeightTon || c.weightTon} Ton</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{formatIDR(c.fare)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legal Signatures / pengesahan */}
        <div className="mt-12 pt-6 border-t-2 border-slate-900 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-[11px] text-slate-500 mb-1">Disetujui dan Diverifikasi Oleh:</p>
            <p className="font-bold text-slate-900">Petugas Syahbandar / BPTD</p>
            <div className="h-16 flex items-end justify-center">
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                VERIFIED & CLEARED
              </span>
            </div>
            <p className="font-bold text-slate-900 underline mt-1">( KASI KESELAMATAN BERLAYAR )</p>
            <p className="text-[10px] text-slate-500 font-mono">NIP. 19820315 200502 1 003</p>
          </div>

          <div>
            <p className="text-[11px] text-slate-500 mb-1">Dinyatakan Benar Oleh:</p>
            <p className="font-bold text-slate-900">Nahkoda / Master Kapal</p>
            <div className="h-16 flex items-end justify-center">
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                MASTER ON DUTY
              </span>
            </div>
            <p className="font-bold text-slate-900 underline mt-1">{currentShip?.captainName || 'Nahkoda Kapal'}</p>
            <p className="text-[10px] text-slate-500 font-mono">ID Pelaut: 6201948827</p>
          </div>
        </div>
      </div>
    </div>
  );
};
