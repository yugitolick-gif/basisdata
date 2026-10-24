import { Badge, UserProgressData } from '../types/badge';
import { PRACTICE_CHALLENGES } from '../data/practiceChallenges';

export const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'sql-rookie',
    title: 'SQL Rookie',
    subtitle: 'Langkah Pertama Kueri',
    description: 'Menyelesaikan tantangan SQL pertama Anda dengan sukses.',
    category: 'Praktik SQL',
    icon: 'Sparkles',
    requirement: 'Selesaikan 1 tantangan praktik SQL',
    maxProgress: 1
  },
  {
    id: 'filter-maestro',
    title: 'Filter Maestro',
    subtitle: 'Spesialis Klausa WHERE',
    description: 'Menguasai penyaringan data dengan operator logika, pembanding, LIKE, dan ORDER BY.',
    category: 'Praktik SQL',
    icon: 'Filter',
    requirement: 'Selesaikan 4 tantangan kategori Kueri Dasar & Filter',
    maxProgress: 4
  },
  {
    id: 'join-architect',
    title: 'Join Architect',
    subtitle: 'Arsitek Relasi Multi-Tabel',
    description: 'Menghubungkan entitas melalui Foreign Key menggunakan INNER JOIN dan Multi-Table JOIN.',
    category: 'Praktik SQL',
    icon: 'GitMerge',
    requirement: 'Selesaikan 3 tantangan kategori Relasi & JOIN',
    maxProgress: 3
  },
  {
    id: 'grouping-pro',
    title: 'Aggregation Pro',
    subtitle: 'Analis Ringkasan Data',
    description: 'Menguasai agregasi COUNT, SUM, AVG, serta pengelompokan GROUP BY dan HAVING.',
    category: 'Praktik SQL',
    icon: 'BarChart3',
    requirement: 'Selesaikan 3 tantangan kategori Agregasi & Grouping',
    maxProgress: 3
  },
  {
    id: 'query-ninja',
    title: 'Query Ninja',
    subtitle: 'Grandmaster Praktik SQL',
    description: 'Menyelesaikan 10 atau lebih tantangan laboratorium SQL berjenjang.',
    category: 'Praktik SQL',
    icon: 'Zap',
    requirement: 'Selesaikan minimal 10 tantangan praktik SQL',
    maxProgress: 10
  },
  {
    id: 'algebra-savant',
    title: 'Algebra Savant',
    subtitle: 'Master Simbol Matematis',
    description: 'Mengevaluasi dan mengonversi rumus aljabar relasional (σ, π, ⋈, ×) ke kueri SQL.',
    category: 'Aljabar & Teori',
    icon: 'Calculator',
    requirement: 'Uji coba minimal 3 ekspresi pada Simulator Aljabar Relasional',
    maxProgress: 3
  },
  {
    id: 'normalization-master',
    title: 'Normalization Master',
    subtitle: 'Bebas Anomali 3NF',
    description: 'Memahami eliminasi redundansi dari bentuk 0NF hingga 3NF bebas anomali.',
    category: 'Normalisasi',
    icon: 'Layers',
    requirement: 'Jelajahi seluruh 4 tahapan normalisasi (0NF, 1NF, 2NF, 3NF)',
    maxProgress: 4
  },
  {
    id: 'exam-champion',
    title: 'Exam Champion',
    subtitle: 'Bintang Ujian Evaluasi',
    description: 'Meraih skor nilai minimal 80 pada simulasi ujian komprehensif Basis Data.',
    category: 'Ujian & Skor',
    icon: 'Trophy',
    requirement: 'Raih skor akhir minimal 80 pada Simulasi Ujian UAS',
    maxProgress: 80
  },
  {
    id: 'multi-db-explorer',
    title: 'Multi-DB Explorer',
    subtitle: 'Penjelajah Skema Industri',
    description: 'Mengeksplorasi dan menjalankan kueri di ketiga dataset (Universitas, E-Commerce, Rumah Sakit).',
    category: 'Praktik SQL',
    icon: 'Database',
    requirement: 'Jalankan kueri di ketiga database praktikum',
    maxProgress: 3
  }
];

const STORAGE_KEY = 'basisdatalab_user_progress_v1';

