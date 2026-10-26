export interface StudentRecord {
  id: string; // normalized NIM ID (e.g., nim_22010101)
  nim: string;
  name: string;
  class: string;
  completedChallengeIds: string[];
  exploredNormalizationStages: string[];
  testedAlgebraIds: string[];
  examHighScore: number;
  queriedDatabases: string[];
  unlockedBadges: Record<string, string>; // badgeId -> ISO timestamp
  createdAt: string;
  lastActiveAt: string;
}

export type StudentAuthMode = 'register' | 'login';
