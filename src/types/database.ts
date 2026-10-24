export type DatasetKey = 'universitas' | 'ecommerce' | 'rumahsakit';

export interface ColumnSchema {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  fkTarget?: string; // e.g. "jurusan.id_jurusan"
  nullable?: boolean;
  description?: string;
}

export interface TableSchema {
  name: string;
  displayName: string;
  description: string;
  columns: ColumnSchema[];
  sampleData: Record<string, any>[];
  ddlSql: string;
}

export interface DatasetInfo {
  key: DatasetKey;
  title: string;
  subtitle: string;
  description: string;
  tables: Record<string, TableSchema>;
}

export interface QueryResult {
  success: boolean;
  columns: string[];
  rows: any[][];
  rawRows?: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}

export type ChallengeDifficulty = 'Pemula' | 'Menengah' | 'Mahir';
export type ChallengeCategory = 
  | 'Kueri Dasar & Filter'
  | 'Agregasi & Grouping'
  | 'Relasi & JOIN'
  | 'Subquery & Bersarang'
  | 'DML & Modifikasi';

export interface Challenge {
  id: string;
  title: string;
  difficulty: ChallengeDifficulty;
  category: ChallengeCategory;
  dataset: DatasetKey;
  description: string;
  learningGoal: string;
  expectedConcept: string;
  starterSql: string;
  solutionSql: string;
  hint: string;
  explanation: string;
  checkType?: 'exact' | 'columns_and_rows' | 'mutation';
  mutationVerificationSql?: string; // Query to verify table state after INSERT/UPDATE/DELETE
}

export interface QuizQuestion {
  id: string;
  category: 'Konsep Dasar & Relasional' | 'SQL DDL & Constraint' | 'SQL DML & JOIN' | 'Agregasi & Subquery' | 'Normalisasi & ACID';
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
  keyTakeaway: string;
}

export interface FunctionalDependency {
  determinant: string[]; // e.g. ["nim"]
  dependent: string[];   // e.g. ["nama_mahasiswa", "jurusan"]
  type: 'Full' | 'Partial' | 'Transitive';
  description: string;
}

export interface NormalizationStage {
  stage: 'UNF' | '1NF' | '2NF' | '3NF';
  title: string;
  ruleTitle: string;
  ruleDescription: string;
  anomaliesDetected: string[];
  tables: {
    name: string;
    description: string;
    columns: { name: string; isPk?: boolean; isFk?: boolean }[];
    rows: Record<string, any>[];
  }[];
  dependencies: FunctionalDependency[];
  summaryNote: string;
}
