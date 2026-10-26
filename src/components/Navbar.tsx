import React, { useState, useRef, useEffect } from 'react';
import { 
  Database, 
  PlayCircle, 
  Trophy, 
  Users, 
  Menu, 
  X, 
  ChevronRight,
  ChevronLeft,
  Code2,
  CheckCircle2,
  Calculator,
  HelpCircle,
  Layers,
  FileSpreadsheet,
  BookOpen,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export type NavTab = 'lab' | 'challenges' | 'algebra' | 'quiz' | 'erd' | 'normalization' | 'cheatsheet' | 'admin';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  completedChallengesCount: number;
  unlockedBadgesCount: number;
  onOpenProfile: () => void;
  studentName?: string;
  studentNim?: string;
  studentClass?: string;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  completedChallengesCount,
  unlockedBadgesCount,
  onOpenProfile,
  studentName,
  studentNim,
  studentClass,
  onOpenAuthModal
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const navScrollRef = useRef<HTMLDivElement>(null);

  const checkNavScroll = () => {
    if (navScrollRef.current) {
      const { scrollLeft } = navScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
    }
  };

  const handleScrollNav = (direction: 'left' | 'right') => {
    if (navScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navScrollRef.current;
      if (direction === 'right') {
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          // If already at end, cycle back to the start smoothly
          navScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          navScrollRef.current.scrollBy({ left: 150, behavior: 'smooth' });
        }
      } else {
        navScrollRef.current.scrollBy({ left: -150, behavior: 'smooth' });
      }
      setTimeout(checkNavScroll, 350);
    }
  };

  useEffect(() => {
    checkNavScroll();
    const el = navScrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkNavScroll);
      window.addEventListener('resize', checkNavScroll);
      return () => {
        el.removeEventListener('scroll', checkNavScroll);
        window.removeEventListener('resize', checkNavScroll);
      };
    }
  }, []);

  useEffect(() => {
    if (navScrollRef.current) {
      const activeEl = navScrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  const navItems = [
    { key: 'lab' as NavTab, label: 'SQL Playground', icon: Code2, shortLabel: 'SQL Lab' },
    { 
      key: 'challenges' as NavTab, 
      label: 'Tantangan Praktik', 
      icon: CheckCircle2, 
      badge: `${completedChallengesCount}/18`,
      shortLabel: `Praktik (${completedChallengesCount})`
    },
    { key: 'algebra' as NavTab, label: 'Aljabar Relasional', icon: Calculator, shortLabel: 'Aljabar' },
    { key: 'quiz' as NavTab, label: 'Kuis & Ujian', icon: HelpCircle, shortLabel: 'Kuis' },
    { key: 'normalization' as NavTab, label: 'Normalisasi (1NF–3NF)', icon: Layers, shortLabel: 'Normalisasi' },
    { key: 'erd' as NavTab, label: 'Skema ERD', icon: Database, shortLabel: 'ERD' },
    { key: 'cheatsheet' as NavTab, label: 'Cheat Sheet', icon: BookOpen, shortLabel: 'Cheat Sheet' },
  ];

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-2.5 sm:py-3">
        {/* Zone 1: Brand & Logo */}
        <div className="flex items-center gap-2">
          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus-visible:outline-none"
            aria-label="Buka Menu Navigasi"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => handleSelectTab('lab')}
            className="flex items-center gap-2 text-left text-slate-900 group cursor-pointer focus-visible:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight whitespace-nowrap">
              BasisData<span className="text-indigo-600">Lab</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Desktop clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-sm font-medium text-slate-600">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSelectTab(item.key)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer border-b-2 flex items-center gap-1 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 font-semibold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-xs font-mono tabular-nums text-indigo-600 font-semibold">
                    ({item.badge})
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Student Identity Chip, Admin trigger, Badge status trigger, and Primary action */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Student Identity Chip */}
          {studentName ? (
            <button
              onClick={onOpenProfile}
              title={`Mahasiswa Aktif: ${studentName} (${studentNim || ''})${studentClass ? ' • Kelas ' + studentClass : ''} - Klik untuk buka profil & lencana`}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-indigo-900 bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs max-w-[130px] xs:max-w-[170px] sm:max-w-[220px]"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{studentName}</span>
              {studentClass && (
                <span className="hidden md:inline px-1.5 py-0.2 rounded bg-indigo-200/70 text-indigo-900 text-[10px] font-mono shrink-0">
                  {studentClass}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Masuk Mahasiswa</span>
            </button>
          )}

          {/* Admin Button */}
          <button
            onClick={() => handleSelectTab('admin')}
            title="Buka Dashboard Admin & Pemantauan Pengunjung"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xs:inline">Admin</span>
          </button>

          {/* Student Badges Button */}
          <button
            onClick={onOpenProfile}
            title="Buka Profil Mahasiswa & Lencana Prestasi"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Lencana</span>
            <span className="font-mono tabular-nums font-bold">
              {unlockedBadgesCount}/9
            </span>
          </button>

          {/* Primary Action Button (Desktop/Tablet) */}
          <button
            onClick={() => handleSelectTab('challenges')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Mulai Praktik</span>
          </button>
        </div>
      </div>

      {/* Horizontal Swipeable Tab Strip on Mobile & Tablet with Interactive Scroll Buttons */}
      <div className="relative border-t border-slate-200/70 bg-slate-50/90 lg:hidden">
        {/* Left Scroll Button (appears when scrolled right) */}
        {canScrollLeft && (
          <button 
            type="button"
            onClick={() => handleScrollNav('left')}
            title="Geser menu ke kiri"
            aria-label="Geser menu ke kiri"
            className="absolute left-0 top-0 bottom-0 px-2 bg-gradient-to-r from-slate-100 via-slate-100/90 to-transparent flex items-center justify-start text-slate-500 hover:text-indigo-600 active:scale-90 transition-all cursor-pointer z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div 
          ref={navScrollRef}
          onScroll={checkNavScroll}
          className="flex overflow-x-auto gap-1.5 px-3 pr-10 py-1.5 text-xs font-medium text-slate-600 scrollbar-none scroll-smooth touch-pan-x"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                data-active={isActive ? "true" : "false"}
                onClick={() => handleSelectTab(item.key)}
                className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {item.shortLabel}
              </button>
            );
          })}
          <button
            data-active={activeTab === 'admin' ? "true" : "false"}
            onClick={() => handleSelectTab('admin')}
            className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Right Scroll Arrow Button (Clickable!) */}
        <button 
          type="button"
          onClick={() => handleScrollNav('right')}
          title="Geser menu ke kanan"
          aria-label="Geser menu ke kanan"
          className="absolute right-0 top-0 bottom-0 px-2.5 bg-gradient-to-l from-slate-100 via-slate-100/95 to-transparent flex items-center justify-end text-slate-500 hover:text-indigo-600 active:scale-90 transition-all cursor-pointer z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Full-Screen Mobile Drawer / Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-xl px-4 py-4 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {/* Active Student Status in Mobile Menu */}
          {studentName ? (
            <div className="bg-indigo-50/90 border border-indigo-200/80 rounded-xl p-3 mb-3 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  <GraduationCap className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">{studentName}</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    NIM: {studentNim || '-'} {studentClass ? `• Kelas ${studentClass}` : ''}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenProfile();
                }}
                className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                Profil
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onOpenAuthModal) onOpenAuthModal();
              }}
              className="w-full mb-3 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Masuk / Daftar Mahasiswa</span>
            </button>
          )}

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
            Menu Modul Pembelajaran
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSelectTab(item.key)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-100">
            <button
              onClick={() => handleSelectTab('admin')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'admin' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Dashboard Administrator</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
