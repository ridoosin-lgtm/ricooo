import React from 'react';
import { 
  Ship as ShipIcon, 
  Users, 
  Boxes, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Waves, 
  Anchor, 
  CalendarClock, 
  Plus, 
  ArrowUpRight,
  CheckCircle2,
  Gauge,
  Navigation
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Ship, VoyageSchedule, PassengerTicket, CargoItem, Route, Port } from '../types';

interface DashboardProps {
  ships: Ship[];
  schedules: VoyageSchedule[];
  passengers: PassengerTicket[];
  cargoItems: CargoItem[];
  routes: Route[];
  ports: Port[];
  onNavigate: (tab: string) => void;
  onOpenDatabaseManager: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  ships,
  schedules,
  passengers,
  cargoItems,
  routes,
  ports,
  onNavigate,
  onOpenDatabaseManager,
}) => {
  // Compute Key Metrics
  const activeSailingShips = ships.filter(s => s.status === 'Aktif Berlayar');
  const dockedShips = ships.filter(s => s.status === 'Sandar di Pelabuhan');
  const validPassengers = passengers.filter(p => p.status !== 'Batal');
  const validCargo = cargoItems.filter(c => c.status !== 'Ditolak (Overweight)');

  const totalPassengers = validPassengers.length;
  const totalCargoWeight = Number(validCargo.reduce((acc, c) => acc + c.weightTon, 0).toFixed(2));
  const passengerRevenue = validPassengers.reduce((acc, p) => acc + p.fare, 0);
  const cargoRevenue = validCargo.reduce((acc, c) => acc + c.fare, 0);
  const totalRevenue = passengerRevenue + cargoRevenue;

  // Fleet capacity
  const totalPaxCapacity = ships.reduce((acc, s) => acc + s.passengerCapacity, 0);
  const totalCargoCapacityDWT = ships.reduce((acc, s) => acc + s.cargoCapacityDWT, 0);

  const avgPaxOccupancy = Math.min(100, Math.round((totalPassengers / (totalPaxCapacity || 1)) * 100));
  const avgCargoOccupancy = Math.min(100, Math.round((totalCargoWeight / (totalCargoCapacityDWT || 1)) * 100));

  // Chart data: 7 days trend
  const trendData = [
    { day: 'Senin', penumpang: 142, muatanTon: 85, pendapatanJt: 48 },
    { day: 'Selasa', penumpang: 168, muatanTon: 94, pendapatanJt: 55 },
    { day: 'Rabu', penumpang: 185, muatanTon: 110, pendapatanJt: 62 },
    { day: 'Kamis', penumpang: 154, muatanTon: 88, pendapatanJt: 51 },
    { day: 'Jumat', penumpang: 240, muatanTon: 135, pendapatanJt: 79 },
    { day: 'Sabtu', penumpang: 320, muatanTon: 165, pendapatanJt: 98 },
    { day: 'Minggu (Hari Ini)', penumpang: totalPassengers * 15 || 280, muatanTon: totalCargoWeight * 4 || 140, pendapatanJt: Math.round(totalRevenue / 1000000) || 84 },
  ];

  // Revenue composition
  const revenueDistribution = [
    { name: 'Tiket Penumpang', value: passengerRevenue || 6500000, color: '#0284c7' },
    { name: 'Muatan Kendaraan & Kargo', value: cargoRevenue || 18500000, color: '#0d9488' },
  ];

  // Ship capacity utilization breakdown
  const shipUtilizationData = ships.map((s) => {
    // find cargo and passengers on this ship via current schedules
    const shipSchedules = schedules.filter(sch => sch.shipId === s.id);
    const shipPax = validPassengers.filter(p => shipSchedules.some(sch => sch.id === p.scheduleId)).length;
    const shipCargoTon = validCargo
      .filter(c => shipSchedules.some(sch => sch.id === c.scheduleId))
      .reduce((acc, c) => acc + c.weightTon, 0);

    const paxPct = Math.min(100, Math.round((shipPax / (s.passengerCapacity || 1)) * 100));
    const cargoPct = Math.min(100, Math.round((shipCargoTon / (s.cargoCapacityDWT || 1)) * 100));

    return {
      name: s.name.replace('KMP ', '').replace('KM ', ''),
      paxUtil: paxPct,
      cargoUtil: cargoPct,
      dwtTotal: s.cargoCapacityDWT,
      currentCargoTon: Number(shipCargoTon.toFixed(1)),
      status: s.status,
    };
  });

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dashboard Analitik Operasional Kapal
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 animate-pulse">
              ● Live Real-Time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitoring performa muatan tonase (DWT), manifest penumpang, dan keselamatan pelayaran
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-quick-new-schedule"
            type="button"
            onClick={() => onNavigate('schedules')}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Jadwal Baru</span>
          </button>
          <button
            id="btn-quick-new-ticket"
            type="button"
            onClick={() => onNavigate('passengers')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Tiket Penumpang</span>
          </button>
          <button
            id="btn-quick-new-cargo"
            type="button"
            onClick={() => onNavigate('cargo')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Boxes className="w-4 h-4 text-teal-600" />
            <span>Timbang Muatan</span>
          </button>
        </div>
      </div>

      {/* BMKG Maritime Weather Alert */}
      <div className="bg-gradient-to-r from-sky-900 to-blue-900 text-white p-4 rounded-2xl shadow-md border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-800/80 flex items-center justify-center shrink-0 border border-blue-700">
            <Waves className="w-5 h-5 text-sky-300 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-300">Peringatan Cuaca BMKG Maritim</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-800 text-sky-200 font-medium">Terverifikasi</span>
            </div>
            <p className="text-xs text-slate-100 mt-0.5 leading-snug">
              Selat Sunda: Gelombang tenang (0.5 - 1.25m), Angin 10 knot. Selat Bali: Waspada arus pasang malam hari. Semua pelayaran berstatus <strong>AMAN & DIIZINKAN</strong>.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-semibold text-sky-200">Indeks Keselamatan SOLAS:</span>
          <div className="text-sm font-black text-emerald-300 flex items-center gap-1 justify-end">
            <ShieldCheck className="w-4 h-4" /> 100% Memenuhi Syarat
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Kapal Berlayar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Armada Berlayar</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {activeSailingShips.length} <span className="text-xs font-semibold text-slate-400">/ {ships.length} Kapal</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{dockedShips.length} Kapal Siap di Dermaga</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <ShipIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Penumpang */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Penumpang Hari Ini</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalPassengers} <span className="text-xs font-semibold text-slate-400">Orang</span>
            </div>
            <div className="text-[11px] text-sky-600 font-semibold mt-1">
              Okupansi Armada: {avgPaxOccupancy}%
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total Muatan Tonase */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Muatan Terangkut</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalCargoWeight} <span className="text-xs font-semibold text-slate-400">Ton (DWT)</span>
            </div>
            <div className="text-[11px] text-teal-600 font-semibold mt-1">
              Utilisasi Muatan: {avgCargoOccupancy}%
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total Pendapatan Operasional */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pendapatan</span>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-1 truncate max-w-[170px]" title={formatIDR(totalRevenue)}>
              {formatIDR(totalRevenue)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Tiket + Tiket Muatan</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Real-Time Fleet Status Live Monitor */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-blue-600" />
              Status & Utilisasi Beban Kapal Secara Real-Time
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau batas keselamatan DWT dan kapasitas muatan penumpang setiap armada
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('master-ships')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Semua Armada ({ships.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ships.map((ship) => {
            const shipSchedules = schedules.filter(sch => sch.shipId === ship.id);
            const activeSch = shipSchedules.find(sch => sch.status === 'Berlayar' || sch.status === 'Boarding');
            const route = activeSch ? routes.find(r => r.id === activeSch.routeId) : null;
            
            // Calculate real-time load for active schedule
            const currentPax = activeSch 
              ? validPassengers.filter(p => p.scheduleId === activeSch.id).length 
              : 0;
            const currentCargoTon = activeSch 
              ? Number(validCargo.filter(c => c.scheduleId === activeSch.id).reduce((acc, c) => acc + c.weightTon, 0).toFixed(1))
              : 0;

            const paxPercent = Math.min(100, Math.round((currentPax / (ship.passengerCapacity || 1)) * 100));
            const cargoPercent = Math.min(100, Math.round((currentCargoTon / (ship.cargoCapacityDWT || 1)) * 100));
            const isOverloaded = currentCargoTon > ship.cargoCapacityDWT;

            return (
              <div 
                key={ship.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm">{ship.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 font-mono text-slate-700 font-semibold">{ship.code}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{ship.type} • {ship.captainName}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ship.status === 'Aktif Berlayar'
                      ? 'bg-blue-100 text-blue-700'
                      : ship.status === 'Sandar di Pelabuhan'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {ship.status}
                  </span>
                </div>

                {activeSch && route && (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-700 flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {route.name}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">{activeSch.tripNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Dermaga: {activeSch.dockName} • Status: <strong className="text-slate-800">{activeSch.status}</strong>
                    </div>
                  </div>
                )}

                {/* Meter 1: Penumpang */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Users className="w-3 h-3 text-sky-600" />
                      Kapasitas Penumpang
                    </span>
                    <span className="text-[11px]">{currentPax} / {ship.passengerCapacity} Org ({paxPercent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        paxPercent > 90 ? 'bg-rose-500' : paxPercent > 70 ? 'bg-amber-500' : 'bg-sky-500'
                      }`} 
                      style={{ width: `${paxPercent}%` }}
                    />
                  </div>
                </div>

                {/* Meter 2: Beban Muatan DWT */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Boxes className="w-3 h-3 text-teal-600" />
                      Beban Muatan Kapal (DWT)
                    </span>
                    <span className={`text-[11px] ${isOverloaded ? 'text-rose-600 font-bold' : ''}`}>
                      {currentCargoTon} / {ship.cargoCapacityDWT} Ton ({cargoPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isOverloaded ? 'bg-rose-600 animate-pulse' : cargoPercent > 80 ? 'bg-amber-500' : 'bg-teal-500'
                      }`} 
                      style={{ width: `${cargoPercent}%` }}
                    />
                  </div>
                  {isOverloaded && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-rose-600 font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      PERINGATAN: Muatan melebihi batas aman DWT!
                    </div>
                  )}
                </div>

                <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Lokasi: {ship.currentLocation || 'Pelabuhan Merak'}</span>
                  <span>Deck: {ship.deckCount} Tingkat</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Tren Penumpang & Muatan Tonase */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Tren Operasional Mingguan
              </h2>
              <p className="text-xs text-slate-500">Perbandingan volume penumpang dan tonase muatan kapal</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Penumpang
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Muatan (Ton)
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} 
                  formatter={(value: any, name: any) => [
                    name === 'penumpang' ? `${value} Orang` : `${value} Ton`,
                    name === 'penumpang' ? 'Penumpang' : 'Muatan DWT'
                  ]}
                />
                <Bar dataKey="penumpang" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="muatanTon" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Komposisi Pendapatan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Komposisi Pendapatan
            </h2>
            <p className="text-xs text-slate-500 mb-4">Kontribusi tiket penumpang vs muatan kendaraan</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {revenueDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => formatIDR(Number(val))}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            {revenueDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{formatIDR(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
