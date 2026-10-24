import React, { useState } from 'react';
import { SQL_CHEATSHEET_ITEMS } from '../data/sqlCheatsheetData';
import { Search, Copy, Check, Terminal, BookOpen } from 'lucide-react';

interface SqlCheatsheetProps {
  onOpenInLab: (sql: string) => void;
}

export const SqlCheatsheet: React.FC<SqlCheatsheetProps> = ({ onOpenInLab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('Semua');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['Semua', 'DDL (Data Definition)', 'DML (Kueri & Filter)', 'JOIN (Relasi Antar Tabel)', 'Agregasi & Grouping', 'Subquery (Kueri Bersarang)', 'DML (Modifikasi Data)'];

  const filteredItems = SQL_CHEATSHEET_ITEMS.filter((item) => {
    const matchesCat = selectedCat === 'Semua' || item.category === selectedCat;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.example.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Kamus & Cheat Sheet Sintaks SQL
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
            <span>Referensi Cepat Mahasiswa</span>
            <span aria-hidden="true" className="hidden xs:inline">·</span>
            <span>Aturan Integritas & Contoh Kueri</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>Salin atau Buka Langsung di Lab</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari klausa (GROUP BY, JOIN, dll)..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none text-xs mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCat === cat
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cheatsheet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <span className="text-[11px] font-semibold text-indigo-700 font-mono">
                  {item.category}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{item.id}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">
                {item.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {item.description}
              </p>

              {/* Code Syntax Block */}
              <div className="mb-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Sintaks Standar:
                </div>
                <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-200 overflow-x-auto">
                  <pre>{item.syntax}</pre>
                </div>
              </div>

              {/* Example Code Block */}
              <div className="mb-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Contoh Kueri Nyata:
                </div>
                <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-400 overflow-x-auto">
                  <pre>{item.example}</pre>
                </div>
              </div>

              {/* Important Rules List */}
              <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-700 space-y-1 mb-4 border border-slate-100">
                <div className="font-semibold text-slate-900 mb-1">Aturan Penting:</div>
                <ul className="list-disc list-inside space-y-0.5">
                  {item.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopy(item.id, item.example)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Contoh</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onOpenInLab(item.example)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Uji di SQL Lab →</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
