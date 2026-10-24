import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { QuizQuestion } from '../types/database';

interface QuizModuleProps {
  onExamCompleted?: (percentage: number) => void;
}

export const QuizModule: React.FC<QuizModuleProps> = ({ onExamCompleted }) => {
  const [examMode, setExamMode] = useState<'study' | 'exam'>('study');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // State for Study Mode
  const [studyAnswers, setStudyAnswers] = useState<Record<string, number>>({});
  
  // State for Exam Mode
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Filtered questions based on category for study mode
  const currentQuestions = examMode === 'exam' 
    ? QUIZ_QUESTIONS 
    : QUIZ_QUESTIONS.filter(q => selectedCategory === 'Semua' || q.category === selectedCategory);

  const activeQuestion: QuizQuestion = currentQuestions[currentIndex] || currentQuestions[0];

  const triggerSubmitExam = () => {
    setExamSubmitted(true);
    setIsTimerRunning(false);
    if (onExamCompleted) {
      let correctCount = 0;
      QUIZ_QUESTIONS.forEach(q => {
        if (examAnswers[q.id] === q.correctAnswer) {
          correctCount++;
        }
      });
      const percentage = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
      onExamCompleted(percentage);
    }
  };

  // Timer effect for exam mode
  useEffect(() => {
    let interval: any = null;
    if (examMode === 'exam' && isTimerRunning && timeLeft > 0 && !examSubmitted) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            triggerSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examMode, isTimerRunning, timeLeft, examSubmitted, examAnswers]);

  const handleStartExam = () => {
    setExamMode('exam');
    setExamAnswers({});
    setExamSubmitted(false);
    setTimeLeft(15 * 60);
    setIsTimerRunning(true);
    setCurrentIndex(0);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (examMode === 'study') {
      setStudyAnswers(prev => ({
        ...prev,
        [activeQuestion.id]: optionIndex
      }));
    } else {
      if (examSubmitted) return;
      setExamAnswers(prev => ({
        ...prev,
        [activeQuestion.id]: optionIndex
      }));
    }
  };

  const handleResetStudy = () => {
    setStudyAnswers({});
    setCurrentIndex(0);
  };

  // Exam Score Calculation
  const calculateExamScore = () => {
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (examAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    const percentage = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
    return { correctCount, total: QUIZ_QUESTIONS.length, percentage };
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentAnswer = examMode === 'study'
    ? studyAnswers[activeQuestion.id]
    : examAnswers[activeQuestion.id];

  const isAnswered = currentAnswer !== undefined;
  const isCorrect = isAnswered && currentAnswer === activeQuestion.correctAnswer;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Kuis & Ujian Evaluasi Basis Data
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
            <span>Standar Kurikulum Akademik</span>
            <span aria-hidden="true" className="hidden xs:inline">·</span>
            <span>Relasional, DDL, DML, Agregasi & Normalisasi</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="font-mono tabular-nums text-indigo-600 font-semibold">
              {QUIZ_QUESTIONS.length} Bank Soal
            </span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium text-center">
            <button
              onClick={() => {
                setExamMode('study');
                setIsTimerRunning(false);
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-all cursor-pointer truncate ${
                examMode === 'study'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="sm:hidden">Belajar</span>
              <span className="hidden sm:inline">Mode Belajar</span>
            </button>
            <button
              onClick={handleStartExam}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-all cursor-pointer truncate ${
                examMode === 'exam'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="sm:hidden">Ujian (15m)</span>
              <span className="hidden sm:inline">Simulasi Ujian (15 Mnt)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs for Study Mode */}
      {examMode === 'study' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none text-xs mb-4">
          {['Semua', 'Konsep Dasar & Relasional', 'SQL DDL & Constraint', 'SQL DML & JOIN', 'Agregasi & Subquery', 'Normalisasi & ACID'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Exam Mode Timer Bar */}
      {examMode === 'exam' && !examSubmitted && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 rounded-xl border border-amber-200 bg-amber-50/70 mb-6 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Waktu Ujian: <strong className="font-mono tabular-nums text-sm">{formatTime(timeLeft)}</strong></span>
          </div>
          <button
            onClick={triggerSubmitExam}
            className="px-3.5 py-2 sm:py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors cursor-pointer shadow-xs whitespace-nowrap text-center"
          >
            Selesaikan & Kumpulkan Ujian
          </button>
        </div>
      )}

      {/* Exam Result Report if Submitted */}
      {examMode === 'exam' && examSubmitted && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs mb-8">
          {(() => {
            const { correctCount, total, percentage } = calculateExamScore();
            const gradeLetter = percentage >= 85 ? 'A' : percentage >= 75 ? 'B+' : percentage >= 65 ? 'B' : percentage >= 55 ? 'C' : 'D';
            return (
              <div className="text-center max-w-xl mx-auto py-4">
                <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Hasil Simulasi Ujian Basis Data
                </h3>
                <div className="mt-4 flex items-center justify-center gap-6 text-slate-600 font-medium">
                  <div>
                    <span className="text-3xl font-extrabold text-indigo-600 font-mono tabular-nums">{percentage}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">Skor Akhir (100)</span>
                  </div>
                  <div className="w-px h-10 bg-slate-200" />
                  <div>
                    <span className="text-3xl font-extrabold text-slate-800 font-mono tabular-nums">{correctCount}/{total}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">Jawaban Benar</span>
                  </div>
                  <div className="w-px h-10 bg-slate-200" />
                  <div>
                    <span className="text-3xl font-extrabold text-emerald-600 font-mono">{gradeLetter}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">Predikat Mutu</span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                  {percentage >= 75 
                    ? 'Pemahaman Anda mengenai konsep basis data dan kueri relasional sangat kuat. Terus pertahankan!'
                    : 'Masih ada beberapa konsep SQL atau normalisasi yang perlu diperdalam. Tinjau kembali pembahasan di bawah.'}
                </p>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={handleStartExam}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi Simulasi Ujian</span>
                  </button>
                  <button
                    onClick={() => setExamMode('study')}
                    className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Kembali ke Mode Belajar
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Main Question Card & Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Area (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          {/* Question Meta Strip */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-indigo-700 font-mono">
                Soal #{currentIndex + 1}
              </span>
              <span aria-hidden="true">·</span>
              <span>Kategori: {activeQuestion.category}</span>
            </div>
            <span className="font-mono tabular-nums text-slate-400">
              {currentIndex + 1} dari {currentQuestions.length}
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed mb-4">
            {activeQuestion.question}
          </h3>

          {/* Code Snippet if applicable */}
          {activeQuestion.codeSnippet && (
            <div className="mb-5 rounded-lg bg-slate-900 p-3.5 text-xs font-mono text-emerald-400 overflow-x-auto">
              <pre>{activeQuestion.codeSnippet}</pre>
            </div>
          )}

          {/* Option Choices */}
          <div className="space-y-3 mb-6">
            {activeQuestion.options.map((optionText, optIdx) => {
              const isSelected = currentAnswer === optIdx;
              const isOptionCorrect = optIdx === activeQuestion.correctAnswer;
              
              let optionStyles = 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50';

              if (examMode === 'study') {
                if (isAnswered) {
                  if (isSelected && isOptionCorrect) {
                    optionStyles = 'border-emerald-400 bg-emerald-50/70 text-emerald-950 font-medium';
                  } else if (isSelected && !isOptionCorrect) {
                    optionStyles = 'border-rose-400 bg-rose-50/70 text-rose-950 font-medium';
                  } else if (isOptionCorrect) {
                    optionStyles = 'border-emerald-300 bg-emerald-50/40 text-emerald-900';
                  }
                }
              } else {
                // Exam mode
                if (examSubmitted) {
                  if (isSelected && isOptionCorrect) {
                    optionStyles = 'border-emerald-400 bg-emerald-50 text-emerald-950 font-medium';
                  } else if (isSelected && !isOptionCorrect) {
                    optionStyles = 'border-rose-400 bg-rose-50 text-rose-950 font-medium';
                  } else if (isOptionCorrect) {
                    optionStyles = 'border-emerald-300 bg-emerald-50/50 text-emerald-900';
                  }
                } else if (isSelected) {
                  optionStyles = 'border-indigo-500 bg-indigo-50/60 text-indigo-950 font-medium shadow-xs';
                }
              }

              const letters = ['A', 'B', 'C', 'D'];

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={examMode === 'exam' && examSubmitted}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 text-xs leading-relaxed ${optionStyles}`}
                >
                  <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center font-mono font-semibold text-[11px] shrink-0 mt-0.5">
                    {letters[optIdx]}
                  </span>
                  <span className="flex-1 text-slate-800">{optionText}</span>
                  {examMode === 'study' && isAnswered && isOptionCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {examMode === 'study' && isAnswered && isSelected && !isOptionCorrect && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box (Immediate in Study Mode or after Exam Submission) */}
          {(examMode === 'study' && isAnswered) || (examMode === 'exam' && examSubmitted) ? (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed mb-6 ${
              isCorrect ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/60'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1.5">
                {isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                )}
                <span className={isCorrect ? 'text-emerald-900' : 'text-amber-900'}>
                  {isCorrect ? 'Jawaban Benar!' : 'Pembahasan & Konsep:'}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed mb-2">
                {activeQuestion.explanation}
              </p>
              <div className="pt-2 border-t border-slate-200/50 text-[11px] font-semibold text-slate-800">
                Kunci Konsep: <span className="text-indigo-700 font-normal">{activeQuestion.keyTakeaway}</span>
              </div>
            </div>
          ) : null}

          {/* Navigation Buttons (Previous / Next) */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={() => setCurrentIndex(prev => Math.min(currentQuestions.length - 1, prev + 1))}
              disabled={currentIndex === currentQuestions.length - 1}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Question Number Grid & Overview (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Nomor Soal
            </h4>
            {examMode === 'study' && (
              <button
                onClick={handleResetStudy}
                className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Jawaban</span>
              </button>
            )}
          </div>

          {/* 5x3 Grid of Question Buttons */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {currentQuestions.map((q, idx) => {
              const ans = examMode === 'study' ? studyAnswers[q.id] : examAnswers[q.id];
              const isCurrent = idx === currentIndex;
              const hasAnswered = ans !== undefined;
              const isAnsCorrect = hasAnswered && ans === q.correctAnswer;

              let btnStyles = 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100';

              if (examMode === 'study' && hasAnswered) {
                btnStyles = isAnsCorrect 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold' 
                  : 'border-rose-400 bg-rose-50 text-rose-800 font-bold';
              } else if (examMode === 'exam') {
                if (examSubmitted) {
                  btnStyles = isAnsCorrect
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-rose-400 bg-rose-50 text-rose-800 font-bold';
                } else if (hasAnswered) {
                  btnStyles = 'border-indigo-400 bg-indigo-50 text-indigo-800 font-semibold';
                }
              }

              if (isCurrent) {
                btnStyles += ' ring-2 ring-indigo-600 ring-offset-1 font-extrabold';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-lg border text-xs font-mono tabular-nums flex items-center justify-center transition-all cursor-pointer ${btnStyles}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Jawaban Benar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Jawaban Salah</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              <span>Telah Dijawab (Mode Ujian)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
