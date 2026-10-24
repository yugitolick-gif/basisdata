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
  studentName: string;
  studentNim: string;
  completedChallengeIds: string[];
  exploredNormalizationStages: string[];
  testedAlgebraIds: string[];
  examHighScore: number;
  queriedDatabases: string[];
  unlockedBadges: Record<string, string>; // badgeId -> ISO timestamp
}
