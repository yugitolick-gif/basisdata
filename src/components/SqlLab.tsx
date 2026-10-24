import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Download, Table, Check, AlertCircle, Sparkles, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from 'lucide-react';
import { sqlEngine } from '../services/sqlEngine';
import { DATASETS } from '../data/databaseDatasets';
import { DatasetKey, QueryResult } from '../types/database';

interface SqlLabProps {
  activeDataset: DatasetKey;
  setActiveDataset: (key: DatasetKey) => void;
  initialQuery?: string;
  onDatabaseQueried?: (dbKey: string) => void;
}

export const SqlLab: React.FC<SqlLabProps> = ({
  activeDataset,
  setActiveDataset,
  initialQuery,
  onDatabaseQueried
}) => {
  const [query, setQuery] = useState<string>(
    initialQuery || 'SELECT nim, nama_mahasiswa, ipk, id_jurusan\nFROM mahasiswa\nWHERE ipk >= 3.50\nORDER BY ipk DESC;'
  );
  const [result, setResult] = useState<QueryResult | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('mahasiswa');
  const [copySuccess, setCopySuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isSchemaOpenOnMobile, setIsSchemaOpenOnMobile] = useState(false);
  const [canSampleScrollLeft, setCanSampleScrollLeft] = useState(false);
  const sampleScrollRef = useRef<HTMLDivElement>(null);

  const checkSampleScroll = () => {
    if (sampleScrollRef.current) {
      setCanSampleScrollLeft(sampleScrollRef.current.scrollLeft > 10);
    }
  };

  const handleScrollSamples = (direction: 'left' | 'right') => {
    if (sampleScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sampleScrollRef.current;
      if (direction === 'right') {
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          sampleScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          sampleScrollRef.current.scrollBy({ left: 160, behavior: 'smooth' });
        }
      } else {
        sampleScrollRef.current.scrollBy({ left: -160, behavior: 'smooth' });
      }
      setTimeout(checkSampleScroll, 350);
    }
  };

  const dataset = DATASETS[activeDataset];
  const tables = dataset ? Object.values(dataset.tables) : [];

  // Update initial query when props change
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleExecuteQuery(initialQuery);
    } else {
      if (activeDataset === 'universitas') {
        setQuery('SELECT nim, nama_mahasiswa, ipk, id_jurusan\nFROM mahasiswa\nWHERE ipk >= 3.50\nORDER BY ipk DESC;');
      } else if (activeDataset === 'ecommerce') {
        setQuery('SELECT id_pesanan, id_pelanggan, total_biaya, status\nFROM pesanan\nWHERE status = \'Selesai\'\nORDER BY total_biaya DESC;');
      } else {
        setQuery('SELECT id_pasien, nama_pasien, usia, gol_darah, kota\nFROM pasien\nWHERE kota = \'Bandung\'\nORDER BY usia ASC;');
      }
    }
  }, [activeDataset, initialQuery]);

  const handleExecuteQuery = (sqlToRun?: string) => {
    const targetSql = sqlToRun || query;
    const res = sqlEngine.execute(activeDataset, targetSql);
    setResult(res);
    if (res.success && onDatabaseQueried) {
      onDatabaseQueried(activeDataset);
    }
  };

  const handleResetDb = () => {
    sqlEngine.resetDataset(activeDataset);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
    handleExecuteQuery();
  };

  const handleExportCsv = () => {
    if (!result || !result.success || result.rows.length === 0) return;
    const header = result.columns.join(',');
    const rows = result.rows.map(r => r.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `query_result_${activeDataset}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadSampleQuery = (sampleSql: string) => {
    setQuery(sampleSql);
    handleExecuteQuery(sampleSql);
  };

  const sampleQueries = {
    universitas: [
      {
        label: 'Mahasiswa IPK >= 3.5',
        sql: 'SELECT nim, nama_mahasiswa, ipk, id_jurusan\nFROM mahasiswa\nWHERE ipk >= 3.50\nORDER BY ipk DESC;'
      },
      {
        label: 'JOIN Mahasiswa & Jurusan',
        sql: 'SELECT m.nim, m.nama_mahasiswa, j.nama_jurusan, j.fakultas\nFROM mahasiswa m\nINNER JOIN jurusan j ON m.id_jurusan = j.id_jurusan\nORDER BY m.nama_mahasiswa ASC;'
      },
      {
        label: 'Rerata IPK per Jurusan (GROUP BY)',
        sql: 'SELECT j.nama_jurusan, COUNT(m.nim) AS jumlah_mhs, ROUND(AVG(m.ipk), 2) AS rerata_ipk\nFROM jurusan j\nLEFT JOIN mahasiswa m ON j.id_jurusan = m.id_jurusan\nGROUP BY j.nama_jurusan\nORDER BY rerata_ipk DESC;'
      },
      {
        label: 'KHS Nilai Lengkap (JOIN 4 Tabel)',
        sql: 'SELECT m.nama_mahasiswa, mk.nama_mk, mk.sks, n.nilai_tugas, n.nilai_uts, n.nilai_uas, n.nilai_akhir, n.grade\nFROM mahasiswa m\nJOIN krs k ON m.nim = k.nim\nJOIN mata_kuliah mk ON k.kode_mk = mk.kode_mk\nJOIN nilai n ON k.id_krs = n.id_krs\nORDER BY m.nama_mahasiswa ASC;'
      }
    ],
    ecommerce: [
      {
        label: 'Produk Terlaris & Stok',
        sql: 'SELECT p.id_produk, p.nama_produk, k.nama_kategori, p.harga, p.stok\nFROM produk p\nJOIN kategori k ON p.id_kategori = k.id_kategori\nORDER BY p.harga DESC;'
      },
      {
        label: 'Total Belanja Pelanggan',
        sql: 'SELECT c.nama_pelanggan, c.kota, COUNT(p.id_pesanan) AS total_order, SUM(p.total_biaya) AS total_belanja\nFROM pelanggan c\nJOIN pesanan p ON c.id_pelanggan = p.id_pelanggan\nGROUP BY c.nama_pelanggan, c.kota\nORDER BY total_belanja DESC;'
      },
      {
        label: 'Rincian Item Invoice ORD-101',
        sql: 'SELECT dp.id_pesanan, pr.nama_produk, dp.jumlah, dp.subtotal\nFROM detail_pesanan dp\nJOIN produk pr ON dp.id_produk = pr.id_produk\nWHERE dp.id_pesanan = \'ORD-101\';'
      }
    ],
    rumahsakit: [
      {
        label: 'Daftar Pasien',
        sql: 'SELECT id_pasien, nama_pasien, usia, gol_darah, kota\nFROM pasien\nORDER BY usia ASC;'
      },
      {
        label: 'Dokter & Tarif Konsul',
        sql: 'SELECT id_dokter, nama_dokter, spesialisasi, ruangan, tarif_konsul\nFROM dokter\nORDER BY tarif_konsul DESC;'
      },
      {
        label: 'JOIN Rekam Medis & Pasien',
        sql: 'SELECT rm.id_rekam, p.nama_pasien, p.usia, d.nama_dokter, rm.diagnosa, rm.tgl_periksa\nFROM rekam_medis rm\nJOIN pasien p ON rm.id_pasien = p.id_pasien\nJOIN dokter d ON rm.id_dokter = d.id_dokter\nORDER BY rm.tgl_periksa DESC;'
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Top Header Control Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            SQL Interactive Playground
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
            <span>Database: <strong className="text-slate-700">{dataset.title}</strong></span>
            <span aria-hidden="true" className="hidden xs:inline">·</span>
            <span>ANSI SQL Standard</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline text-slate-500">Pintasan: Ctrl + Enter</span>
          </div>
        </div>

        {/* Database Switcher Tabs & Reset (Responsive on mobile) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          <div className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium text-center">
            <button
              onClick={() => setActiveDataset('universitas')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-all cursor-pointer truncate ${
                activeDataset === 'universitas'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Database Akademik Universitas"
            >
              Universitas
            </button>
            <button
              onClick={() => setActiveDataset('ecommerce')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-all cursor-pointer truncate ${
                activeDataset === 'ecommerce'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Database E-Commerce & Retail"
            >
              E-Commerce
            </button>
            <button
              onClick={() => setActiveDataset('rumahsakit')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-all cursor-pointer truncate ${
                activeDataset === 'rumahsakit'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Database Rumah Sakit & Pasien"
            >
              Rumah Sakit
            </button>
          </div>

          <button
            onClick={handleResetDb}
            title="Kembalikan tabel dan baris ke kondisi awal"
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetSuccess ? 'text-emerald-600' : ''}`} />
            <span>{resetSuccess ? 'Tereset!' : 'Reset Data'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Editor & Results (75%), Right Table Schema Drawer (25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Query Editor & Execution Window */}
        <div className="lg:col-span-3 space-y-4">
          {/* Quick Sample Queries Ribbon with Interactive Scroll Buttons */}
          <div className="relative group">
            {/* Left Scroll Button (shows when scrolled right) */}
            {canSampleScrollLeft && (
              <button 
                type="button"
                onClick={() => handleScrollSamples('left')}
                title="Geser contoh kueri ke kiri"
                aria-label="Geser contoh kueri ke kiri"
                className="absolute left-0 top-0 bottom-1.5 px-1.5 bg-gradient-to-r from-white via-white/95 to-transparent flex items-center text-slate-500 hover:text-indigo-600 active:scale-90 transition-all cursor-pointer z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <div 
              ref={sampleScrollRef}
              onScroll={checkSampleScroll}
              className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 px-0.5 pr-10 scrollbar-none text-xs scroll-smooth touch-pan-x"
            >
              <span className="text-slate-500 font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 pl-0.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Contoh Kueri:</span>
              </span>
              {(sampleQueries[activeDataset] || []).map((sq, idx) => (
                <button
                  key={idx}
                  onClick={() => loadSampleQuery(sq.sql)}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border border-slate-200/80 hover:border-indigo-300 shadow-2xs active:scale-95"
                >
                  {sq.label}
                </button>
              ))}
            </div>

            {/* Right Scroll Arrow Button (Clickable!) */}
            <button 
              type="button"
              onClick={() => handleScrollSamples('right')}
              title="Geser contoh kueri ke kanan"
              aria-label="Geser contoh kueri ke kanan"
              className="absolute right-0 top-0 bottom-1.5 px-2 bg-gradient-to-l from-white via-white/95 to-transparent flex items-center justify-end text-slate-500 hover:text-indigo-600 active:scale-90 transition-all cursor-pointer z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Editor Container */}
          <div className="rounded-xl border border-slate-300 bg-slate-900 overflow-hidden shadow-xs">
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="font-mono text-slate-300 font-medium">SQL Editor</span>
                <span aria-hidden="true" className="text-slate-700 hidden sm:inline">|</span>
                <span className="text-slate-400 hidden sm:inline">Standard ANSI</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(query);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  }}
                  className="hover:text-slate-200 transition-colors cursor-pointer text-[11px]"
                >
                  {copySuccess ? 'Tersalin!' : 'Salin Kueri'}
                </button>
              </div>
            </div>

            {/* Code Input */}
            <div className="relative p-3">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleExecuteQuery();
                  }
                }}
                rows={5}
                spellCheck={false}
                placeholder="Tulis perintah SQL di sini... (Contoh: SELECT * FROM mahasiswa;)"
                className="w-full bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-relaxed outline-none resize-y selection:bg-indigo-700 selection:text-white"
              />
            </div>

            {/* Editor Action Footer */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-slate-950/80 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="hidden sm:inline">Tekan</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Enter</kbd>
              </div>
              <button
                onClick={() => handleExecuteQuery()}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Jalankan Kueri</span>
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            {/* Results Header Strip */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 sm:gap-3">
                <h3 className="text-sm font-semibold text-slate-900">Hasil Kueri</h3>
                {result && result.success && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono tabular-nums">
                    <span>{result.rowCount} baris</span>
                    <span aria-hidden="true">·</span>
                    <span>{result.executionTimeMs} ms</span>
                  </div>
                )}
              </div>

              {result && result.success && result.rows.length > 0 && (
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh CSV</span>
                </button>
              )}
            </div>

            {/* Result Content */}
            <div className="p-0 min-h-[160px]">
              {!result && (
                <div className="p-8 sm:p-10 text-center text-slate-500 text-sm">
                  <Play className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>Ketik perintah SQL di atas lalu tekan tombol <strong>Jalankan Kueri</strong>.</p>
                </div>
              )}

              {result && !result.success && (
                <div className="p-5 bg-rose-50 border-t border-rose-200 text-rose-900">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                        Kesalahan Sintaks SQL
                      </h4>
                      <p className="mt-1 font-mono text-xs text-rose-700 whitespace-pre-wrap leading-relaxed">
                        {result.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {result && result.success && result.rows.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p>Kueri berhasil dieksekusi, tetapi tidak ada baris data yang cocok dengan kriteria filter.</p>
                </div>
              )}

              {result && result.success && result.rows.length > 0 && (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-100 z-10 shadow-2xs">
                      <tr className="border-b border-slate-200 text-slate-700 font-semibold">
                        <th className="py-2.5 px-3 sm:px-4 w-12 text-slate-400 font-mono text-center">#</th>
                        {result.columns.map((col, idx) => (
                          <th key={idx} className="py-2.5 px-3 sm:px-4 whitespace-nowrap font-mono text-slate-800">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-3 sm:px-4 text-center font-mono text-slate-400 text-[11px]">
                            {rIdx + 1}
                          </td>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 sm:px-4 text-slate-800 whitespace-nowrap font-mono tabular-nums">
                              {cell === null || cell === undefined ? (
                                <span className="text-slate-400 italic">NULL</span>
                              ) : (
                                String(cell)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Schema Inspector / Available Tables */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div 
              className="flex items-center justify-between mb-3 cursor-pointer lg:cursor-default"
              onClick={() => setIsSchemaOpenOnMobile(!isSchemaOpenOnMobile)}
            >
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Daftar Tabel ({tables.length})
                </h3>
              </div>
              <button className="lg:hidden text-slate-400 hover:text-slate-600">
                {isSchemaOpenOnMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            <div className={`space-y-2 ${isSchemaOpenOnMobile ? 'block' : 'hidden lg:block'}`}>
              {tables.map((tbl) => (
                <div
                  key={tbl.name}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer text-xs ${
                    selectedTable === tbl.name
                      ? 'border-indigo-400 bg-indigo-50/50'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
                  }`}
                  onClick={() => setSelectedTable(tbl.name)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800">{tbl.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const sql = `SELECT * FROM ${tbl.name} LIMIT 10;`;
                        setQuery(sql);
                        handleExecuteQuery(sql);
                      }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
                    >
                      SELECT *
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {tbl.description}
                  </div>
                </div>
              ))}

              {/* Selected Table Column Details */}
              {dataset.tables[selectedTable] && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-700 mb-2">
                    Kolom pada <code className="text-indigo-600 font-mono">{selectedTable}</code>:
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {dataset.tables[selectedTable].columns.map((col, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] py-1 px-1.5 rounded bg-slate-50">
                        <div className="flex items-center gap-1.5">
                          {col.isPk && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded font-mono">
                              PK
                            </span>
                          )}
                          {col.isFk && (
                            <span className="text-[9px] font-bold text-sky-700 bg-sky-100 px-1 py-0.2 rounded font-mono">
                              FK
                            </span>
                          )}
                          <span className="font-mono text-slate-800">{col.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{col.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
