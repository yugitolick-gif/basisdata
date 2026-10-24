import React, { useState } from 'react';
import { DATASETS } from '../data/databaseDatasets';
import { DatasetKey, TableSchema } from '../types/database';
import { Key, Link as LinkIcon, Eye, X, Table as TableIcon } from 'lucide-react';

interface ErdVisualizerProps {
  activeDataset: DatasetKey;
  setActiveDataset: (key: DatasetKey) => void;
  onOpenInLab?: (sql: string) => void;
}

export const ErdVisualizer: React.FC<ErdVisualizerProps> = ({
  activeDataset,
  setActiveDataset,
  onOpenInLab
}) => {
  const [inspectTable, setInspectTable] = useState<TableSchema | null>(null);

  const dataset = DATASETS[activeDataset];
  const tables = Object.values(dataset.tables);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header and Dataset Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Visualisator Skema Relasional & ERD
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
            <span>Pemodelan Relasi Tabel</span>
            <span aria-hidden="true" className="hidden xs:inline">·</span>
            <span>Primary Key & Integritas Foreign Key</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>{tables.length} Entitas Terdaftar</span>
          </div>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium overflow-x-auto max-w-full scrollbar-none">
          <button
            onClick={() => setActiveDataset('universitas')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeDataset === 'universitas'
                ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Akademik Kampus
          </button>
          <button
            onClick={() => setActiveDataset('ecommerce')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeDataset === 'ecommerce'
                ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            E-Commerce
          </button>
          <button
            onClick={() => setActiveDataset('rumahsakit')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeDataset === 'rumahsakit'
                ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rumah Sakit
          </button>
        </div>
      </div>

      {/* Grid of Relational Entity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {tables.map((table) => (
          <div
            key={table.name}
            className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            {/* Table Header */}
            <div>
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <TableIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {table.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {table.displayName}
                  </div>
                </div>

                <button
                  onClick={() => setInspectTable(table)}
                  className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded bg-indigo-50/70 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Sampel</span>
                </button>
              </div>

              {/* Columns List */}
              <div className="p-3 divide-y divide-slate-100 text-xs">
                {table.columns.map((col, cIdx) => (
                  <div key={cIdx} className="py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {col.isPk ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-mono shrink-0">
                          <Key className="w-2.5 h-2.5" />
                          <span>PK</span>
                        </span>
                      ) : col.isFk ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-sky-800 bg-sky-100 px-1.5 py-0.5 rounded font-mono shrink-0">
                          <LinkIcon className="w-2.5 h-2.5" />
                          <span>FK</span>
                        </span>
                      ) : (
                        <span className="w-7 shrink-0 text-slate-300 text-center font-mono text-[10px]">
                          ·
                        </span>
                      )}

                      <div className="truncate">
                        <span className={`font-mono ${col.isPk ? 'font-bold text-slate-900' : 'text-slate-800'}`}>
                          {col.name}
                        </span>
                        {col.fkTarget && (
                          <span className="text-[10px] text-sky-600 font-mono block truncate">
                            → {col.fkTarget}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="font-mono text-[11px] text-slate-400 shrink-0">
                      {col.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Table Footer Action */}
            <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>{table.sampleData.length} sampel rekaman</span>
              {onOpenInLab && (
                <button
                  onClick={() => onOpenInLab(`SELECT * FROM ${table.name};`)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
                >
                  Buka di Lab →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Table Sample Data Modal */}
      {inspectTable && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-indigo-600" />
                  <span>Sampel Data Tabel: <code className="text-indigo-700 font-mono">{inspectTable.name}</code></span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {inspectTable.description}
                </p>
              </div>
              <button
                onClick={() => setInspectTable(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {inspectTable.columns.map((col, idx) => (
                        <th key={idx} className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspectTable.sampleData.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {inspectTable.columns.map((col, cIdx) => (
                          <td key={cIdx} className="py-2 px-3 font-mono text-slate-800 tabular-nums whitespace-nowrap">
                            {row[col.name] !== undefined ? String(row[col.name]) : 'NULL'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInspectTable(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
