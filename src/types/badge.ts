export type BadgeCategory = 'Praktik SQL' | 'Aljabar & Teori' | 'Normalisasi' | 'Ujian & Skor';

export interface Badge {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: BadgeCategory;
  icon: string;
  requirement: string;
  maxProgress: number;
}

export interface UserProgressData {
  studentId?: string;
  studentName: string;
  studentNim: string;
  studentClass?: string;
  completedChallengeIds: string[];
  exploredNormalizationStages: string[];
  testedAlgebraIds: string[];
  examHighScore: number;
  queriedDatabases: string[];
  unlockedBadges: Record<string, string>; // badgeId -> ISO timestamp
}

