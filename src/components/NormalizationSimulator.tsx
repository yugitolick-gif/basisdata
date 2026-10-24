import React, { useState } from 'react';
import { 
  Layers, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Key, 
  Link as LinkIcon,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { NORMALIZATION_STAGES } from '../data/normalizationData';
import { NormalizationStage } from '../types/database';

interface NormalizationSimulatorProps {
  onStageExplored?: (stage: string) => void;
}

export const NormalizationSimulator: React.FC<NormalizationSimulatorProps> = ({ onStageExplored }) => {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const activeStage: NormalizationStage = NORMALIZATION_STAGES[currentStageIdx];

  // Report stage exploration
  React.useEffect(() => {
    if (onStageExplored && activeStage) {
      onStageExplored(activeStage.stage);
    }
  }, [currentStageIdx]);

  const stageKeys = ['UNF', '1NF', '2NF', '3NF'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Simulator Interaktif Normalisasi Basis Data
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
            <span>Metodologi Perancangan Skema</span>
            <span aria-hidden="true" className="hidden xs:inline">·</span>
            <span>Eliminasi Redundansi & Anomali Data</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="font-semibold text-emerald-700">Tahap {activeStage.stage}</span>
          </div>
        </div>

        {/* Stepper Tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium overflow-x-auto max-w-full scrollbar-none">
          {NORMALIZATION_STAGES.map((s, idx) => (
            <button
              key={s.stage}
              onClick={() => setCurrentStageIdx(idx)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentStageIdx === idx
                  ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{s.stage}</span>
              {currentStageIdx > idx && (
                <CheckCircle className="w-3 h-3 text-emerald-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stage Explainer Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 sm:pb-5 mb-5">
          <div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              Tahap {currentStageIdx + 1} dari 4: {activeStage.stage}
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {activeStage.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
              {activeStage.ruleDescription}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentStageIdx(prev => Math.max(0, prev - 1))}
              disabled={currentStageIdx === 0}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
            <button
              onClick={() => setCurrentStageIdx(prev => Math.min(NORMALIZATION_STAGES.length - 1, prev + 1))}
              disabled={currentStageIdx === NORMALIZATION_STAGES.length - 1}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>Lanjut ke Tahap Berikut</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Anomalies Detected Callout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border text-xs ${
            activeStage.stage === '3NF'
              ? 'border-emerald-200 bg-emerald-50/60 text-emerald-950'
              : 'border-amber-200 bg-amber-50/60 text-amber-950'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-2">
              {activeStage.stage === '3NF' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span>Status Anomali & Evaluasi Aturan:</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-slate-800">
              {activeStage.anomaliesDetected.map((anom, idx) => (
                <li key={idx}>{anom}</li>
              ))}
            </ul>
          </div>

          {/* Functional Dependencies Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
            <div className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ketergantungan Fungsional (Functional Dependency):</span>
            </div>
            <div className="space-y-2">
              {activeStage.dependencies.map((dep, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <div className="font-mono text-indigo-700 font-semibold">
                    {dep.determinant.join(', ')} → {dep.dependent.join(', ')}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    <span className="font-semibold">Tipe: {dep.type} Dependency</span> — {dep.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resulting Tables Display at this Normalization Stage */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <span>Skema Tabel pada Tahap {activeStage.stage} ({activeStage.tables.length} Tabel)</span>
          </h3>
          <span className="text-xs text-slate-500 italic">
            {activeStage.summaryNote}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {activeStage.tables.map((tbl, tIdx) => (
            <div key={tIdx} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold font-mono text-slate-900">
                    {tbl.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {tbl.description}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/60 border-b border-slate-200">
                      {tbl.columns.map((col, cIdx) => (
                        <th key={cIdx} className="py-2.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
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
                            <span>{col.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tbl.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {tbl.columns.map((col, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-4 font-mono text-slate-800 tabular-nums whitespace-nowrap">
                            {row[col.name] !== undefined ? String(row[col.name]) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
