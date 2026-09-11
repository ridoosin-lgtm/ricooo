import React, { useState } from 'react';
import { 
  Ship, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Anchor, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DEMO_USERS } from '../services/seedData';
import { User as UserType } from '../types';

interface LoginFormProps {
  onLoginSuccess: (user: UserType) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('admin@pelabuhan.go.id');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const found = DEMO_USERS.find(
        (u) =>
          (u.email.toLowerCase() === identifier.trim().toLowerCase() ||
           u.username.toLowerCase() === identifier.trim().toLowerCase()) &&
          u.password === password
      );

      if (found) {
        onLoginSuccess({
          id: found.id,
          username: found.username,
          name: found.name,
          email: found.email,
          role: found.role,
          avatar: found.avatar,
        });
      } else {
        setError('Username/Email atau Password salah. Silakan periksa kembali atau gunakan akun demo di bawah.');
      }
      setLoading(false);
    }, 450);
  };

  const handleSelectDemo = (demo: typeof DEMO_USERS[0]) => {
    setIdentifier(demo.email);
    setPassword(demo.password);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-xl shadow-blue-500/20 mb-4 ring-4 ring-blue-500/20">
            <Ship className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SIMPEL KAPAL
          </h1>
          <p className="text-sm text-slate-300 mt-1 font-medium">
            Sistem Informasi Operasional Muatan & Penumpang Kapal
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-400/30 text-xs font-semibold text-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Portal Masuk Administrator & Petugas
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
          {/* Database Status Banner */}
          <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-700">Status Database:</span>
            </div>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
              Terhubung (Local Persistence)
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Masuk ke Sistem</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan email/username dan kata sandi resmi petugas pelabuhan
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username atau Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="input-login-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@pelabuhan.go.id"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password / Kata Sandi
                </label>
                <span className="text-[11px] text-slate-400">Min. 6 Karakter</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pilih Akun Demo Cepat (1-Klik Masuk):</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => {
                    handleSelectDemo(demo);
                    onLoginSuccess({
                      id: demo.id,
                      username: demo.username,
                      name: demo.name,
                      email: demo.email,
                      role: demo.role,
                      avatar: demo.avatar,
                    });
                  }}
                  className="p-2.5 rounded-xl text-left border border-slate-200 bg-slate-50/70 hover:bg-blue-50/80 hover:border-blue-400 transition-all group"
                  title={`Klik untuk langsung masuk sebagai ${demo.name}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 group-hover:text-blue-700">{demo.name.split(' ')[0]}</span>
                    <span className="text-[9px] bg-blue-100 group-hover:bg-blue-600 group-hover:text-white text-blue-700 px-1.5 py-0.5 rounded font-semibold transition-colors">Masuk &rarr;</span>
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize mt-0.5">{demo.role.replace('_', ' ')}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-400">
          Terhubung ke Standar Keselamatan Pelayaran Maritim Indonesia (SOLAS)
        </div>
      </div>
    </div>
  );
};
