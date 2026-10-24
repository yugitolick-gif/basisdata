import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Play, 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle,
  Table as TableIcon,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { DATASETS } from '../data/databaseDatasets';
import { sqlEngine } from '../services/sqlEngine';
import { DatasetKey, QueryResult } from '../types/database';

interface AlgebraPreset {
  id: string;
  title: string;
  difficulty: 'Dasar' | 'Menengah' | 'Lanjutan';
  algebra: string;
  sql: string;
  explanation: string;
  operator: 'Seleksi (σ)' | 'Proyeksi (π)' | 'Kombinasi (π σ)' | 'Natural Join (⋈)' | 'Theta Join (⋈θ)' | 'Cartesian Product (×)';
  dataset: DatasetKey;
}

const ALGEBRA_PRESETS: AlgebraPreset[] = [
  {
    id: 'alg-01',
    title: 'Seleksi Mahasiswa IPK Tinggi',
    difficulty: 'Dasar',
    operator: 'Seleksi (σ)',
    dataset: 'universitas',
    algebra: 'σ_{ipk >= 3.50}(mahasiswa)',
    sql: 'SELECT * FROM mahasiswa WHERE ipk >= 3.50;',
    explanation: 'Operator Seleksi (σ) memfilter tupel/baris dari relasi mahasiswa yang memenuhi kondisi predikat logika (ipk >= 3.50).'
  },
  {
    id: 'alg-02',
    title: 'Proyeksi Atribut Mahasiswa',
    difficulty: 'Dasar',
    operator: 'Proyeksi (π)',
    dataset: 'universitas',
    algebra: 'π_{nim, nama_mahasiswa, ipk}(mahasiswa)',
    sql: 'SELECT nim, nama_mahasiswa, ipk FROM mahasiswa;',
    explanation: 'Operator Proyeksi (π) memilih himpunan atribut/kolom tertentu (nim, nama_mahasiswa, ipk) dan mengabaikan atribut lainnya.'
  },
  {
    id: 'alg-03',
    title: 'Kombinasi Proyeksi & Seleksi',
    difficulty: 'Menengah',
    operator: 'Kombinasi (π σ)',
    dataset: 'universitas',
    algebra: 'π_{nama_mahasiswa, ipk}(σ_{ipk >= 3.50 AND id_jurusan = "IF"}(mahasiswa))',
    sql: "SELECT nama_mahasiswa, ipk FROM mahasiswa WHERE ipk >= 3.50 AND id_jurusan = 'IF';",
    explanation: 'Evaluasi bersarang: mula-mula ekspresi di dalam kurung dieksekusi (Seleksi baris mahasiswa IF dengan IPK >= 3.50), lalu hasilnya diproyeksikan hanya pada kolom nama_mahasiswa dan ipk.'
  },
  {
    id: 'alg-04',
    title: 'Natural Join Mahasiswa & Jurusan',
    difficulty: 'Menengah',
    operator: 'Natural Join (⋈)',
    dataset: 'universitas',
    algebra: 'mahasiswa ⋈ jurusan',
    sql: 'SELECT m.nim, m.nama_mahasiswa, m.ipk, j.nama_jurusan, j.fakultas FROM mahasiswa m INNER JOIN jurusan j ON m.id_jurusan = j.id_jurusan;',
    explanation: 'Natural Join (⋈) secara otomatis menghubungkan dua relasi berdasarkan atribut yang memiliki nama dan domain yang sama (yaitu id_jurusan).'
  },
  {
    id: 'alg-05',
    title: 'Theta Join Dosen & Mata Kuliah',
    difficulty: 'Menengah',
    operator: 'Theta Join (⋈θ)',
    dataset: 'universitas',
    algebra: 'π_{nama_dosen, nama_mk, sks}(dosen ⋈_{dosen.nip = mata_kuliah.nip_pengampu} mata_kuliah)',
    sql: 'SELECT d.nama_dosen, mk.nama_mk, mk.sks FROM dosen d INNER JOIN mata_kuliah mk ON d.nip = mk.nip_pengampu;',
    explanation: 'Theta Join (⋈θ) menggabungkan baris dari dua tabel berdasarkan kondisi predikat eksplisit (dosen.nip = mata_kuliah.nip_pengampu), kemudian kolom nama_dosen, nama_mk, dan sks diproyeksikan.'
  },
  {
    id: 'alg-06',
    title: 'Filter Produk Terjangkau (E-Commerce)',
    difficulty: 'Dasar',
    operator: 'Kombinasi (π σ)',
    dataset: 'ecommerce',
    algebra: 'π_{nama_produk, harga, stok}(σ_{harga <= 150000}(produk))',
    sql: 'SELECT nama_produk, harga, stok FROM produk WHERE harga <= 150000 ORDER BY harga ASC;',
    explanation: 'Menyaring produk yang memiliki harga di bawah atau sama dengan 150.000, lalu menampilkan kolom nama_produk, harga, dan stok.'
  },
  {
    id: 'alg-07',
    title: 'Cartesian Product / Perkalian Silang (×)',
    difficulty: 'Lanjutan',
    operator: 'Cartesian Product (×)',
    dataset: 'universitas',
    algebra: 'π_{nama_jurusan, kode_mk}(jurusan × mata_kuliah)',
    sql: 'SELECT j.nama_jurusan, mk.kode_mk FROM jurusan j CROSS JOIN mata_kuliah mk LIMIT 12;',
    explanation: 'Cartesian Product (×) menghasilkan semua kemungkinan pasangan tupel dari relasi jurusan (4 baris) dikalikan relasi mata_kuliah (6 baris), menghasilkan 24 baris kombinasi.'
  }
];

