import alasql from 'alasql';
import { DATASETS } from '../data/databaseDatasets';
import { DatasetKey, QueryResult } from '../types/database';

class SqlEngineService {
  private initialized: Record<string, boolean> = {};

  constructor() {
    // Enable AlaSQL options if needed
    try {
      (alasql as any).options.casesensitive = false;
    } catch {
      // ignore
    }
  }

  public initDataset(datasetKey: DatasetKey, forceReset = false): void {
    if (this.initialized[datasetKey] && !forceReset) {
      return;
    }

    const dataset = DATASETS[datasetKey];
    if (!dataset) return;

    try {
      // Use a dedicated database name in alasql to isolate datasets
      const dbName = `db_${datasetKey}`;
      alasql(`DROP DATABASE IF EXISTS ${dbName}`);
      alasql(`CREATE DATABASE ${dbName}`);
      alasql(`USE ${dbName}`);

      // Create tables and seed data
      for (const table of Object.values(dataset.tables)) {
        // DDL
        try {
          alasql(table.ddlSql);
        } catch (e) {
          // If detailed DDL fails due to specific dialect types, create simple table
          alasql(`CREATE TABLE IF NOT EXISTS ${table.name}`);
        }

        // Insert sample data
        if (table.sampleData && table.sampleData.length > 0) {
          alasql.tables[table.name].data = JSON.parse(JSON.stringify(table.sampleData));
        }
      }

      this.initialized[datasetKey] = true;
    } catch (err: any) {
      console.error(`Error initializing dataset ${datasetKey}:`, err);
    }
  }

  public resetDataset(datasetKey: DatasetKey): void {
    this.initDataset(datasetKey, true);
  }

  public execute(datasetKey: DatasetKey, query: string): QueryResult {
    const startTime = performance.now();
    this.initDataset(datasetKey);

    const dbName = `db_${datasetKey}`;

    try {
      alasql(`USE ${dbName}`);

      // Clean query (remove trailing semicolon)
      const cleanSql = query.trim().replace(/;+$/, '');

      if (!cleanSql) {
        return {
          success: true,
          columns: [],
          rows: [],
          rowCount: 0,
          executionTimeMs: 0
        };
      }

      const res = alasql(cleanSql);
      const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

      // Result could be an array of objects (for SELECT), or a number (for INSERT/UPDATE/DELETE)
      if (Array.isArray(res)) {
        if (res.length === 0) {
          return {
            success: true,
            columns: [],
            rows: [],
            rowCount: 0,
            executionTimeMs
          };
        }

        // Extract column names from first row
        const firstRow = res[0];
        if (typeof firstRow === 'object' && firstRow !== null) {
          const columns = Object.keys(firstRow);
          const rows = res.map((item) => columns.map((col) => item[col]));
          return {
            success: true,
            columns,
            rows,
            rawRows: res,
            rowCount: res.length,
            executionTimeMs
          };
        } else {
          // Scalar or list of primitives
          return {
            success: true,
            columns: ['Hasil'],
            rows: res.map((val) => [val]),
            rawRows: res.map((val) => ({ Hasil: val })),
            rowCount: res.length,
            executionTimeMs
          };
        }
      } else {
        // Non-select command result (e.g. number of modified rows or 1 for success)
        const count = typeof res === 'number' ? res : 1;
        return {
          success: true,
          columns: ['Keterangan Status'],
          rows: [[`Perintah SQL berhasil dieksekusi (${count} entri diproses)`]],
          rowCount: count,
          executionTimeMs
        };
      }
    } catch (err: any) {
      const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
      let errorMsg = err?.message || String(err);

      // Translate common error messages to helpful Indonesian
      if (errorMsg.includes('does not exist') || errorMsg.includes('Table does not exist')) {
        errorMsg = `Tabel atau kolom yang dipanggil tidak ditemukan dalam skema database. Pastikan ejaan nama tabel sudah sesuai. (${errorMsg})`;
      } else if (errorMsg.includes('Parse error') || errorMsg.includes('SyntaxError')) {
        errorMsg = `Sintaks SQL kurang tepat. Periksa kembali koma, tanda kurung, kata kunci (SELECT, FROM, WHERE, JOIN), dan tanda petik teks. (${errorMsg})`;
      }

      return {
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs,
        error: errorMsg
      };
    }
  }

