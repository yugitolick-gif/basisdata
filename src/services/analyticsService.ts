import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';

export interface ActivityLog {
  id: string;
  sessionId: string;
  timestamp: string;
  studentName: string;
  studentNim: string;
  feature: string;
  action: string;
  details?: string;
  device: string;
  browser: string;
}

export interface VisitorSession {
  sessionId: string;
  firstSeen: string;
  lastSeen: string;
  studentName: string;
  studentNim: string;
  device: string;
  browser: string;
  totalActions: number;
  featuresUsed: string[];
  lastFeature: string;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  activeToday: number;
  totalActions: number;
  featureBreakdown: Record<string, number>;
  recentLogs: ActivityLog[];
  visitors: VisitorSession[];
  source?: 'firestore' | 'server' | 'local';
}

const STORAGE_KEY_LOGS = 'basisdatalab_analytics_logs_v1';
const STORAGE_KEY_SESSION = 'basisdatalab_analytics_session_v1';

class AnalyticsService {
  private sessionId: string;
  private currentStudentName: string = 'Mahasiswa Basis Data';
  private currentStudentNim: string = '2024-KOMP';
  private totalActionsCount: number = 0;
  private usedFeatures: Set<string> = new Set();
  private firstSeenTime: string = new Date().toISOString();

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.initStudentInfo();
  }

  private initStudentInfo() {
    try {
      const stored = localStorage.getItem('basisdata_student_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) this.currentStudentName = parsed.name;
        if (parsed.nim) this.currentStudentNim = parsed.nim;
      }
    } catch {
      // ignore
    }
  }

  public setStudentProfile(name: string, nim: string) {
    this.currentStudentName = name.slice(0, 100);
    this.currentStudentNim = nim.slice(0, 30);
  }

  private getOrCreateSessionId(): string {
    try {
      let id = sessionStorage.getItem(STORAGE_KEY_SESSION);
      if (!id) {
        id = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
        sessionStorage.setItem(STORAGE_KEY_SESSION, id);
      }
      return id;
    } catch {
      return 'sess_fallback_' + Date.now();
    }
  }

  private getDeviceInfo(): { device: string; browser: string } {
    const ua = navigator.userAgent;
    let browser = 'Chrome/Modern Browser';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    let device = 'Desktop (PC/Mac)';
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) {
      device = 'Mobile / Smartphone';
    } else if (/Tablet|iPad/i.test(ua)) {
      device = 'Tablet';
    }

    return { device, browser };
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Tracks an event across features and synchronizes directly to Google Cloud Firestore
   */
  public async trackEvent(
    feature: string,
    action: string,
    details?: string,
    studentName?: string,
    studentNim?: string
  ): Promise<void> {
    const { device, browser } = this.getDeviceInfo();
    const finalName = (studentName || this.currentStudentName).slice(0, 100);
    const finalNim = (studentNim || this.currentStudentNim).slice(0, 30);
    const nowIso = new Date().toISOString();
    const cleanFeature = feature.slice(0, 100);
    const cleanAction = action.slice(0, 100);
    const cleanDetails = (details || '').slice(0, 500);

    this.totalActionsCount++;
    this.usedFeatures.add(cleanFeature);

    const logItem: ActivityLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      sessionId: this.sessionId,
      timestamp: nowIso,
      studentName: finalName,
      studentNim: finalNim,
      feature: cleanFeature,
      action: cleanAction,
      details: cleanDetails,
      device,
      browser
    };

    const sessionItem: VisitorSession = {
      sessionId: this.sessionId,
      studentName: finalName,
      studentNim: finalNim,
      device,
      browser,
      firstSeen: this.firstSeenTime,
      lastSeen: nowIso,
      totalActions: this.totalActionsCount,
      lastFeature: cleanFeature,
      featuresUsed: Array.from(this.usedFeatures).slice(0, 50)
    };

    // 1. Sync to Google Cloud Firestore
    try {
      // Write activity log
      await setDoc(doc(db, 'activity_logs', logItem.id), logItem);
      // Update visitor session
      await setDoc(doc(db, 'visitor_sessions', this.sessionId), sessionItem);
    } catch (firestoreErr) {
      console.warn('Firestore direct write notice:', firestoreErr);
      // If error occurs, we still continue with local cache & server endpoint
    }

    // 2. Send to backend server database (AlaSQL)
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logItem)
      });
    } catch {
      // Server offline fallback
    }

    // 3. Persist locally in localStorage as a resilient offline cache
    this.saveLocalLog(logItem);
  }

  private saveLocalLog(log: ActivityLog): void {
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY_LOGS);
      const logs: ActivityLog[] = existingRaw ? JSON.parse(existingRaw) : [];
      logs.unshift(log);
      if (logs.length > 150) logs.pop();
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch {
      // ignore
    }
  }

  /**
   * Real-time subscription to Google Cloud Firestore for Admin Dashboard
   */
  public subscribeToFirestore(onUpdate: (summary: AnalyticsSummary) => void): () => void {
    const unsubLogs = onSnapshot(
      query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(100)),
      (snapshot) => {
        const firestoreLogs: ActivityLog[] = [];
        snapshot.forEach((d) => {
          firestoreLogs.push(d.data() as ActivityLog);
        });

        // Also fetch sessions
        getDocs(collection(db, 'visitor_sessions'))
          .then((sessionSnap) => {
            const visitors: VisitorSession[] = [];
            sessionSnap.forEach((docItem) => {
              visitors.push(docItem.data() as VisitorSession);
            });
            visitors.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

            const featureBreakdown: Record<string, number> = {
              'SQL Playground': 0,
              'Tantangan Praktik': 0,
              'Aljabar Relasional': 0,
              'Kuis & Ujian': 0,
              'Simulator Normalisasi': 0,
              'Skema ERD': 0,
              'Cheat Sheet': 0
            };

            for (const log of firestoreLogs) {
              if (featureBreakdown[log.feature] !== undefined) {
                featureBreakdown[log.feature]++;
              } else {
                featureBreakdown[log.feature] = (featureBreakdown[log.feature] || 0) + 1;
              }
            }

            onUpdate({
              totalVisitors: visitors.length || 1,
              activeToday: visitors.length || 1,
              totalActions: firestoreLogs.length,
              featureBreakdown,
              recentLogs: firestoreLogs,
              visitors,
              source: 'firestore'
            });
          })
          .catch((err) => {
            console.error('Error fetching visitor_sessions snapshot:', err);
          });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'activity_logs');
      }
    );

    return () => {
      unsubLogs();
    };
  }

  /**
   * Primary method to load analytics: queries Firestore first, then fallback to API and local
   */
  public async getAnalyticsData(): Promise<AnalyticsSummary> {
    // 1. Attempt to fetch live from Google Cloud Firestore
    try {
      const logsSnap = await getDocs(
        query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(100))
      );
      const visitorsSnap = await getDocs(collection(db, 'visitor_sessions'));

      if (!logsSnap.empty || !visitorsSnap.empty) {
        const firestoreLogs: ActivityLog[] = [];
        logsSnap.forEach((docSnap) => {
          firestoreLogs.push(docSnap.data() as ActivityLog);
        });

        const visitors: VisitorSession[] = [];
        visitorsSnap.forEach((docSnap) => {
          visitors.push(docSnap.data() as VisitorSession);
        });
        visitors.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

        const featureBreakdown: Record<string, number> = {
          'SQL Playground': 0,
          'Tantangan Praktik': 0,
          'Aljabar Relasional': 0,
          'Kuis & Ujian': 0,
          'Simulator Normalisasi': 0,
          'Skema ERD': 0,
          'Cheat Sheet': 0
        };

        for (const log of firestoreLogs) {
          if (featureBreakdown[log.feature] !== undefined) {
            featureBreakdown[log.feature]++;
          } else {
            featureBreakdown[log.feature] = (featureBreakdown[log.feature] || 0) + 1;
          }
        }

        return {
          totalVisitors: Math.max(visitors.length, 1),
          activeToday: Math.max(visitors.length, 1),
          totalActions: firestoreLogs.length,
          featureBreakdown,
          recentLogs: firestoreLogs,
          visitors,
          source: 'firestore'
        };
      }
    } catch (e) {
      console.warn('Firestore fetch fallback:', e);
    }

    // 2. Attempt to fetch from server backend database
    try {
      const res = await fetch('/api/analytics/summary');
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.totalVisitors > 0) {
          return { ...serverData, source: 'server' };
        }
      }
    } catch {
      // server offline
    }

    // 3. Fallback to client-side local storage
    return { ...this.getLocalAnalyticsData(), source: 'local' };
  }

  public getLocalAnalyticsData(): AnalyticsSummary {
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY_LOGS);
      const logs: ActivityLog[] = existingRaw ? JSON.parse(existingRaw) : [];

      const visitorMap: Record<string, VisitorSession> = {};
      const featureBreakdown: Record<string, number> = {
        'SQL Playground': 0,
        'Tantangan Praktik': 0,
        'Aljabar Relasional': 0,
        'Kuis & Ujian': 0,
        'Simulator Normalisasi': 0,
        'Skema ERD': 0,
        'Cheat Sheet': 0
      };

      for (const log of logs) {
        if (featureBreakdown[log.feature] !== undefined) {
          featureBreakdown[log.feature]++;
        } else {
          featureBreakdown[log.feature] = 1;
        }

        if (!visitorMap[log.sessionId]) {
          visitorMap[log.sessionId] = {
            sessionId: log.sessionId,
            firstSeen: log.timestamp,
            lastSeen: log.timestamp,
            studentName: log.studentName,
            studentNim: log.studentNim,
            device: log.device,
            browser: log.browser,
            totalActions: 0,
            featuresUsed: [],
            lastFeature: log.feature
          };
        }

        const v = visitorMap[log.sessionId];
        v.totalActions++;
        if (!v.featuresUsed.includes(log.feature)) {
          v.featuresUsed.push(log.feature);
        }
        if (new Date(log.timestamp) > new Date(v.lastSeen)) {
          v.lastSeen = log.timestamp;
          v.lastFeature = log.feature;
        }
        if (new Date(log.timestamp) < new Date(v.firstSeen)) {
          v.firstSeen = log.timestamp;
        }
        if (log.studentName && log.studentName !== 'Mahasiswa Basis Data') {
          v.studentName = log.studentName;
          v.studentNim = log.studentNim;
        }
      }

      const visitors = Object.values(visitorMap).sort(
        (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
      );

      return {
        totalVisitors: Math.max(visitors.length, 1),
        activeToday: visitors.length,
        totalActions: logs.length,
        featureBreakdown,
        recentLogs: logs.slice(0, 50),
        visitors,
        source: 'local'
      };
    } catch {
      return {
        totalVisitors: 1,
        activeToday: 1,
        totalActions: 0,
        featureBreakdown: {},
        recentLogs: [],
        visitors: [],
        source: 'local'
      };
    }
  }

  public async clearLogs(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY_LOGS);
    } catch {
      // ignore
    }
    try {
      await fetch('/api/analytics/clear', { method: 'POST' });
    } catch {
      // ignore
    }
    try {
      const logsSnap = await getDocs(collection(db, 'activity_logs'));
      const batch = writeBatch(db);
      logsSnap.forEach((docItem) => {
        batch.delete(docItem.ref);
      });
      await batch.commit();
    } catch (e) {
      console.warn('Error clearing Firestore logs:', e);
    }
  }
}

export const analytics = new AnalyticsService();
