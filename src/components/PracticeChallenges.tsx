import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  Eye, 
  ArrowRight, 
  RotateCcw, 
  Play, 
  AlertCircle, 
  BookOpen,
  ListOrdered,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PRACTICE_CHALLENGES } from '../data/practiceChallenges';
import { DATASETS } from '../data/databaseDatasets';
import { sqlEngine } from '../services/sqlEngine';
import { Challenge, ChallengeDifficulty, QueryResult } from '../types/database';

interface PracticeChallengesProps {
  completedIds: string[];
  onToggleComplete: (id: string) => void;
}

export const PracticeChallenges: React.FC<PracticeChallengesProps> = ({
  completedIds,
  onToggleComplete
}) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(PRACTICE_CHALLENGES[0].id);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('Semua');
  const [userQuery, setUserQuery] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);
  const [evalResult, setEvalResult] = useState<{
    passed: boolean;
    userResult: QueryResult;
    expectedResult: QueryResult;
    feedback: string;
  } | null>(null);

  const activeChallenge: Challenge =
    PRACTICE_CHALLENGES.find((c) => c.id === selectedChallengeId) || PRACTICE_CHALLENGES[0];

  const currentDataset = DATASETS[activeChallenge.dataset];

  // Sync user query when challenge changes
  useEffect(() => {
    setUserQuery(activeChallenge.starterSql);
    setEvalResult(null);
    setShowHint(false);
    setShowSolution(false);
  }, [selectedChallengeId]);

  // Filtered challenges list
  const filteredChallenges = PRACTICE_CHALLENGES.filter((c) => {
    if (difficultyFilter === 'Semua') return true;
    return c.difficulty === difficultyFilter;
  });

  const handleRunEvaluation = () => {
    const res = sqlEngine.evaluateChallenge(
      activeChallenge.dataset,
      userQuery,
      activeChallenge.solutionSql,
      activeChallenge.checkType || 'columns_and_rows',
      activeChallenge.mutationVerificationSql
    );
    setEvalResult(res);

    if (res.passed && !completedIds.includes(activeChallenge.id)) {
      onToggleComplete(activeChallenge.id);
    }
  };

  const handleResetChallenge = () => {
    setUserQuery(activeChallenge.starterSql);
    setEvalResult(null);
    sqlEngine.resetDataset(activeChallenge.dataset);
  };

  const handleNextChallenge = () => {
    const currentIndex = PRACTICE_CHALLENGES.findIndex((c) => c.id === activeChallenge.id);
    if (currentIndex < PRACTICE_CHALLENGES.length - 1) {
      setSelectedChallengeId(PRACTICE_CHALLENGES[currentIndex + 1].id);
    }
  };

  const activeIndex = PRACTICE_CHALLENGES.findIndex((c) => c.id === activeChallenge.id) + 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header and Progress Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Laboratorium Praktik SQL Terbimbing
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
            <span>Uji Otomatis & Pembanding Luaran</span>
            <span aria-hidden="true" className="hidden xs:inline">·</span>
            <span className="font-mono tabular-nums text-indigo-600 font-semibold">
              {completedIds.length} dari {PRACTICE_CHALLENGES.length} Diselesaikan
            </span>
          </div>
        </div>

        {/* Progress Bar & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium text-center">
            {['Semua', 'Pemula', 'Menengah', 'Mahir'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficultyFilter(lvl)}
                className={`px-2 sm:px-3 py-1.5 rounded-md transition-all cursor-pointer truncate ${
                  difficultyFilter === lvl
                    ? 'bg-white text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Mobile Toggle Drawer for Challenge List */}
          <button
            onClick={() => setIsMobileListOpen(!isMobileListOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs cursor-pointer"
          >
            <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pilih Soal ({activeIndex}/18)</span>
            {isMobileListOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Challenge List (Collapsible on mobile, 4 cols on desktop) */}
        <div className={`lg:col-span-4 rounded-xl border border-slate-200 bg-white p-3 shadow-xs ${
          isMobileListOpen ? 'block' : 'hidden lg:block'
        }`}>
          <div className="text-xs font-bold text-slate-900 px-3 py-2 uppercase tracking-wider border-b border-slate-100 mb-2 flex items-center justify-between">
            <span>Daftar Soal Praktik ({filteredChallenges.length})</span>
            <span className="text-[11px] font-mono text-indigo-600 font-semibold">
              {completedIds.length} Selesai
            </span>
          </div>

          <div className="space-y-1.5 max-h-80 sm:max-h-[580px] overflow-y-auto pr-1">
            {filteredChallenges.map((item, idx) => {
              const isCompleted = completedIds.includes(item.id);
              const isSelected = selectedChallengeId === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedChallengeId(item.id);
                    setIsMobileListOpen(false);
                  }}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-mono text-slate-500">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className={
                        item.difficulty === 'Pemula' ? 'text-emerald-700 font-medium' :
                        item.difficulty === 'Menengah' ? 'text-amber-700 font-medium' : 'text-purple-700 font-medium'
                      }>
                        {item.difficulty}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{item.category}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Area: Challenge Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Challenge Description Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500">
                <span className="font-semibold text-indigo-700">Soal #{activeIndex}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-slate-700">{activeChallenge.category}</span>
                <span aria-hidden="true" className="hidden xs:inline">·</span>
                <span className="hidden xs:inline">Database: <strong className="text-slate-800">{currentDataset.title}</strong></span>
              </div>

              {completedIds.includes(activeChallenge.id) && (
                <div className="text-xs font-medium text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Selesai</span>
                </div>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              {activeChallenge.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal mb-4">
              {activeChallenge.description}
            </p>

            {/* Hint & Solution Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 rounded-lg transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>{showHint ? 'Tutup Petunjuk' : 'Bantuan Petunjuk'}</span>
              </button>

              <button
                onClick={() => setShowSolution(!showSolution)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 rounded-lg transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{showSolution ? 'Tutup Kunci Jawaban' : 'Kunci Jawaban'}</span>
              </button>
            </div>

            {showHint && (
              <div className="mt-3 p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong>Petunjuk Pengerjaan:</strong> {activeChallenge.hint}
              </div>
            )}

            {showSolution && (
              <div className="mt-3 p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono">
                <div className="text-[11px] text-slate-400 mb-1 font-sans font-semibold">
                  Solusi SQL Rekomendasi:
                </div>
                <pre className="whitespace-pre-wrap overflow-x-auto">{activeChallenge.solutionSql}</pre>
              </div>
            )}
          </div>

          {/* Challenge SQL Editor */}
          <div className="rounded-xl border border-slate-300 bg-slate-900 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-mono text-slate-300 font-medium">Editor Jawaban SQL</span>
              <button
                onClick={handleResetChallenge}
                className="flex items-center gap-1 hover:text-slate-200 transition-colors cursor-pointer text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Starter</span>
              </button>
            </div>

            <div className="p-3">
              <textarea
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                rows={4}
                spellCheck={false}
                placeholder="Tulis kueri jawaban Anda di sini..."
                className="w-full bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-relaxed outline-none resize-y selection:bg-indigo-700 selection:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-slate-950/80 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">
                Pastikan kolom dan urutan sesuai instruksi soal.
              </span>
              <button
                onClick={handleRunEvaluation}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Jalankan & Nilai</span>
              </button>
            </div>
          </div>

          {/* Evaluation Result Feedback */}
          {evalResult && (
            <div className={`rounded-xl border p-4 sm:p-5 shadow-xs ${
              evalResult.passed
                ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                : 'border-rose-200 bg-rose-50/50 text-rose-950'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  {evalResult.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold">
                      {evalResult.passed ? 'Jawaban Benar! Selamat!' : 'Hasil Belum Sesuai'}
                    </h4>
                    <p className="text-xs mt-0.5 leading-relaxed">
                      {evalResult.feedback}
                    </p>
                  </div>
                </div>

                {evalResult.passed && (
                  <button
                    onClick={handleNextChallenge}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    <span>Soal Berikutnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Compare Tables if not passed */}
              {!evalResult.passed && evalResult.userResult.success && (
                <div className="mt-4 pt-4 border-t border-rose-200/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Luaran Kueri Anda:
                    </div>
                    <div className="overflow-x-auto max-h-48 border border-slate-200 rounded-lg bg-white">
                      <table className="w-full text-left text-[11px] border-collapse font-mono">
                        <thead className="bg-slate-100">
                          <tr>
                            {evalResult.userResult.columns.map((c, i) => (
                              <th key={i} className="py-1 px-2 border-b border-slate-200 whitespace-nowrap">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {evalResult.userResult.rows.map((r, ri) => (
                            <tr key={ri} className="border-b border-slate-100">
                              {r.map((val, ci) => (
                                <td key={ci} className="py-1 px-2 whitespace-nowrap">{String(val)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Target Luaran yang Diharapkan:
                    </div>
                    <div className="overflow-x-auto max-h-48 border border-slate-200 rounded-lg bg-white">
                      <table className="w-full text-left text-[11px] border-collapse font-mono">
                        <thead className="bg-slate-100">
                          <tr>
                            {evalResult.expectedResult.columns.map((c, i) => (
                              <th key={i} className="py-1 px-2 border-b border-slate-200 whitespace-nowrap">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {evalResult.expectedResult.rows.map((r, ri) => (
                            <tr key={ri} className="border-b border-slate-100">
                              {r.map((val, ci) => (
                                <td key={ci} className="py-1 px-2 whitespace-nowrap">{String(val)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
