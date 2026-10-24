import React from 'react';
import { Terminal, Award, BookOpen, Layers, Calculator } from 'lucide-react';
import { DatasetKey } from '../types/database';
import { NavTab } from './Navbar';

interface HeroSectionProps {
  onSelectAction: (tab: NavTab) => void;
  activeDataset: DatasetKey;
  setActiveDataset: (key: DatasetKey) => void;
  completedCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectAction,
  activeDataset,
  setActiveDataset,
  completedCount
}) => {
  return (
    <div className="border-b border-slate-200 bg-linear-to-b from-white via-slate-50/50 to-slate-50 pt-6 sm:pt-8 pb-8 sm:pb-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          {/* Left Column: Headlines & Editorial Presentation */}
          <div className="max-w-3xl">
            {/* Clean unboxed text metadata with subtle typographic separators */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-medium mb-3">
              <span>Kurikulum Ilmu Komputer & SI</span>
              <span aria-hidden="true" className="hidden xs:inline">·</span>
              <span>In-Browser SQL Engine</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span>Aljabar Relasional (σ, π, ⋈, ×)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-[2.65rem] font-bold tracking-tight text-slate-900 leading-[1.2] text-balance">
              Laboratorium Interaktif Mata Kuliah Basis Data
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Pelajari konsep esensial sistem basis data relasional: tulis dan uji kueri SQL langsung di browser, pelajari relasi antar tabel (ERD), eksplorasi simulator aljabar relasional, normalisasi 1NF–3NF, dan simulasi kuis ujian akademik.
            </p>

            {/* Functional Segmented Dataset Selector (Responsive on mobile & desktop) */}
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Pilih Database Praktik:</span>
              <div className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-medium gap-1 text-center">
                <button
                  onClick={() => setActiveDataset('universitas')}
                  className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 min-w-0 ${
                    activeDataset === 'universitas'
                      ? 'bg-white text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Database Akademik Universitas (6 Tabel)"
                >
                  <span className="truncate max-w-full font-semibold">Akademik</span>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                    <span className="sm:hidden">(6)</span>
                    <span className="hidden sm:inline">(6 Tabel)</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveDataset('ecommerce')}
                  className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 min-w-0 ${
                    activeDataset === 'ecommerce'
                      ? 'bg-white text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Database Toko Online / E-Commerce (5 Tabel)"
                >
                  <span className="truncate max-w-full font-semibold">E-Commerce</span>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                    <span className="sm:hidden">(5)</span>
                    <span className="hidden sm:inline">(5 Tabel)</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveDataset('rumahsakit')}
                  className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 min-w-0 ${
                    activeDataset === 'rumahsakit'
                      ? 'bg-white text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Database Rumah Sakit & Pasien (4 Tabel)"
                >
                  <span className="truncate max-w-full font-semibold">Rumah Sakit</span>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                    <span className="sm:hidden">(4)</span>
                    <span className="hidden sm:inline">(4 Tabel)</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Action Cards (1 col on mobile, 2 col on tablet/desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:w-[440px] shrink-0">
            <button
              onClick={() => onSelectAction('algebra')}
              className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/80 hover:border-indigo-400 hover:shadow-xs transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105">
                <Calculator className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Aljabar Relasional
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Kalkulator simbol matematis σ, π, ⋈, × ke SQL & tabel.
              </div>
              <div className="mt-3 text-[11px] font-mono tabular-nums text-indigo-600 font-semibold">
                Materi Inti UTS
              </div>
            </button>

            <button
              onClick={() => onSelectAction('challenges')}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                18 Tantangan Lab
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Latihan terbimbing otomatis dari dasar hingga mahir.
              </div>
              <div className="mt-3 text-[11px] font-mono tabular-nums text-indigo-600 font-medium">
                {completedCount} dari 18 Selesai
              </div>
            </button>

            <button
              onClick={() => onSelectAction('quiz')}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-xs transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                Kuis & Ujian
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Simulasi UTS/UAS dengan timer & pembahasan komprehensif.
              </div>
              <div className="mt-3 text-[11px] text-amber-700 font-medium">
                15 Soal Terstandar
              </div>
            </button>

            <button
              onClick={() => onSelectAction('normalization')}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Normalisasi Data
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Simulasi visual tahapan 0NF ke 1NF, 2NF, hingga 3NF.
              </div>
              <div className="mt-3 text-[11px] text-emerald-700 font-medium">
                Eliminasi Anomali
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
