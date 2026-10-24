import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SqlLab } from './components/SqlLab';
import { PracticeChallenges } from './components/PracticeChallenges';
import { RelationalAlgebraSimulator } from './components/RelationalAlgebraSimulator';
import { QuizModule } from './components/QuizModule';
import { ErdVisualizer } from './components/ErdVisualizer';
import { NormalizationSimulator } from './components/NormalizationSimulator';
import { SqlCheatsheet } from './components/SqlCheatsheet';
import { ProfileBadgeModal } from './components/ProfileBadgeModal';
import { AdminDashboard } from './components/AdminDashboard';
import { BadgeService } from './services/badgeService';
import { analytics } from './services/analyticsService';
import { DatasetKey } from './types/database';
import { Badge, UserProgressData } from './types/badge';
import { Trophy, Sparkles, X, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('lab');
  const [activeDataset, setActiveDataset] = useState<DatasetKey>('universitas');
  const [labQuery, setLabQuery] = useState<string | undefined>(undefined);
  
  // Full student progress state
  const [userProgress, setUserProgress] = useState<UserProgressData>(() => {
    return BadgeService.loadProgress();
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [unlockedToastBadge, setUnlockedToastBadge] = useState<Badge | null>(null);

  // Sync to local storage
  useEffect(() => {
    BadgeService.saveProgress(userProgress);
  }, [userProgress]);

  // Track initial page visit
  useEffect(() => {
    analytics.trackEvent(
      'SQL Playground',
      'Membuka Website',
      'Pengunjung Membuka Platform BasisDataLab',
      userProgress.studentName,
      userProgress.studentNim
    );
  }, []);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    const featureNames: Record<NavTab, string> = {
      lab: 'SQL Playground',
      challenges: 'Tantangan Praktik',
      algebra: 'Aljabar Relasional',
      quiz: 'Kuis & Ujian',
      erd: 'Skema ERD',
      normalization: 'Simulator Normalisasi',
      cheatsheet: 'Cheat Sheet',
      admin: 'Dashboard Admin'
    };
    analytics.trackEvent(
      featureNames[tab],
      'Membuka Modul',
      `Beralih ke tab ${featureNames[tab]}`,
      userProgress.studentName,
      userProgress.studentNim
    );
  };

  // Helper to run badge evaluation
  const evaluateBadges = (newProgress: UserProgressData) => {
    const { updatedProgress, newlyUnlocked } = BadgeService.checkAndUnlockBadges(newProgress);
    setUserProgress(updatedProgress);

    if (newlyUnlocked.length > 0) {
      setUnlockedToastBadge(newlyUnlocked[0]);
      setTimeout(() => {
        setUnlockedToastBadge(null);
      }, 5000);
    }
  };

  // Milestone triggers with analytics tracking
  const handleToggleChallengeComplete = (id: string) => {
    analytics.trackEvent(
      'Tantangan Praktik',
      'Menyelesaikan Tantangan',
      `Tantangan ID: ${id}`,
      userProgress.studentName,
      userProgress.studentNim
    );

    if (userProgress.completedChallengeIds.includes(id)) return;
    const nextIds = [...userProgress.completedChallengeIds, id];
    const nextProgress = { ...userProgress, completedChallengeIds: nextIds };
    evaluateBadges(nextProgress);
  };

  const handleStageExplored = (stage: string) => {
    analytics.trackEvent(
      'Simulator Normalisasi',
      'Eksplorasi Tahapan',
      `Mempelajari Tahap ${stage}`,
      userProgress.studentName,
      userProgress.studentNim
    );

    if (userProgress.exploredNormalizationStages.includes(stage)) return;
    const nextStages = [...userProgress.exploredNormalizationStages, stage];
    const nextProgress = { ...userProgress, exploredNormalizationStages: nextStages };
    evaluateBadges(nextProgress);
  };

  const handleFormulaTested = (formulaId: string) => {
    analytics.trackEvent(
      'Aljabar Relasional',
      'Evaluasi Rumus Aljabar',
      `Kasus Formula: ${formulaId}`,
      userProgress.studentName,
      userProgress.studentNim
    );

    if (userProgress.testedAlgebraIds.includes(formulaId)) return;
    const nextFormulas = [...userProgress.testedAlgebraIds, formulaId];
    const nextProgress = { ...userProgress, testedAlgebraIds: nextFormulas };
    evaluateBadges(nextProgress);
  };

  const handleExamCompleted = (score: number) => {
    analytics.trackEvent(
      'Kuis & Ujian',
      'Menyelesaikan Ujian UAS',
      `Skor Akhir: ${score}/100`,
      userProgress.studentName,
      userProgress.studentNim
    );

    const highScore = Math.max(userProgress.examHighScore, score);
    const nextProgress = { ...userProgress, examHighScore: highScore };
    evaluateBadges(nextProgress);
  };

  const handleDatabaseQueried = (dbKey: string) => {
    analytics.trackEvent(
      'SQL Playground',
      'Eksekusi Kueri SQL',
      `Database: ${dbKey}`,
      userProgress.studentName,
      userProgress.studentNim
    );

    if (userProgress.queriedDatabases.includes(dbKey)) return;
    const nextDbs = [...userProgress.queriedDatabases, dbKey];
    const nextProgress = { ...userProgress, queriedDatabases: nextDbs };
    evaluateBadges(nextProgress);
  };

  const handleUpdateProfileName = (name: string, nim: string) => {
    const nextProgress = { ...userProgress, studentName: name, studentNim: nim };
    setUserProgress(nextProgress);
    BadgeService.saveProgress(nextProgress);
    analytics.setStudentProfile(name, nim);
    analytics.trackEvent(
      'Profil Mahasiswa',
      'Perbarui Profil',
      `Nama: ${name}, NIM: ${nim}`,
      name,
      nim
    );
  };

  const handleOpenInLab = (sql: string) => {
    setLabQuery(sql);
    handleTabChange('lab');
  };

  const unlockedCount = Object.keys(userProgress.unlockedBadges).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Strict 3-Zone Top Navigation with Admin and Badge triggers */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        completedChallengesCount={userProgress.completedChallengeIds.length}
        unlockedBadgesCount={unlockedCount}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'lab' && (
          <>
            <HeroSection
              onSelectAction={(tab) => handleTabChange(tab)}
              activeDataset={activeDataset}
              setActiveDataset={setActiveDataset}
              completedCount={userProgress.completedChallengeIds.length}
            />
            <SqlLab
              activeDataset={activeDataset}
              setActiveDataset={setActiveDataset}
              initialQuery={labQuery}
              onDatabaseQueried={handleDatabaseQueried}
            />
          </>
        )}

        {activeTab === 'challenges' && (
          <PracticeChallenges
            completedIds={userProgress.completedChallengeIds}
            onToggleComplete={handleToggleChallengeComplete}
          />
        )}

        {activeTab === 'algebra' && (
          <RelationalAlgebraSimulator
            activeDataset={activeDataset}
            setActiveDataset={setActiveDataset}
            onOpenInLab={handleOpenInLab}
            onFormulaTested={handleFormulaTested}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizModule onExamCompleted={handleExamCompleted} />
        )}

        {activeTab === 'erd' && (
          <ErdVisualizer
            activeDataset={activeDataset}
            setActiveDataset={setActiveDataset}
            onOpenInLab={handleOpenInLab}
          />
        )}

        {activeTab === 'normalization' && (
          <NormalizationSimulator onStageExplored={handleStageExplored} />
        )}

        {activeTab === 'cheatsheet' && (
          <SqlCheatsheet onOpenInLab={handleOpenInLab} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard onBackToApp={() => handleTabChange('lab')} />
        )}
      </main>

      {/* Profile & Badges Showcase Modal */}
      <ProfileBadgeModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProgress={userProgress}
        onUpdateProfileName={handleUpdateProfileName}
      />

      {/* Newly Unlocked Badge Celebration Toast */}
      {unlockedToastBadge && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white rounded-xl shadow-2xl border border-amber-400/60 p-4 max-w-sm flex items-start gap-3.5 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lencana Baru Terbuka!</span>
            </div>
            <div className="text-sm font-bold text-white mt-0.5 truncate">
              {unlockedToastBadge.title}
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug line-clamp-2">
              {unlockedToastBadge.description}
            </p>
            <button
              onClick={() => {
                setUnlockedToastBadge(null);
                setIsProfileModalOpen(true);
              }}
              className="text-xs text-amber-300 hover:text-amber-200 font-semibold underline mt-2 cursor-pointer"
            >
              Lihat di Profil →
            </button>
          </div>
          <button
            onClick={() => setUnlockedToastBadge(null)}
            className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Academic Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-800">BasisDataLab</span> — Platform Pembelajaran & Praktik Mata Kuliah Basis Data
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleTabChange('admin')}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium hover:underline cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dashboard Admin & Pengunjung</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer"
            >
              Profil Mahasiswa ({unlockedCount}/9 Lencana)
            </button>
            <span aria-hidden="true">·</span>
            <span>Aljabar Relasional</span>
            <span aria-hidden="true">·</span>
            <span>ANSI SQL Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
