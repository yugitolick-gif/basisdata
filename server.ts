import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import alasql from 'alasql';

const app = express();
const port = 3000;

app.use(express.json());

// Persistent database storage directory
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database_store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize SQL Database & Schema
try {
  alasql('CREATE DATABASE IF NOT EXISTS basisdata_admin');
  alasql('USE basisdata_admin');

  // Table 1: visitor_sessions
  alasql(`
    CREATE TABLE IF NOT EXISTS visitor_sessions (
      sessionId STRING,
      studentName STRING,
      studentNim STRING,
      device STRING,
      browser STRING,
      firstSeen STRING,
      lastSeen STRING,
      totalActions INT,
      lastFeature STRING,
      featuresUsed STRING
    )
  `);

  // Table 2: activity_logs
  alasql(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id STRING,
      sessionId STRING,
      timestamp STRING,
      studentName STRING,
      studentNim STRING,
      feature STRING,
      action STRING,
      details STRING,
      device STRING,
      browser STRING
    )
  `);

  // Load existing database tables from disk
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const saved = JSON.parse(raw);
    if (saved.visitor_sessions && Array.isArray(saved.visitor_sessions)) {
      alasql.tables.visitor_sessions.data = saved.visitor_sessions;
    }
    if (saved.activity_logs && Array.isArray(saved.activity_logs)) {
      alasql.tables.activity_logs.data = saved.activity_logs;
    }
    console.log(`Loaded ${alasql.tables.activity_logs.data.length} logs and ${alasql.tables.visitor_sessions.data.length} visitor sessions from SQL database.`);
  }
} catch (err) {
  console.error('Error initializing SQL Database:', err);
}

function persistDbToDisk() {
  try {
    const backup = {
      visitor_sessions: (alasql as any).tables.visitor_sessions?.data || [],
      activity_logs: ((alasql as any).tables.activity_logs?.data || []).slice(0, 1000)
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(backup, null, 2));
  } catch (err) {
    console.error('Error saving SQL database to disk:', err);
  }
}

// API Routes
app.post('/api/analytics/track', (req: Request, res: Response) => {
  const log = req.body;
  if (!log || !log.feature) {
    return res.status(400).json({ error: 'Payload tidak valid' });
  }

  try {
    alasql('USE basisdata_admin');

    // 1. Insert into activity_logs table via SQL
    alasql(
      'INSERT INTO activity_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        log.id,
        log.sessionId,
        log.timestamp,
        log.studentName || 'Mahasiswa Basis Data',
        log.studentNim || '2024-KOMP',
        log.feature,
        log.action,
        log.details || '',
        log.device,
        log.browser
      ]
    );

    // 2. Query existing visitor session with SQL
    const existingSession = alasql(
      'SELECT * FROM visitor_sessions WHERE sessionId = ?',
      [log.sessionId]
    ) as any[];

    if (existingSession && existingSession.length > 0) {
      const sess = existingSession[0];
      const features: string[] = sess.featuresUsed ? JSON.parse(sess.featuresUsed) : [];
      if (!features.includes(log.feature)) {
        features.push(log.feature);
      }
      const newTotal = (sess.totalActions || 0) + 1;

      alasql(
        `UPDATE visitor_sessions 
         SET lastSeen = ?, totalActions = ?, lastFeature = ?, featuresUsed = ?, studentName = ?, studentNim = ? 
         WHERE sessionId = ?`,
        [
          log.timestamp,
          newTotal,
          log.feature,
          JSON.stringify(features),
          log.studentName && log.studentName !== 'Mahasiswa Basis Data' ? log.studentName : sess.studentName,
          log.studentNim && log.studentNim !== '2024-KOMP' ? log.studentNim : sess.studentNim,
          log.sessionId
        ]
      );
    } else {
      // Insert new visitor session with SQL
      alasql(
        'INSERT INTO visitor_sessions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          log.sessionId,
          log.studentName || 'Mahasiswa Basis Data',
          log.studentNim || '2024-KOMP',
          log.device,
          log.browser,
          log.timestamp,
          log.timestamp,
          1,
          log.feature,
          JSON.stringify([log.feature])
        ]
      );
    }

    persistDbToDisk();
    return res.json({ success: true, database: 'SQL (basisdata_admin)', logId: log.id });
  } catch (err: any) {
    console.error('SQL Execution error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics/summary', (req: Request, res: Response) => {
  try {
    alasql('USE basisdata_admin');

    // SQL Aggregation queries
    const visitorsRaw = (alasql('SELECT * FROM visitor_sessions ORDER BY lastSeen DESC') as any[]) || [];
    const logsRaw = (alasql('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 50') as any[]) || [];

    // Parse featuresUsed JSON back to array for frontend
    const visitors = visitorsRaw.map((v: any) => ({
      ...v,
      featuresUsed: v.featuresUsed ? JSON.parse(v.featuresUsed) : []
    }));

    // Feature breakdown count via SQL GROUP BY (avoid reserved keywords like 'count' or 'total')
    let featureCounts: any[] = [];
    try {
      featureCounts = (alasql('SELECT feature, COUNT(*) AS total_count FROM activity_logs GROUP BY feature') as any[]) || [];
    } catch (e) {
      console.warn('Fallback feature grouping:', e);
    }

    const featureBreakdown: Record<string, number> = {
      'SQL Playground': 0,
      'Tantangan Praktik': 0,
      'Aljabar Relasional': 0,
      'Kuis & Ujian': 0,
      'Simulator Normalisasi': 0,
      'Skema ERD': 0,
      'Cheat Sheet': 0
    };

    featureCounts.forEach((row: any) => {
      if (row.feature) {
        featureBreakdown[row.feature] = row.total_count || 0;
      }
    });

    let totalActions = 0;
    try {
      const totalRes = alasql('SELECT COUNT(*) AS total_records FROM activity_logs') as any[];
      totalActions = totalRes?.[0]?.total_records || 0;
    } catch {
      totalActions = (alasql as any).tables?.activity_logs?.data?.length || 0;
    }

    const totalVisitors = Math.max(visitors.length, 1);

    res.json({
      databaseEngine: 'SQL Relational Engine (basisdata_admin)',
      storagePath: 'data/database_store.json',
      totalVisitors,
      activeToday: visitors.length,
      totalActions,
      featureBreakdown,
      recentLogs: logsRaw,
      visitors
    });
  } catch (err: any) {
    console.error('Error querying SQL database:', err);
    // Graceful fallback to prevent client crashes
    res.json({
      databaseEngine: 'SQL Relational Engine (basisdata_admin)',
      storagePath: 'data/database_store.json',
      totalVisitors: 1,
      activeToday: 1,
      totalActions: 0,
      featureBreakdown: {
        'SQL Playground': 0,
        'Tantangan Praktik': 0,
        'Aljabar Relasional': 0,
        'Kuis & Ujian': 0,
        'Simulator Normalisasi': 0,
        'Skema ERD': 0,
        'Cheat Sheet': 0
      },
      recentLogs: [],
      visitors: []
    });
  }
});

app.post('/api/analytics/clear', (req: Request, res: Response) => {
  try {
    alasql('USE basisdata_admin');
    alasql('DELETE FROM activity_logs');
    alasql('DELETE FROM visitor_sessions');
    persistDbToDisk();
    res.json({ success: true, message: 'Database tables cleared' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    // Mount Vite dev server in middleware mode
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`BasisDataLab Full-Stack Server running with SQL Database on http://0.0.0.0:${port}`);
  });
}

startServer();
