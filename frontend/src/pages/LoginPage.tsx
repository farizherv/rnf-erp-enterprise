import React, { useState, useEffect } from 'react';
import { useAuth } from '../shared/context/AuthContext';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader2, Shield, ChevronRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) { setError('Username wajib diisi.'); return; }
    if (!password.trim()) { setError('Password wajib diisi.'); return; }

    setIsLoading(true);

    const result = await login(username, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Terjadi kesalahan.');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">

      {/* ═══════════════════════════════════════════ */}
      {/* LEFT PANEL — Branding & Visual             */}
      {/* ═══════════════════════════════════════════ */}
      <div
        className={`hidden lg:flex lg:w-[55%] relative overflow-hidden transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1047bd 100%)',
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
          {/* Floating circles */}
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-indigo-500/8 blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold tracking-tight">RNF ERP Enterprise</h1>
              <p className="text-blue-200/60 text-[11px] font-medium tracking-widest uppercase">Inventory Management System</p>
            </div>
          </div>

          {/* Center: Tagline */}
          <div className="flex flex-col gap-6 max-w-lg">
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Kelola Persediaan
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                RNF System.
              </span>
            </h2>
            <p className="text-blue-200/70 text-base leading-relaxed max-w-md">
              Platform Enterprise untuk pengelolaan gudang, stok barang, dan rantai pasok bisnis Anda secara real-time dan terintegrasi.
            </p>

            {/* Feature highlights */}
            <div className="flex flex-col gap-3 mt-2">
              {[
                'Monitoring stok multi-gudang real-time',
                'Laporan & analitik persediaan Enterprise',
                'Kontrol akses berbasis peran (RBAC)',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-blue-200/80">
                  <div className="w-5 h-5 rounded-full bg-blue-400/20 flex items-center justify-center shrink-0">
                    <ChevronRight className="w-3 h-3 text-cyan-300" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Copyright */}
          <div className="text-blue-300/40 text-xs">
            &copy; {new Date().getFullYear()} PT. Rezeki Nadh Fathan &mdash; All rights reserved.
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* RIGHT PANEL — Login Form                   */}
      {/* ═══════════════════════════════════════════ */}
      <div
        className={`flex-1 flex items-center justify-center px-6 py-12 transition-all duration-700 ease-out delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
      >
        <div className="w-full max-w-md">

          {/* Mobile Logo (visible on small screens) */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-slate-800 text-lg font-bold">RNF ERP Enterprise</h1>
              <p className="text-slate-400 text-[10px] font-medium tracking-widest uppercase">Inventory Management</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Masuk ke Akun Anda</h2>
            <p className="text-sm text-slate-500 mt-1.5">Masukkan kredensial untuk mengakses dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-username" className="text-sm font-semibold text-slate-600">Username</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="Masukkan username"
                  autoComplete="username"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-sm font-semibold text-slate-600">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>


          {/* Footer */}
          <p className="text-center text-[11px] text-slate-400 mt-6">
            Dengan masuk, Anda menyetujui <span className="text-slate-500 hover:underline cursor-pointer">Ketentuan Layanan</span> kami.
          </p>
        </div>
      </div>
    </div>
  );
};
