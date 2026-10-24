import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Download, 
  Search, 
  Filter, 
  Laptop, 
  Smartphone, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Database,
  BarChart3,
  Layers,
  Calculator,
  Terminal,
  Award,
  BookOpen,
  Trash2,
  Lock,
  LogOut,
  ShieldCheck,
  Key,
  Cloud,
  Flame,
  Globe
} from 'lucide-react';
import { analytics, AnalyticsSummary, VisitorSession, ActivityLog } from '../services/analyticsService';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase/config';

interface AdminDashboardProps {
  onBackToApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToApp }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('basisdata_admin_authenticated') === 'true' || auth.currentUser !== null;
    } catch {
      return false;
    }
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Dashboard Data State
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeatureFilter, setSelectedFeatureFilter] = useState('Semua');
  const [viewTab, setViewTab] = useState<'visitors' | 'logs'>('visitors');
  const [confirmClear, setConfirmClear] = useState(false);

  const fetchData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const summary = await analytics.getAnalyticsData();
      setData(summary);
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();

      // Real-time Firestore Live Subscription
      let unsubscribeFirestore: (() => void) | null = null;
      try {
        unsubscribeFirestore = analytics.subscribeToFirestore((liveSummary) => {
          setData(liveSummary);
          setIsLoading(false);
        });
      } catch (err) {
        console.warn('Firestore subscription fallback:', err);
      }

      // Fallback periodic poll every 20 seconds
      const interval = setInterval(fetchData, 20000);

      return () => {
        if (unsubscribeFirestore) unsubscribeFirestore();
        clearInterval(interval);
      };
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const userClean = usernameInput.trim().toLowerCase();
    const passClean = passwordInput.trim();

    // Check credentials: password must be "muhtyas123", username accepts "muhtyas" or "admin"
    const isUserValid = userClean === 'admin' || userClean === 'muhtyas';
    const isPassValid = passClean === 'muhtyas123';

    if (isUserValid && isPassValid) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('basisdata_admin_authenticated', 'true');
        sessionStorage.setItem('basisdata_admin_user', usernameInput.trim());
      } catch {
        // ignore
      }
    } else {
      setLoginError('Username atau kata sandi admin tidak tepat. Periksa kembali huruf besar/kecil.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setIsAuthenticated(true);
        sessionStorage.setItem('basisdata_admin_authenticated', 'true');
        sessionStorage.setItem('basisdata_admin_user', result.user.email || 'Admin Google');
      }
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('basisdata_admin_authenticated');
      sessionStorage.removeItem('basisdata_admin_user');
      await signOut(auth);
    } catch {
      // ignore
    }
    setPasswordInput('');
    setLoginError(null);
  };

  const handleExportCsv = () => {
    if (!data || data.visitors.length === 0) return;
    const header = [
      'Nama Mahasiswa',
      'NIM',
      'Session ID',
      'Perangkat',
      'Browser',
      'Pertama Masuk',
      'Terakhir Aktif',
      'Fitur Terakhir',
      'Total Aksi',
      'Fitur yang Digunakan'
    ];
    const rows = data.visitors.map((v) => [
      `"${v.studentName}"`,
      `"${v.studentNim}"`,
      `"${v.sessionId}"`,
      `"${v.device}"`,
      `"${v.browser}"`,
      `"${v.firstSeen}"`,
      `"${v.lastSeen}"`,
      `"${v.lastFeature}"`,
      v.totalActions,
      `"${v.featuresUsed.join(', ')}"`
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_pengunjung_firestore_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearLogs = async () => {
    await analytics.clearLogs();
    setConfirmClear(false);
    fetchData();
  };

  // If NOT Authenticated, show Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            {/* Brand / Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <Flame className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Portal Masuk Dosen & Administrator
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Terhubung ke <strong>Google Cloud Firestore</strong> & Database Server Basis Data.
              </p>
            </div>

            {/* Error Banner */}
            {loginError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-snug">{loginError}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username Admin:
                </label>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="muhtyas atau admin"
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi (Password):
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-lg border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Masuk dengan Kredensial</span>
                </button>
              </div>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white px-2 text-slate-400">Atau masuk cepat</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>{isGoogleLoading ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}</span>
            </button>

            {/* Back Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onBackToApp}
                className="text-xs text-slate-500 hover:text-indigo-600 font-medium cursor-pointer"
              >
                ← Kembali ke Halaman Praktik Mahasiswa
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LOGGED IN DASHBOARD VIEW ---
  const features = [
    'Semua',
    'SQL Playground',
    'Tantangan Praktik',
    'Aljabar Relasional',
    'Kuis & Ujian',
    'Simulator Normalisasi',
    'Skema ERD',
    'Cheat Sheet'
  ];

  const filteredVisitors = (data?.visitors || []).filter((v) => {
    const matchesSearch =
      v.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.studentNim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.sessionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFeature =
      selectedFeatureFilter === 'Semua' || v.featuresUsed.includes(selectedFeatureFilter);
    return matchesSearch && matchesFeature;
  });

  const filteredLogs = (data?.recentLogs || []).filter((l) => {
    const matchesSearch =
      l.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.studentNim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFeature =
      selectedFeatureFilter === 'Semua' || l.feature === selectedFeatureFilter;
    return matchesSearch && matchesFeature;
  });

  // Calculate highest used feature
  let topFeatureName = 'Belum Ada';
  let topFeatureCount = 0;
  if (data?.featureBreakdown) {
    Object.entries(data.featureBreakdown).forEach(([feat, count]) => {
      if (count > topFeatureCount) {
        topFeatureCount = count;
        topFeatureName = feat;
      }
    });
  }

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  const loggedUser =
    auth.currentUser?.email || sessionStorage.getItem('basisdata_admin_user') || 'Admin (muhtyas)';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Cloud Firestore Status Badge Header */}
      <div className="mb-4 bg-linear-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <Flame className="w-4 h-4 text-amber-600" />
          <span className="font-semibold text-slate-800">
            Terhubung ke Google Cloud Firestore
          </span>
          <span className="hidden sm:inline text-slate-400">·</span>
          <span className="text-slate-500 hidden sm:inline">
            Sumber Data: <strong className="text-indigo-600 font-semibold">{data?.source === 'firestore' ? 'Cloud Firestore (Real-Time)' : 'Sinkronisasi Multi-Tier'}</strong>
          </span>
        </div>
        <div className="text-[11px] text-amber-900 bg-amber-100/80 font-mono px-2 py-0.5 rounded border border-amber-300">
          Project: gen-lang-client-0084891294
        </div>
      </div>

      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Dashboard Admin & Pengunjung</span>
            </h2>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
              Live Cloud
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
            <span>Koleksi: <code>visitor_sessions</code> & <code>activity_logs</code></span>
            <span aria-hidden="true" className="hidden xs:inline">·</span>
            <span>Real-Time Sync</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* User badge */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold text-slate-800">{loggedUser}</span>
          </div>

          <button
            onClick={fetchData}
            title="Segarkan data terbaru"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Segarkan</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => setConfirmClear(true)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Hapus / Reset Riwayat Log"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            title="Keluar dari sesi admin"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>

          <button
            onClick={onBackToApp}
            className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            Kembali
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Clearing Logs */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-sm w-full">
            <h4 className="text-base font-bold text-slate-900 mb-2">
              Konfirmasi Reset Data Log
            </h4>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus seluruh log kunjungan dan aktivitas pengunjung dari Cloud Firestore dan server? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleClearLogs}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top 4 KPI Metric Strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Sesi Pengunjung</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {data?.totalVisitors || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Tersimpan di Firestore
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pengguna Aktif</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {data?.activeToday || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Sesi aktif tercatat
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Interaksi / Aksi</span>
            <BarChart3 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {data?.totalActions || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Kueri, tantangan, kuis & normalisasi
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Fitur Terpopuler</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {topFeatureName}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono tabular-nums">
            {topFeatureCount} kali interaksi
          </div>
        </div>
      </div>

      {/* Feature Breakdown Bars */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs mb-8">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Distribusi Kunjungan Berdasarkan Fitur</span>
          <span className="text-slate-400 font-normal">Proporsi Penggunaan Mahasiswa di Seluruh Fitur</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(data?.featureBreakdown || {}).map(([feat, count]) => {
            const total = data?.totalActions || 1;
            const percentage = Math.round((count / Math.max(total, 1)) * 100);

            return (
              <div key={feat} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                <div className="text-[11px] font-semibold text-slate-700 truncate" title={feat}>
                  {feat}
                </div>
                <div className="mt-2 flex items-baseline justify-between font-mono">
                  <span className="text-lg font-bold text-slate-900 tabular-nums">{count}</span>
                  <span className="text-xs text-slate-500 tabular-nums">{percentage}%</span>
                </div>
                <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Table: Visitors or Live Activity Feed */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Sub-Tabs: Daftar Pengunjung vs Log Aktivitas */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-slate-200/70 rounded-lg text-xs font-medium">
              <button
                onClick={() => setViewTab('visitors')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  viewTab === 'visitors'
                    ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daftar Mahasiswa & Pengunjung ({filteredVisitors.length})
              </button>
              <button
                onClick={() => setViewTab('logs')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  viewTab === 'logs'
                    ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Log Riwayat Aksi Real-Time ({filteredLogs.length})
              </button>
            </div>
          </div>

          {/* Search & Feature Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Mahasiswa, NIM, atau Sesi..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 w-56"
              />
            </div>

            <select
              value={selectedFeatureFilter}
              onChange={(e) => setSelectedFeatureFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 cursor-pointer outline-none focus:border-indigo-500"
            >
              {features.map((f) => (
                <option key={f} value={f}>
                  Fitur: {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View 1: Visitors Sessions Table */}
        {viewTab === 'visitors' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-3 px-4">Nama Mahasiswa & NIM</th>
                  <th className="py-3 px-4">Perangkat & Browser</th>
                  <th className="py-3 px-4">Waktu Mulai Masuk</th>
                  <th className="py-3 px-4">Aktivitas Terakhir</th>
                  <th className="py-3 px-4">Fitur Terakhir</th>
                  <th className="py-3 px-4 text-center">Total Aksi</th>
                  <th className="py-3 px-4">Fitur yang Dibuka</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Belum ada log pengunjung yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((v) => (
                    <tr key={v.sessionId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{v.studentName}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {v.studentNim} <span className="text-slate-300">·</span> {v.sessionId.substring(0, 16)}...
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          {v.device.includes('Mobile') ? (
                            <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span>{v.device}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{v.browser}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {formatDateTime(v.firstSeen)}
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-700 font-medium whitespace-nowrap">
                        {formatDateTime(v.lastSeen)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {v.lastFeature || 'Beranda'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 tabular-nums">
                        {v.totalActions}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {v.featuresUsed.map((f, fi) => (
                            <span
                              key={fi}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: Detailed Activity Feed Log */}
        {viewTab === 'logs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Mahasiswa / Pengunjung</th>
                  <th className="py-3 px-4">Fitur</th>
                  <th className="py-3 px-4">Aksi / Tindakan</th>
                  <th className="py-3 px-4">Rincian Tambahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada riwayat aktivitas yang tercatat.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {log.studentName} <span className="text-slate-400 font-mono text-[11px]">({log.studentNim})</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                          {log.feature}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px] truncate max-w-sm">
                        {log.details || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-amber-600" />
            <span>Data live tersinkronisasi ke Google Cloud Firestore & server SQL lokal</span>
          </span>
          <span className="font-mono tabular-nums">{filteredVisitors.length} Sesi Terpantau</span>
        </div>
      </div>
    </div>
  );
};