interface RelationalAlgebraSimulatorProps {
  activeDataset: DatasetKey;
  setActiveDataset: (key: DatasetKey) => void;
  onOpenInLab?: (sql: string) => void;
  onFormulaTested?: (formulaId: string) => void;
}

export const RelationalAlgebraSimulator: React.FC<RelationalAlgebraSimulatorProps> = ({
  activeDataset,
  setActiveDataset,
  onOpenInLab,
  onFormulaTested
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(ALGEBRA_PRESETS[0].id);
  const [algebraInput, setAlgebraInput] = useState<string>(ALGEBRA_PRESETS[0].algebra);
  const [generatedSql, setGeneratedSql] = useState<string>(ALGEBRA_PRESETS[0].sql);
  const [activeTab, setActiveTab] = useState<'simulator' | 'theory'>('simulator');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isMobilePresetOpen, setIsMobilePresetOpen] = useState(false);

  const activePreset = ALGEBRA_PRESETS.find(p => p.id === selectedPresetId) || ALGEBRA_PRESETS[0];

  // Execute on initial load or preset change
  useEffect(() => {
    handleExecuteSql(generatedSql);
    onFormulaTested?.(selectedPresetId);
  }, []);

  const handleSelectPreset = (preset: AlgebraPreset) => {
    setSelectedPresetId(preset.id);
    setAlgebraInput(preset.algebra);
    setGeneratedSql(preset.sql);
    setActiveDataset(preset.dataset);
    handleExecuteSql(preset.sql, preset.dataset);
    onFormulaTested?.(preset.id);
    setIsMobilePresetOpen(false);
  };

  const handleExecuteSql = (sqlToRun: string, datasetKey?: DatasetKey) => {
    const targetDataset = datasetKey || activeDataset;
    const res = sqlEngine.execute(targetDataset, sqlToRun);
    setQueryResult(res);
  };

  const insertSymbol = (symbol: string) => {
    setAlgebraInput(prev => prev + symbol);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(generatedSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Convert custom typed algebra to basic SQL approximations
  const handleParseAlgebra = () => {
    let raw = algebraInput.trim();
    let sqlResult = generatedSql;

    // Check if it matches existing presets
    const matched = ALGEBRA_PRESETS.find(p => p.algebra.toLowerCase().replace(/\s+/g, '') === raw.toLowerCase().replace(/\s+/g, ''));
    if (matched) {
      sqlResult = matched.sql;
      setActiveDataset(matched.dataset);
    } else {
      // Simple rule-based parser for common patterns:
      // Pattern 1: π_{cols}(σ_{cond}(table))
      const combinedMatch = raw.match(/π_\{([^}]+)\}\s*\(\s*σ_\{([^}]+)\}\s*\(([^)]+)\)\s*\)/i);
      if (combinedMatch) {
        const cols = combinedMatch[1].replace(/,/g, ', ');
        let cond = combinedMatch[2].replace(/AND/gi, ' AND ').replace(/OR/gi, ' OR ');
        const table = combinedMatch[3].trim();
        sqlResult = `SELECT ${cols} FROM ${table} WHERE ${cond};`;
      } else {
        // Pattern 2: σ_{cond}(table)
        const selectMatch = raw.match(/σ_\{([^}]+)\}\s*\(([^)]+)\)/i);
        if (selectMatch) {
          const cond = selectMatch[1].trim();
          const table = selectMatch[2].trim();
          sqlResult = `SELECT * FROM ${table} WHERE ${cond};`;
        } else {
          // Pattern 3: π_{cols}(table)
          const projMatch = raw.match(/π_\{([^}]+)\}\s*\(([^)]+)\)/i);
          if (projMatch) {
            const cols = projMatch[1].replace(/,/g, ', ');
            const table = projMatch[2].trim();
            sqlResult = `SELECT ${cols} FROM ${table};`;
          } else if (raw.includes('⋈') || raw.includes('JOIN')) {
            sqlResult = 'SELECT * FROM mahasiswa m INNER JOIN jurusan j ON m.id_jurusan = j.id_jurusan;';
          }
        }
      }
    }

    setGeneratedSql(sqlResult);
    handleExecuteSql(sqlResult);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <span>Simulator Aljabar Relasional</span>
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
            <span>Matematika Basis Data</span>
            <span aria-hidden="true" className="hidden xs:inline">·</span>
            <span>Konversi Simbol ke SQL & Tabel Eksekusi</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>Materi Inti UTS</span>
          </div>
        </div>

        {/* View Tabs & Mobile Preset Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'simulator'
                  ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Simulator & Evaluator
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'theory'
                  ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Simbol & Teori
            </button>
          </div>

          {activeTab === 'simulator' && (
            <button
              onClick={() => setIsMobilePresetOpen(!isMobilePresetOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs cursor-pointer"
            >
              <TableIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pilih Kasus ({ALGEBRA_PRESETS.length})</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'simulator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Preset Examples (Collapsible on mobile, 4 cols on desktop) */}
          <div className={`lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs ${
            isMobilePresetOpen ? 'block' : 'hidden lg:block'
          }`}>
            <div className="text-xs font-bold text-slate-900 px-1 py-1 uppercase tracking-wider border-b border-slate-100 mb-3 flex items-center justify-between">
              <span>Contoh Kasus Ujian</span>
              <span className="text-[10px] text-slate-400 font-mono">({ALGEBRA_PRESETS.length} Kasus)</span>
            </div>

            <div className="space-y-2 max-h-72 sm:max-h-[580px] overflow-y-auto pr-1">
              {ALGEBRA_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 shadow-xs'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-900 truncate">
                        {p.title}
                      </span>
                      <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {p.operator}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-indigo-700 font-medium truncate mb-1">
                      {p.algebra}
                    </div>

                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {p.explanation}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Expression Workspace, SQL Translation, and Live Result Table (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Expression Box & Quick Insert Toolbar */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Ekspresi Aljabar Relasional:
                </label>
                <div className="text-[11px] text-slate-500">
                  Database: <strong className="text-slate-800 capitalize">{activeDataset}</strong>
                </div>
              </div>

              {/* Symbol Keyboard Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/80 mb-3">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">Sisipkan Simbol:</span>
                <button
                  onClick={() => insertSymbol('σ_{kondisi}(tabel)')}
                  title="Seleksi (Filter Baris)"
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  σ (Seleksi)
                </button>
                <button
                  onClick={() => insertSymbol('π_{kolom}(tabel)')}
                  title="Proyeksi (Pilih Kolom)"
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  π (Proyeksi)
                </button>
                <button
                  onClick={() => insertSymbol(' ⋈ ')}
                  title="Natural Join"
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  ⋈ (Natural Join)
                </button>
                <button
                  onClick={() => insertSymbol(' ⋈_{kondisi} ')}
                  title="Theta Join"
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  ⋈θ (Theta Join)
                </button>
                <button
                  onClick={() => insertSymbol(' × ')}
                  title="Cartesian Product"
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  × (Product)
                </button>
                <button
                  onClick={() => insertSymbol(' ∪ ')}
                  title="Union"
                  className="px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  ∪ (Union)
                </button>
                <button
                  onClick={() => insertSymbol(' ∩ ')}
                  title="Intersection"
                  className="px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  ∩ (Irisan)
                </button>
                <button
                  onClick={() => insertSymbol(' - ')}
                  title="Set Difference"
                  className="px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  − (Selisih)
                </button>
                <button
                  onClick={() => insertSymbol('ρ_{alias}(tabel)')}
                  title="Rename"
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  ρ (Rename)
                </button>
              </div>

              {/* Expression Input Area */}
              <div className="relative">
                <textarea
                  value={algebraInput}
                  onChange={(e) => setAlgebraInput(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-lg border border-slate-300 bg-slate-50 font-mono text-sm text-slate-900 leading-relaxed outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  placeholder="Ketik rumus aljabar relasional di sini..."
                />
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  {activePreset.explanation}
                </span>

                <button
                  onClick={handleParseAlgebra}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Evaluasi & Konversi ke SQL</span>
                </button>
              </div>
            </div>

            {/* Generated SQL Translation Box */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Padanan Kueri SQL (Equivalent SQL Query):
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySql}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin SQL</span>
                      </>
                    )}
                  </button>

                  {onOpenInLab && (
                    <button
                      onClick={() => onOpenInLab(generatedSql)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer ml-2"
                    >
                      Buka di Playground →
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-slate-900 p-3.5 font-mono text-xs text-emerald-400 overflow-x-auto">
                <pre>{generatedSql}</pre>
              </div>
            </div>

            {/* Live Resulting Relational Table */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Tabel Relasi Hasil Operasi Aljabar
                  </h3>
                </div>

                {queryResult && queryResult.success && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
                    <span>{queryResult.rowCount} tupel/baris</span>
                    <span aria-hidden="true">·</span>
                    <span>{queryResult.executionTimeMs} ms</span>
                  </div>
                )}
              </div>

              <div className="p-0">
                {queryResult && !queryResult.success && (
                  <div className="p-4 bg-rose-50 text-rose-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Gagal Mengevaluasi Operasi:</strong>
                      <div className="mt-1">{queryResult.error}</div>
                    </div>
                  </div>
                )}

                {queryResult && queryResult.success && queryResult.rows.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Operasi aljabar tidak menghasilkan tupel/baris data (0 baris).
                  </div>
                )}

                {queryResult && queryResult.success && queryResult.rows.length > 0 && (
                  <div className="overflow-x-auto max-h-72">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 sticky top-0 z-10">
                          <th className="py-2.5 px-3 text-slate-400 font-mono text-[11px] w-12 text-center">#</th>
                          {queryResult.columns.map((col, idx) => (
                            <th key={idx} className="py-2.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {queryResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px] tabular-nums">
                              {rIdx + 1}
                            </td>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="py-2 px-4 text-slate-800 whitespace-nowrap font-mono tabular-nums">
                                {cell === null || cell === undefined ? 'NULL' : String(cell)}
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
        </div>
      ) : (
        /* Theory & Formula Cheatsheet Tab */
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Panduan Lengkap Simbol Aljabar Relasional
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Aljabar Relasional adalah bahasa kueri prosedural teoritis yang menjadi landasan matematis dari bahasa SQL. Setiap operasi menerima satu atau dua relasi sebagai masukan dan menghasilkan relasi baru sebagai luaran.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th className="py-3 px-4 font-bold">Simbol</th>
                    <th className="py-3 px-4 font-bold">Nama Operasi</th>
                    <th className="py-3 px-4 font-bold">Notasi Matematika</th>
                    <th className="py-3 px-4 font-bold">Padanan Klausa SQL</th>
                    <th className="py-3 px-4 font-bold">Deskripsi Fungsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-base text-indigo-700">σ</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">Seleksi (Select)</td>
                    <td className="py-3 px-4 font-mono text-slate-800">σ_{`{kondisi}`}(R)</td>
                    <td className="py-3 px-4 font-mono text-emerald-700">WHERE kondisi</td>
                    <td className="py-3 px-4 text-slate-600">Memilih baris (tupel) horizontal yang memenuhi kondisi predikat.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-base text-indigo-700">π</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">Proyeksi (Project)</td>
                    <td className="py-3 px-4 font-mono text-slate-800">π_{`{A1, A2}`}(R)</td>
                    <td className="py-3 px-4 font-mono text-emerald-700">SELECT A1, A2</td>
                    <td className="py-3 px-4 text-slate-600">Memilih kolom vertikal dan menghilangkan kolom lain yang tidak dibutuhkan.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-base text-indigo-700">⋈</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">Natural Join</td>
                    <td className="py-3 px-4 font-mono text-slate-800">R ⋈ S</td>
                    <td className="py-3 px-4 font-mono text-emerald-700">NATURAL JOIN</td>
                    <td className="py-3 px-4 text-slate-600">Menggabungkan relasi berdasarkan kesamaan nilai atribut yang bernama sama.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-base text-indigo-700">⋈θ</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">Theta Join</td>
                    <td className="py-3 px-4 font-mono text-slate-800">R ⋈_{`{kondisi}`} S</td>
                    <td className="py-3 px-4 font-mono text-emerald-700">JOIN ON kondisi</td>
                    <td className="py-3 px-4 text-slate-600">Menggabungkan dua tabel dengan kondisi pembanding spesifik (misal R.id = S.id_r).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-base text-indigo-700">×</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">Cartesian Product</td>
                    <td className="py-3 px-4 font-mono text-slate-800">R × S</td>
                    <td className="py-3 px-4 font-mono text-emerald-700">CROSS JOIN</td>
                    <td className="py-3 px-4 text-slate-600">Menghasilkan semua kombinasi baris dari relasi R dan relasi S.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-base text-indigo-700">∪</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">Union (Gabungan)</td>
                    <td className="py-3 px-4 font-mono text-slate-800">R ∪ S</td>
                    <td className="py-3 px-4 font-mono text-emerald-700">UNION</td>
                    <td className="py-3 px-4 text-slate-600">Menggabungkan baris dari dua relasi yang kompatibel tipenya (union compatible).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-base text-indigo-700">−</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">Set Difference</td>
                    <td className="py-3 px-4 font-mono text-slate-800">R − S</td>
                    <td className="py-3 px-4 font-mono text-emerald-700">EXCEPT / NOT IN</td>
                    <td className="py-3 px-4 text-slate-600">Menghasilkan tupel yang ada di R tetapi tidak ada di S.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-base text-indigo-700">ρ</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">Rename (Ganti Nama)</td>
                    <td className="py-3 px-4 font-mono text-slate-800">ρ_{`{S}`}(R)</td>
                    <td className="py-3 px-4 font-mono text-emerald-700">FROM R AS S</td>
                    <td className="py-3 px-4 text-slate-600">Memberikan nama alias pada relasi atau atribut.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