export class BadgeService {
  public static loadProgress(): UserProgressData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }

    return {
      studentName: 'Mahasiswa Basis Data',
      studentNim: '2024-KOMP',
      completedChallengeIds: [],
      exploredNormalizationStages: ['UNF'],
      testedAlgebraIds: [],
      examHighScore: 0,
      queriedDatabases: ['universitas'],
      unlockedBadges: {}
    };
  }

  public static saveProgress(data: UserProgressData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Evaluates all badge conditions against current user progress data.
   * Returns an array of newly unlocked badge titles (if any).
   */
  public static checkAndUnlockBadges(progress: UserProgressData): {
    updatedProgress: UserProgressData;
    newlyUnlocked: Badge[];
  } {
    const newlyUnlocked: Badge[] = [];
    const nowIso = new Date().toISOString();
    const updated = { ...progress, unlockedBadges: { ...progress.unlockedBadges } };

    for (const badge of BADGE_DEFINITIONS) {
      // Skip if already unlocked
      if (updated.unlockedBadges[badge.id]) continue;

      let isUnlocked = false;

      switch (badge.id) {
        case 'sql-rookie':
          if (updated.completedChallengeIds.length >= 1) isUnlocked = true;
          break;

        case 'filter-maestro': {
          const filterCount = updated.completedChallengeIds.filter(id => {
            const ch = PRACTICE_CHALLENGES.find(c => c.id === id);
            return ch && ch.category === 'Kueri Dasar & Filter';
          }).length;
          if (filterCount >= 4) isUnlocked = true;
          break;
        }

        case 'join-architect': {
          const joinCount = updated.completedChallengeIds.filter(id => {
            const ch = PRACTICE_CHALLENGES.find(c => c.id === id);
            return ch && ch.category === 'Relasi & JOIN';
          }).length;
          if (joinCount >= 3) isUnlocked = true;
          break;
        }

        case 'grouping-pro': {
          const groupCount = updated.completedChallengeIds.filter(id => {
            const ch = PRACTICE_CHALLENGES.find(c => c.id === id);
            return ch && ch.category === 'Agregasi & Grouping';
          }).length;
          if (groupCount >= 3) isUnlocked = true;
          break;
        }

        case 'query-ninja':
          if (updated.completedChallengeIds.length >= 10) isUnlocked = true;
          break;

        case 'algebra-savant':
          if (updated.testedAlgebraIds.length >= 3) isUnlocked = true;
          break;

        case 'normalization-master': {
          const requiredStages = ['UNF', '1NF', '2NF', '3NF'];
          const hasAll = requiredStages.every(s => updated.exploredNormalizationStages.includes(s));
          if (hasAll) isUnlocked = true;
          break;
        }

        case 'exam-champion':
          if (updated.examHighScore >= 80) isUnlocked = true;
          break;

        case 'multi-db-explorer': {
          const dbs = ['universitas', 'ecommerce', 'rumahsakit'];
          const hasAllDb = dbs.every(d => updated.queriedDatabases.includes(d));
          if (hasAllDb) isUnlocked = true;
          break;
        }
      }

      if (isUnlocked) {
        updated.unlockedBadges[badge.id] = nowIso;
        newlyUnlocked.push(badge);
      }
    }

    if (newlyUnlocked.length > 0) {
      this.saveProgress(updated);
    }

    return { updatedProgress: updated, newlyUnlocked };
  }

  public static getBadgeProgress(badge: Badge, progress: UserProgressData): { current: number; max: number; percent: number } {
    let current = 0;
    const max = badge.maxProgress;

    switch (badge.id) {
      case 'sql-rookie':
        current = Math.min(progress.completedChallengeIds.length, 1);
        break;

      case 'filter-maestro':
        current = progress.completedChallengeIds.filter(id => {
          const ch = PRACTICE_CHALLENGES.find(c => c.id === id);
          return ch && ch.category === 'Kueri Dasar & Filter';
        }).length;
        break;

      case 'join-architect':
        current = progress.completedChallengeIds.filter(id => {
          const ch = PRACTICE_CHALLENGES.find(c => c.id === id);
          return ch && ch.category === 'Relasi & JOIN';
        }).length;
        break;

      case 'grouping-pro':
        current = progress.completedChallengeIds.filter(id => {
          const ch = PRACTICE_CHALLENGES.find(c => c.id === id);
          return ch && ch.category === 'Agregasi & Grouping';
        }).length;
        break;

      case 'query-ninja':
        current = progress.completedChallengeIds.length;
        break;

      case 'algebra-savant':
        current = progress.testedAlgebraIds.length;
        break;

      case 'normalization-master':
        current = progress.exploredNormalizationStages.length;
        break;

      case 'exam-champion':
        current = progress.examHighScore;
        break;

      case 'multi-db-explorer':
        current = progress.queriedDatabases.length;
        break;
    }

    const clamped = Math.min(current, max);
    const percent = Math.min(100, Math.round((clamped / max) * 100));

    return { current: clamped, max, percent };
  }
}
