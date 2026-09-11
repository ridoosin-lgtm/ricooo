import React from 'react';
import { 
  Ship as ShipIcon, 
  Database, 
  LogOut, 
  ShieldCheck, 
  Activity,
  Anchor,
  Radio,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';
import { User, DatabaseConfig } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  dbConfig: DatabaseConfig;
  onOpenDatabaseManager: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  dbConfig,
  onOpenDatabaseManager,
  activeTab,
  setActiveTab
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">Admin Utama</span>;
      case 'operator':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800">Operator Pelabuhan</span>;
      case 'petugas_muatan':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">Petugas Muatan / Timbangan</span>;
      case 'kasir':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">Petugas Kasir / Tiket</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">{role}</span>;
    }
  };

  const getDbProviderBadge = () => {
    const isSupabase = dbConfig.activeProvider === 'supabase' && dbConfig.supabase.connected;
    const isNeon = dbConfig.activeProvider === 'neon' && dbConfig.neon.connected;
    const isFirebase = dbConfig.activeProvider === 'firebase' && dbConfig.firebase.connected;

    if (isSupabase) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Supabase Cloud
        </span>
      );
    }
    if (isNeon) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-300">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          Neon DB Postgres
        </span>
      );
    }
    if (isFirebase) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          Firebase Firestore
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        Local DB (Ready to Sync)
      </span>
    );
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-sky-600 text-white flex items-center justify-center shadow-md">
              <ShipIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">SIMPEL KAPAL</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">v2.4 Maritim</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Sistem Informasi Muatan & Penumpang Kapal</p>
            </div>
          </div>

          {/* Quick Real-Time Status & Live Operations */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <Radio className="w-3.5 h-3.5 text-rose-500 animate-ping" />
              <span>AIS Live Tracking:</span>
              <span className="font-semibold text-slate-800">Aktif (Selat Sunda & Selat Bali)</span>
            </div>
          </div>

          {/* Right Action: Database Connection & User Profile */}
          <div className="flex items-center gap-3">
            {/* Database Switcher Button */}
            <button
              id="btn-db-manager"
              type="button"
              onClick={onOpenDatabaseManager}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 transition-all text-left group"
              title="Kelola Koneksi Real Database (Supabase, Neon, Firebase)"
            >
              <Database className="w-4 h-4 text-blue-600 group-hover:rotate-12 transition-transform" />
              <div className="hidden sm:block">
                <div className="text-[11px] text-slate-400 font-medium leading-none">Status Database:</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{getDbProviderBadge()}</div>
              </div>
            </button>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[160px]">{user.name}</div>
                <div className="mt-0.5">{getRoleBadge(user.role)}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <button
                id="btn-logout"
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
                title="Keluar / Logout Akun ke Form Login"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
