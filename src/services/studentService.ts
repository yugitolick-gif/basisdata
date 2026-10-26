import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { StudentRecord } from '../types/student';

const ACTIVE_STUDENT_STORAGE_KEY = 'basisdatalab_active_student_v1';

export class StudentService {
  /**
   * Generates a safe Firestore document ID from NIM
   */
  public static normalizeStudentId(nim: string): string {
    const clean = nim.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    return clean ? `std_${clean}` : `std_unknown_${Date.now()}`;
  }

  /**
   * Retrieves active logged-in student from local storage
   */
  public static getActiveStudent(): StudentRecord | null {
    try {
      const raw = localStorage.getItem(ACTIVE_STUDENT_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as StudentRecord;
      }
    } catch (e) {
      console.warn('Gagal membaca profil mahasiswa aktif dari cache:', e);
    }
    return null;
  }

  /**
   * Sets active student in local storage
   */
  public static setActiveStudent(student: StudentRecord): void {
    try {
      localStorage.setItem(ACTIVE_STUDENT_STORAGE_KEY, JSON.stringify(student));
      // Keep legacy storage in sync for compatibility
      localStorage.setItem('basisdata_student_profile', JSON.stringify({
        name: student.name,
        nim: student.nim,
        class: student.class
      }));
    } catch (e) {
      console.warn('Gagal menyimpan profil mahasiswa aktif ke cache:', e);
    }
  }

  /**
   * Logs out student and clears active session
   */
  public static logoutStudent(): void {
    try {
      localStorage.removeItem(ACTIVE_STUDENT_STORAGE_KEY);
      localStorage.removeItem('basisdata_student_profile');
      localStorage.removeItem('basisdatalab_user_progress_v1');
    } catch (e) {
      console.warn('Gagal menghapus session mahasiswa:', e);
    }
  }

  /**
   * Fetch student document from Google Cloud Firestore by NIM
   */
  public static async getStudentByNim(nim: string): Promise<StudentRecord | null> {
    const studentId = this.normalizeStudentId(nim);
    const docRef = doc(db, 'students', studentId);

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as StudentRecord;
        return {
          ...data,
          id: studentId,
          completedChallengeIds: data.completedChallengeIds || [],
          exploredNormalizationStages: data.exploredNormalizationStages || ['UNF'],
          testedAlgebraIds: data.testedAlgebraIds || [],
          examHighScore: data.examHighScore ?? 0,
          queriedDatabases: data.queriedDatabases || ['universitas'],
          unlockedBadges: data.unlockedBadges || {},
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching student from Firestore:', err);
      handleFirestoreError(err, OperationType.GET, `students/${studentId}`);
    }
  }

  /**
   * Registers a new student (Nama, NIM, Kelas) and stores in Firestore database
   */
  public static async registerStudent(
    name: string,
    nim: string,
    className: string
  ): Promise<StudentRecord> {
    const cleanName = name.trim().slice(0, 100);
    const cleanNim = nim.trim().slice(0, 30);
    const cleanClass = className.trim().toUpperCase().slice(0, 50);

    if (!cleanName || !cleanNim || !cleanClass) {
      throw new Error('Nama lengkap, NIM, dan Kelas wajib diisi.');
    }

    const studentId = this.normalizeStudentId(cleanNim);
    const docRef = doc(db, 'students', studentId);

    // 1. Check if NIM is already registered
    try {
      const existing = await this.getStudentByNim(cleanNim);
      if (existing) {
        const error = new Error(`NIM ${cleanNim} sudah terdaftar atas nama ${existing.name} (Kelas: ${existing.class}). Silakan gunakan tab 'Lanjutkan Belajar'.`);
        (error as any).code = 'ALREADY_EXISTS';
        (error as any).existingStudent = existing;
        throw error;
      }
    } catch (e: any) {
      if (e.code === 'ALREADY_EXISTS') throw e;
      // If error is not ALREADY_EXISTS, proceed with creation
    }

    const nowIso = new Date().toISOString();
    const newRecord: StudentRecord = {
      id: studentId,
      nim: cleanNim,
      name: cleanName,
      class: cleanClass,
      completedChallengeIds: [],
      exploredNormalizationStages: ['UNF'],
      testedAlgebraIds: [],
      examHighScore: 0,
      queriedDatabases: ['universitas'],
      unlockedBadges: {},
      createdAt: nowIso,
      lastActiveAt: nowIso
    };

    // 2. Persist to Firestore
    try {
      await setDoc(docRef, newRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `students/${studentId}`);
    }

    // 3. Set active in local cache
    this.setActiveStudent(newRecord);
    return newRecord;
  }

  /**
   * Resumes session for returning student by Nama and NIM
   */
  public static async loginStudent(name: string, nim: string): Promise<StudentRecord> {
    const cleanName = name.trim().toLowerCase();
    const cleanNim = nim.trim();

    if (!cleanName || !cleanNim) {
      throw new Error('Nama dan NIM wajib diisi untuk melanjutkan.');
    }

    const existing = await this.getStudentByNim(cleanNim);
    if (!existing) {
      const err = new Error(`NIM ${cleanNim} belum terdaftar di database. Silakan pilih tab 'Mahasiswa Baru' untuk mendaftar terlebih dahulu.`);
      (err as any).code = 'NOT_FOUND';
      throw err;
    }

    // Friendly matching: check if input matches stored name (case-insensitive)
    const storedNameLower = existing.name.trim().toLowerCase();
    const isMatch = storedNameLower === cleanName ||
                    storedNameLower.includes(cleanName) ||
                    cleanName.includes(storedNameLower);

    if (!isMatch) {
      const err = new Error(`Nama tidak cocok dengan data NIM terdaftar. Silakan periksa kembali ejaan nama Anda.`);
      (err as any).code = 'NAME_MISMATCH';
      throw err;
    }

    // Update lastActiveAt
    const nowIso = new Date().toISOString();
    const updated: StudentRecord = {
      ...existing,
      lastActiveAt: nowIso
    };

    try {
      const studentId = this.normalizeStudentId(cleanNim);
      await updateDoc(doc(db, 'students', studentId), {
        lastActiveAt: nowIso
      });
    } catch (e) {
      console.warn('Update lastActiveAt warning:', e);
    }

    this.setActiveStudent(updated);
    return updated;
  }

  /**
   * Synchronizes student learning progress to Firestore in real-time
   */
  public static async syncStudentProgress(
    studentId: string,
    progress: Partial<StudentRecord>
  ): Promise<void> {
    const docRef = doc(db, 'students', studentId);
    const nowIso = new Date().toISOString();
    const payloadToUpdate: any = {
      ...progress,
      lastActiveAt: nowIso
    };

    // Update local cache first for instant UX
    const active = this.getActiveStudent();
    if (active && active.id === studentId) {
      const merged = { ...active, ...payloadToUpdate };
      this.setActiveStudent(merged);
    }

    // Then sync to Firestore
    try {
      await updateDoc(docRef, payloadToUpdate);
    } catch (err) {
      console.warn('Warning syncing progress to Firestore:', err);
    }
  }
}
