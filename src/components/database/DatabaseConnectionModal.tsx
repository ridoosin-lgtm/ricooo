import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Server, 
  Flame, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Code 
} from 'lucide-react';
import { db } from '../../services/dbService';
import { DatabaseConfig } from '../../types';

interface DatabaseConnectionModalProps {
  onClose?: () => void;
  isStandaloneTab?: boolean;
}

export const DatabaseConnectionModal: React.FC<DatabaseConnectionModalProps> = ({
  onClose,
  isStandaloneTab = false,
}) => {
  const currentConfig = db.getConfig();

  const [activeEngine, setActiveEngine] = useState<'supabase' | 'neon' | 'firebase'>('supabase');
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.supabase?.url || currentConfig.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.supabase?.anonKey || currentConfig.supabaseAnonKey || '');

  const [neonConnString, setNeonConnString] = useState(currentConfig.neon?.connectionString || currentConfig.neonConnectionString || '');
  const [neonHost, setNeonHost] = useState(currentConfig.neonHost || '');
  const [neonApiKey, setNeonApiKey] = useState(currentConfig.neonApiKey || '');

  const [firebaseProjectId, setFirebaseProjectId] = useState(currentConfig.firebase?.projectId || currentConfig.firebaseProjectId || '');
  const [firebaseApiKey, setFirebaseApiKey] = useState(currentConfig.firebase?.apiKey || currentConfig.firebaseApiKey || '');
  const [firebaseAppId, setFirebaseAppId] = useState(currentConfig.firebase?.appId || currentConfig.firebaseAppId || '');

  const [testStatus, setTestStatus] = useState<{
    testing: boolean;
    success?: boolean;
    message?: string;
    latencyMs?: number;
  }>({ testing: false });

  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTestSupabase = async () => {
    setTestStatus({ testing: true });
    db.setConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
    });
    const result = await db.testSupabaseConnection(supabaseUrl.trim(), supabaseAnonKey.trim());
    setTestStatus({
      testing: false,
      success: result.success,
      message: result.message,
      latencyMs: result.latencyMs,
    });
  };

  const handleTestNeon = async () => {
    setTestStatus({ testing: true });
    db.setConfig({
      neonConnectionString: neonConnString.trim(),
      neonHost: neonHost.trim(),
      neonApiKey: neonApiKey.trim(),
    });
    const result = await db.testNeonConnection(neonConnString.trim(), neonApiKey.trim());
    setTestStatus({
      testing: false,
      success: result.success,
      message: result.message,
      latencyMs: result.latencyMs,
    });
  };

  const handleTestFirebase = async () => {
    setTestStatus({ testing: true });
    db.setConfig({
      firebaseProjectId: firebaseProjectId.trim(),
      firebaseApiKey: firebaseApiKey.trim(),
      firebaseAppId: firebaseAppId.trim(),
    });
    const result = await db.testFirebaseConnection(firebaseProjectId.trim(), firebaseApiKey.trim());
    setTestStatus({
      testing: false,
      success: result.success,
      message: result.message,
      latencyMs: result.latencyMs,
    });
  };

  const handleActivateEngine = (engine: 'supabase' | 'neon' | 'firebase' | 'local') => {
    db.setConfig({
      provider: engine,
      isConnected: engine !== 'local',
      activeEngine: engine === 'local' ? undefined : engine,
    });
    setTestStatus({
      testing: false,
      success: true,
      message: `Database aktif diset ke: ${engine.toUpperCase()}`,
    });
  };

  const sqlSchemaText = `-- DDL SQL SCHEMA UNTUK SUPABASE & NEON DB POSTGRESQL
-- SISTEM MANIFEST MUATAN KAPAL & PENUMPANG

-- 1. Tabel Master Kapal
CREATE TABLE IF NOT EXISTS ships (
    id TEXT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(100) NOT NULL,
    passenger_capacity INT NOT NULL,
    cargo_capacity_dwt NUMERIC(10, 2) NOT NULL,
    max_vehicles INT NOT NULL,
    deck_count INT DEFAULT 2,
    year_built INT,
    captain_name VARCHAR(150),
    call_sign VARCHAR(50),
    length_meters NUMERIC(6, 2),
    breadth_meters NUMERIC(6, 2),
    status VARCHAR(50) DEFAULT 'Aktif Berlayar',
    current_location VARCHAR(150)
);

-- 2. Tabel Master Pelabuhan
CREATE TABLE IF NOT EXISTS ports (
    id TEXT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100),
    province VARCHAR(100),
    dock_count INT DEFAULT 4,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6)
);

-- 3. Tabel Master Rute
CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    origin_port_id TEXT REFERENCES ports(id),
    destination_port_id TEXT REFERENCES ports(id),
    distance_nm NUMERIC(8, 2),
    estimated_duration_hours NUMERIC(4, 2),
    base_fare_passenger NUMERIC(12, 2),
    base_fare_cargo_per_ton NUMERIC(12, 2)
);

-- 4. Tabel Jadwal & Perjalanan Kapal
CREATE TABLE IF NOT EXISTS voyage_schedules (
    id TEXT PRIMARY KEY,
    trip_number VARCHAR(100) NOT NULL UNIQUE,
    ship_id TEXT REFERENCES ships(id),
    route_id TEXT REFERENCES routes(id),
    dock_name VARCHAR(100),
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'Terjadwal',
    weather_condition VARCHAR(100)
);

-- 5. Tabel Manifest Tiket Penumpang
CREATE TABLE IF NOT EXISTS passenger_tickets (
    id TEXT PRIMARY KEY,
    ticket_number VARCHAR(100) NOT NULL UNIQUE,
    schedule_id TEXT REFERENCES voyage_schedules(id),
    passenger_name VARCHAR(150) NOT NULL,
    identity_type VARCHAR(50) NOT NULL,
    identity_number VARCHAR(100) NOT NULL,
    gender CHAR(1),
    age INT,
    passenger_type VARCHAR(50),
    seat_class VARCHAR(50),
    seat_number VARCHAR(50),
    fare NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Terbit',
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabel Manifest Muatan Kendaraan
CREATE TABLE IF NOT EXISTS cargo_items (
    id TEXT PRIMARY KEY,
    manifest_number VARCHAR(100) NOT NULL UNIQUE,
    schedule_id TEXT REFERENCES voyage_schedules(id),
    category VARCHAR(150) NOT NULL,
    vehicle_plate_number VARCHAR(50),
    driver_name VARCHAR(150),
    driver_phone VARCHAR(50),
    weight_ton NUMERIC(8, 2) NOT NULL,
    measured_weight_ton NUMERIC(8, 2),
    fare NUMERIC(12, 2) NOT NULL,
    deck_location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Terdaftar',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className={`space-y-6 ${isStandaloneTab ? '' : 'p-2'}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Koneksi Real Database Engine</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">Pilihan Engine:</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Supabase
                </span>
                <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  Neon DB
                </span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Firebase
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Aplikasi mendukung integrasi langsung ke database cloud real-time untuk sinkronisasi manifest pelayaran antar dermaga.
          </p>
        </div>

        {/* Current Active Engine Badge */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Engine Aktif</span>
          <div className="flex items-center gap-1.5 justify-end mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-900 uppercase">
              {currentConfig.activeEngine || 'Local Offline Cache'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Auto-sync & Local Storage Aktif</span>
        </div>
      </div>

      {/* Tabs for Supabase / Neon / Firebase */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => { setActiveEngine('supabase'); setTestStatus({ testing: false }); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeEngine === 'supabase'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>1. Supabase (PostgreSQL)</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveEngine('neon'); setTestStatus({ testing: false }); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeEngine === 'neon'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>2. Neon DB (Serverless Postgres)</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveEngine('firebase'); setTestStatus({ testing: false }); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeEngine === 'firebase'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>3. Firebase (Firestore / Realtime)</span>
        </button>
      </div>

      {/* Engine Config Content */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        {/* Supabase Tab */}
        {activeEngine === 'supabase' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  Konfigurasi Supabase Project
                </h3>
                <p className="text-xs text-slate-500">
                  Dapatkan URL dan Anon Key dari dashboard Supabase Anda di menu Settings &gt; API
                </p>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
              >
                <span>Buka Supabase</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzprojectid.supabase.co"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Supabase Public Anon Key
                </label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={testStatus.testing}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {testStatus.testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Uji Koneksi Supabase</span>
              </button>

              <button
                type="button"
                onClick={() => handleActivateEngine('supabase')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Gunakan Sebagai Database Utama
              </button>
            </div>
          </div>
        )}

        {/* Neon DB Tab */}
        {activeEngine === 'neon' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-500" />
                  Konfigurasi Neon DB (PostgreSQL Serverless)
                </h3>
                <p className="text-xs text-slate-500">
                  Dapatkan Connection String atau Host Endpoint dari Neon Console (Dashboard &gt; Connection details)
                </p>
              </div>
              <a
                href="https://console.neon.tech"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-600 font-bold hover:underline flex items-center gap-1"
              >
                <span>Buka Neon Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Neon Postgres Connection String / Host URL
                </label>
                <input
                  type="text"
                  value={neonConnString}
                  onChange={(e) => setNeonConnString(e.target.value)}
                  placeholder="postgresql://user:pass@ep-cool-ship-1234.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Neon API Key (Opsional untuk REST Query)
                </label>
                <input
                  type="password"
                  value={neonApiKey}
                  onChange={(e) => setNeonApiKey(e.target.value)}
                  placeholder="nkey_xyz123..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestNeon}
                disabled={testStatus.testing}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {testStatus.testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
                <span>Uji Koneksi Neon DB</span>
              </button>

              <button
                type="button"
                onClick={() => handleActivateEngine('neon')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Gunakan Sebagai Database Utama
              </button>
            </div>
          </div>
        )}

        {/* Firebase Tab */}
        {activeEngine === 'firebase' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  Konfigurasi Firebase (Firestore)
                </h3>
                <p className="text-xs text-slate-500">
                  Dapatkan Project ID dan Web API Key dari Firebase Console (Project Settings &gt; General)
                </p>
              </div>
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1"
              >
                <span>Buka Firebase Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Firebase Project ID
                </label>
                <input
                  type="text"
                  value={firebaseProjectId}
                  onChange={(e) => setFirebaseProjectId(e.target.value)}
                  placeholder="kapal-manifest-prod"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Web API Key
                </label>
                <input
                  type="password"
                  value={firebaseApiKey}
                  onChange={(e) => setFirebaseApiKey(e.target.value)}
                  placeholder="AIzaSyA4..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestFirebase}
                disabled={testStatus.testing}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {testStatus.testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                <span>Uji Koneksi Firebase</span>
              </button>

              <button
                type="button"
                onClick={() => handleActivateEngine('firebase')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Gunakan Sebagai Database Utama
              </button>
            </div>
          </div>
        )}

        {/* Live Test Results Alert */}
        {testStatus.message && (
          <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            testStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center gap-2">
              {testStatus.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div>
                <div className="font-bold">{testStatus.success ? 'Koneksi Berhasil!' : 'Koneksi Memerlukan Kredensial'}</div>
                <div>{testStatus.message}</div>
              </div>
            </div>

            {testStatus.latencyMs !== undefined && (
              <span className="font-mono font-bold bg-white/70 px-2 py-1 rounded border border-emerald-300">
                {testStatus.latencyMs} ms
              </span>
            )}
          </div>
        )}
      </div>

      {/* SQL Schema Generator & DDL Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Skema DDL Database (Supabase / Neon Postgres)</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowSqlSchema(!showSqlSchema)}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            {showSqlSchema ? 'Sembunyikan Skema SQL' : 'Tampilkan Skema DDL SQL'}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Copy skema SQL di bawah ini dan jalankan di SQL Editor Supabase atau Neon DB Console untuk membuat tabel secara instan.
        </p>

        {showSqlSchema && (
          <div className="relative mt-3">
            <button
              type="button"
              onClick={copyToClipboard}
              className="absolute right-3 top-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer z-10"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
            </button>
            <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-80 leading-relaxed">
              {sqlSchemaText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
