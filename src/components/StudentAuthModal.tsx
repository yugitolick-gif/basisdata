import React, { useState } from 'react';
import { 
  Database, 
  GraduationCap, 
  UserCheck, 
  UserPlus, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { StudentService } from '../services/studentService';
import { StudentRecord, StudentAuthMode } from '../types/student';

interface StudentAuthModalProps {
  isOpen: boolean;
  onSuccess: (student: StudentRecord) => void;
  initialMode?: StudentAuthMode;
  allowClose?: boolean;
  onClose?: () => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onSuccess,
  initialMode = 'register',
  allowClose = false,
  onClose
}) => {
  const [mode, setMode] = useState<StudentAuthMode>(initialMode);
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [className, setClassName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [suggestedSwitch, setSuggestedSwitch] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleModeSwitch = (newMode: StudentAuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setSuggestedSwitch(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSuggestedSwitch(false);

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Silakan masukkan Nama Lengkap Anda.');
        return;
      }
      if (!nim.trim()) {
        setErrorMessage('Silakan masukkan Nomor Induk Mahasiswa (NIM).');
        return;
      }
      if (!className.trim()) {
        setErrorMessage('Silakan masukkan Kelas Anda (contoh: TI-2A, SI-3B).');
        return;
      }

      setIsLoading(true);
      try {
        const student = await StudentService.registerStudent(name, nim, className);
        setSuccessMessage(`Selamat datang, ${student.name}! Data Anda berhasil tersimpan di database.`);
        setTimeout(() => {
          onSuccess(student);
        }, 900);
      } catch (err: any) {
        if (err.code === 'ALREADY_EXISTS') {
          setErrorMessage(err.message);
          setSuggestedSwitch(true);
        } else {
          setErrorMessage(err.message || 'Terjadi kendala saat menyimpan ke database.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Login mode: only requires Nama and NIM
      if (!name.trim()) {
        setErrorMessage('Silakan masukkan Nama Lengkap yang terdaftar.');
        return;
      }
      if (!nim.trim()) {
        setErrorMessage('Silakan masukkan NIM Anda.');
        return;
      }

      setIsLoading(true);
      try {
        const student = await StudentService.loginStudent(name, nim);
        setSuccessMessage(`Selamat datang kembali, ${student.name} (${student.class})! Memuat progress belajar Anda...`);
        setTimeout(() => {
          onSuccess(student);
        }, 900);
      } catch (err: any) {
        if (err.code === 'NOT_FOUND') {
          setErrorMessage(err.message);
        } else if (err.code === 'NAME_MISMATCH') {
          setErrorMessage(err.message);
        } else {
          setErrorMessage(err.message || 'Gagal memulihkan session mahasiswa.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
              <GraduationCap className="w-6 h-6 text-indigo-300" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-medium bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-1.5">
                <Database className="w-3 h-3" />
                <span>Terhubung ke Database Cloud</span>
              </div>
              <h2 id="auth-modal-title" className="text-xl font-bold tracking-tight text-white">
                BasisData<span className="text-indigo-400">Lab</span> Mahasiswa
              </h2>
              <p className="text-xs text-indigo-200/90 mt-1 leading-relaxed">
                Wajib verifikasi identitas untuk mengakses praktikum SQL, simulasi normalisasi, dan evaluasi capaian belajar.
              </p>
            </div>
            {allowClose && onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Tutup dialog"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => handleModeSwitch('register')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-100 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <span>Mahasiswa Baru (Daftar)</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('login')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-100 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <LogIn className="w-4 h-4 text-indigo-600" />
            <span>Lanjutkan Belajar (Masuk)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Mode Guidance Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2.5">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {mode === 'register' ? (
                <>
                  <span className="font-semibold text-slate-900">Pendaftaran Pertama:</span> Masukkan <strong>Nama</strong>, <strong>NIM</strong>, dan <strong>Kelas</strong> Anda. Seluruh progres praktikum akan disimpan secara permanen di database.
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-900">Melanjutkan Belajar:</span> Cukup masukkan <strong>Nama</strong> dan <strong>NIM</strong> yang pernah Anda daftarkan untuk memulihkan riwayat tantangan dan lencana Anda.
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{errorMessage}</p>
                {suggestedSwitch && (
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('login')}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline underline-offset-2 cursor-pointer"
                  >
                    <span>Beralih ke tab 'Lanjutkan Belajar' sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          {/* Input: Nama Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Mahasiswa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Muhammad Tyas / Siti Nurhaliza"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-2xs"
            />
          </div>

          {/* Input: NIM */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Induk Mahasiswa (NIM) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="Contoh: 2024010199 atau 22TI045"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 font-mono transition-all shadow-2xs"
            />
          </div>

          {/* Input: Kelas (ONLY for New Students Registration) */}
          {mode === 'register' && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas / Rombel <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Contoh: TI-2A, SI-3B, atau IF-1C"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 uppercase transition-all shadow-2xs"
              />
              <span className="text-2xs text-slate-500 mt-1 block">
                Digunakan dosen untuk pengelompokan penilaian dan evaluasi tugas lab.
              </span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menghubungkan ke Database...</span>
                </div>
              ) : mode === 'register' ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Daftar & Mulai Praktikum</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Lanjutkan Progress Saya</span>
                </>
              )}
            </button>
          </div>

          {/* Security & Database Status Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Tersimpan aman di Firestore Cloud
            </span>
            <span>BasisDataLab v2.4</span>
          </div>
        </form>
      </div>
    </div>
  );
};
