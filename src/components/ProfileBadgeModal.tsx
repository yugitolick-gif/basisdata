import React, { useState } from 'react';
import { 
  Trophy, 
  X, 
  Sparkles, 
  Filter, 
  GitMerge, 
  BarChart3, 
  Zap, 
  Calculator, 
  Layers, 
  Database, 
  Lock, 
  CheckCircle2, 
  Award, 
  Share2, 
  Check, 
  Edit3, 
  GraduationCap,
  LogOut
} from 'lucide-react';
import { BADGE_DEFINITIONS, BadgeService } from '../services/badgeService';
import { Badge, UserProgressData } from '../types/badge';

interface ProfileBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProgress: UserProgressData;
  onUpdateProfileName: (name: string, nim: string) => void;
  onSwitchStudent?: () => void;
}

export const ProfileBadgeModal: React.FC<ProfileBadgeModalProps> = ({
  isOpen,
  onClose,
  userProgress,
  onUpdateProfileName,
  onSwitchStudent
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProgress.studentName);
  const [nimInput, setNimInput] = useState(userProgress.studentNim);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen) return null;

  const unlockedCount = Object.keys(userProgress.unlockedBadges).length;
  const totalBadges = BADGE_DEFINITIONS.length;
  const completionPercentage = Math.round((unlockedCount / totalBadges) * 100);

  // Student Rank Title
  let rankTitle = 'Calon Praktisi Basis Data';
  if (unlockedCount >= 8) rankTitle = 'Database Systems Master';
  else if (unlockedCount >= 6) rankTitle = 'Senior Query Analyst';
  else if (unlockedCount >= 4) rankTitle = 'Relational Specialist';
  else if (unlockedCount >= 2) rankTitle = 'SQL Apprentice';

  const categories = ['Semua', 'Praktik SQL', 'Aljabar & Teori', 'Normalisasi', 'Ujian & Skor'];

  const filteredBadges = BADGE_DEFINITIONS.filter(b => {
    if (selectedCategory === 'Semua') return true;
    return b.category === selectedCategory;
  });

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'Filter': return <Filter className="w-5 h-5 text-indigo-500" />;
      case 'GitMerge': return <GitMerge className="w-5 h-5 text-sky-500" />;
      case 'BarChart3': return <BarChart3 className="w-5 h-5 text-emerald-500" />;
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'Calculator': return <Calculator className="w-5 h-5 text-indigo-500" />;
      case 'Layers': return <Layers className="w-5 h-5 text-emerald-500" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'Database': return <Database className="w-5 h-5 text-purple-500" />;
      default: return <Award className="w-5 h-5 text-indigo-500" />;
    }
  };

  const handleSaveProfile = () => {
    onUpdateProfileName(nameInput.trim() || 'Mahasiswa Basis Data', nimInput.trim() || '2024-KOMP');
    setIsEditingName(false);
  };

  const handleShareSummary = () => {
    const text = `🏆 Profil Belajar BasisDataLab:
Mahasiswa: ${userProgress.studentName} (${userProgress.studentNim})
Kelas: ${userProgress.studentClass || '-'}
Gelar Kehormatan: ${rankTitle}
Lencana Terbuka: ${unlockedCount} dari ${totalBadges} (${completionPercentage}%)
Tantangan SQL Selesai: ${userProgress.completedChallengeIds.length}/18
Skor Ujian UAS Tertinggi: ${userProgress.examHighScore}/100`;

    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Profil & Lencana Mahasiswa
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden xs:block">
                Pencapaian akademik & praktikum basis data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleShareSummary}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Salin Rekap</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
          {/* Student Profile Card */}
          <div className="rounded-xl border border-slate-200 bg-linear-to-r from-slate-50 via-indigo-50/20 to-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                <GraduationCap className="w-7 h-7" />
              </div>

              <div>
                {isEditingName ? (
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Nama Lengkap"
                      className="px-2 py-1 text-xs font-bold rounded border border-indigo-300 bg-white"
                    />
                    <input
                      type="text"
                      value={nimInput}
                      onChange={(e) => setNimInput(e.target.value)}
                      placeholder="NIM"
                      className="px-2 py-1 text-xs font-mono rounded border border-indigo-300 bg-white w-28"
                    />
                    <button
                      onClick={handleSaveProfile}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 rounded cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-lg font-bold text-slate-900">
                      {userProgress.studentName}
                    </h4>
                    <span className="text-xs font-mono text-slate-400">
                      ({userProgress.studentNim})
                    </span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-slate-400 hover:text-indigo-600 p-0.5 cursor-pointer"
                      title="Ubah Nama"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {userProgress.studentClass && (
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Kelas: {userProgress.studentClass}
                    </span>
                  )}
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {rankTitle}
                  </span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 text-[11px]">
                    <Database className="w-3 h-3 text-emerald-600" />
                    Firestore Cloud
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-center">
              <div>
                <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
                  {unlockedCount}/{totalBadges}
                </span>
                <span className="text-[11px] text-slate-500 block">Lencana Terbuka</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="text-2xl font-bold font-mono text-indigo-600 tabular-nums">
                  {userProgress.completedChallengeIds.length}/18
                </span>
                <span className="text-[11px] text-slate-500 block">Praktik Selesai</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
                  {userProgress.examHighScore}
                </span>
                <span className="text-[11px] text-slate-500 block">Skor Ujian UAS</span>
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 border-slate-900 text-white font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-mono tabular-nums">
              Kemajuan Lencana: <strong className="text-slate-800">{completionPercentage}%</strong>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => {
              const isUnlocked = Boolean(userProgress.unlockedBadges[badge.id]);
              const unlockDate = userProgress.unlockedBadges[badge.id];
              const { current, max, percent } = BadgeService.getBadgeProgress(badge, userProgress);

              return (
                <div
                  key={badge.id}
                  className={`rounded-xl border p-4.5 transition-all flex flex-col justify-between ${
                    isUnlocked
                      ? 'border-amber-300 bg-linear-to-b from-amber-50/40 via-white to-white shadow-xs'
                      : 'border-slate-200 bg-slate-50/70 opacity-90'
                  }`}
                >
                  <div>
                    {/* Badge Icon and Unlock Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-2xs ${
                        isUnlocked
                          ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-100'
                          : 'bg-slate-200/80 border-slate-300 text-slate-400'
                      }`}>
                        {isUnlocked ? getBadgeIcon(badge.icon) : <Lock className="w-5 h-5 text-slate-400" />}
                      </div>

                      {isUnlocked ? (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Terbuka</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 font-mono tabular-nums">
                          <span>{current}/{max}</span>
                        </div>
                      )}
                    </div>

                    {/* Title & Subtitle */}
                    <h5 className="text-sm font-bold text-slate-900 leading-snug">
                      {badge.title}
                    </h5>
                    <div className="text-[11px] font-medium text-indigo-700 mb-1.5">
                      {badge.subtitle}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {badge.description}
                    </p>
                  </div>

                  {/* Progress or Unlock Timestamp */}
                  <div className="pt-3 border-t border-slate-100 text-[11px]">
                    {isUnlocked ? (
                      <div className="text-slate-500 font-mono text-[10px]">
                        Diraih pada: {new Date(unlockDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span>{badge.requirement}</span>
                          <span className="font-mono tabular-nums">{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            {onSwitchStudent && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchStudent();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Ganti Mahasiswa / Masuk Ulang</span>
              </button>
            )}
            <span className="hidden sm:inline">Lencana otomatis terbuka saat kriteria terpenuhi</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
