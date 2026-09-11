import React from 'react';
import { 
  LayoutDashboard, 
  Ship, 
  MapPin, 
  Truck, 
  CalendarClock, 
  Ticket, 
  Boxes, 
  FileText, 
  Database,
  Layers,
  FileCheck2,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  shipCount: number;
  activeVoyageCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  shipCount,
  activeVoyageCount
}) => {
  const navSections = [
    {
      title: 'Utama',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Analitik',
          icon: LayoutDashboard,
          badge: 'Live',
          badgeColor: 'bg-emerald-100 text-emerald-700',
        },
      ]
    },
    {
      title: 'Data Transaksi',
      items: [
        {
          id: 'schedules',
          label: 'Jadwal & Pelayaran',
          icon: CalendarClock,
          badge: activeVoyageCount > 0 ? `${activeVoyageCount} Aktif` : undefined,
          badgeColor: 'bg-sky-100 text-sky-700',
        },
        {
          id: 'passengers',
          label: 'Tiket & Penumpang',
          icon: Ticket,
        },
        {
          id: 'cargo',
          label: 'Muatan & Kendaraan',
          icon: Boxes,
        },
      ]
    },
    {
      title: 'Master Data (CRUD)',
      items: [
        {
          id: 'master-ships',
          label: 'Master Armada Kapal',
          icon: Ship,
          badge: `${shipCount}`,
          badgeColor: 'bg-slate-100 text-slate-600',
        },
        {
          id: 'master-ports-routes',
          label: 'Pelabuhan & Rute',
          icon: MapPin,
        },
        {
          id: 'master-cargo-rates',
          label: 'Kategori & Tarif Muatan',
          icon: Truck,
        },
      ]
    },
    {
      title: 'Laporan & Dokumen',
      items: [
        {
          id: 'reports',
          label: 'Laporan & Manifest Resmi',
          icon: FileText,
        },
      ]
    },
    {
      title: 'Infrastruktur Data',
      items: [
        {
          id: 'database',
          label: 'Koneksi Real Database',
          icon: Database,
          badge: 'Multi-DB',
          badgeColor: 'bg-blue-100 text-blue-700 font-bold',
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 min-h-[calc(100vh-4rem)] flex flex-col justify-between no-print">
      <div className="p-4 space-y-6">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    id={`nav-tab-${item.id}`}
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Maritime Safety Notice */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Protokol Syahbandar</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Verifikasi timbangan muatan wajib dilakukan sebelum penerbitan Surat Persetujuan Berlayar (SPB).
        </p>
      </div>
    </aside>
  );
};