  /**
   * Helper to evaluate challenge code against solution code
   */
  public evaluateChallenge(
    datasetKey: DatasetKey,
    userQuery: string,
    solutionQuery: string,
    checkType: 'exact' | 'columns_and_rows' | 'mutation' = 'columns_and_rows',
    mutationVerificationSql?: string
  ): {
    passed: boolean;
    userResult: QueryResult;
    expectedResult: QueryResult;
    feedback: string;
  } {
    // 1. Run solution query on clean sandbox
    this.resetDataset(datasetKey);
    const expectedResult = this.execute(datasetKey, solutionQuery);

    // 2. Re-clean sandbox and run user query
    this.resetDataset(datasetKey);
    const userResult = this.execute(datasetKey, userQuery);

    if (!userResult.success) {
      return {
        passed: false,
        userResult,
        expectedResult,
        feedback: `Kueri Anda menghasilkan error: ${userResult.error}`
      };
    }

    if (checkType === 'mutation') {
      if (!mutationVerificationSql) {
        return {
          passed: true,
          userResult,
          expectedResult,
          feedback: 'Kueri modifikasi berhasil dijalankan.'
        };
      }
      // Run verification query
      const userState = this.execute(datasetKey, mutationVerificationSql);
      
      // Also run on reference db
      this.resetDataset(datasetKey);
      this.execute(datasetKey, solutionQuery);
      const expectedState = this.execute(datasetKey, mutationVerificationSql);

      const passed = this.compareRows(userState.rawRows || [], expectedState.rawRows || []);
      return {
        passed,
        userResult,
        expectedResult: expectedState,
        feedback: passed
          ? 'Sempurna! Modifikasi data (INSERT/UPDATE/DELETE) telah mengubah database sesuai kriteria.'
          : 'Data di database belum sesuai dengan kondisi yang diminta setelah dieksekusi.'
      };
    }

    // Default SELECT comparison: columns and rows
    const userRows = userResult.rawRows || [];
    const expectedRows = expectedResult.rawRows || [];

    if (userRows.length !== expectedRows.length) {
      return {
        passed: false,
        userResult,
        expectedResult,
        feedback: `Jumlah baris belum sesuai. Kueri Anda menghasilkan ${userRows.length} baris data, sedangkan jawaban yang diharapkan adalah ${expectedRows.length} baris.`
      };
    }

    // Column count comparison
    if (userResult.columns.length !== expectedResult.columns.length) {
      return {
        passed: false,
        userResult,
        expectedResult,
        feedback: `Jumlah kolom belum sesuai. Kolom Anda (${userResult.columns.join(', ')}) berbeda dengan kolom yang diharapkan (${expectedResult.columns.join(', ')}).`
      };
    }

    // Value matching
    const passed = this.compareRows(userRows, expectedRows);
    if (!passed) {
      return {
        passed: false,
        userResult,
        expectedResult,
        feedback: 'Kueri berhasil berjalan, namun nilai isi baris atau pengurutan data masih berbeda dari jawaban yang diharapkan.'
      };
    }

    return {
      passed: true,
      userResult,
      expectedResult,
      feedback: 'Luar biasa! Kueri SQL Anda 100% tepat dan menghasilkan data yang valid.'
    };
  }

  private compareRows(userRows: any[], expectedRows: any[]): boolean {
    if (userRows.length !== expectedRows.length) return false;
    if (userRows.length === 0) return true;

    // Compare stringified representations normalized for floating points & case
    for (let i = 0; i < expectedRows.length; i++) {
      const exp = expectedRows[i];
      const usr = userRows[i];

      const expKeys = Object.keys(exp);
      const usrKeys = Object.keys(usr);

      for (let j = 0; j < expKeys.length; j++) {
        const expVal = exp[expKeys[j]];
        const usrVal = usr[usrKeys[j]];

        if (typeof expVal === 'number' && typeof usrVal === 'number') {
          if (Math.abs(expVal - usrVal) > 0.01) return false;
        } else if (String(expVal ?? '').trim().toLowerCase() !== String(usrVal ?? '').trim().toLowerCase()) {
          return false;
        }
      }
    }
    return true;
  }
}

export const sqlEngine = new SqlEngineService();
