import { useState, useEffect, useCallback } from "react";
import initSqlJs, { Database } from "sql.js";

interface UseSqliteReturn {
  db: Database | null;
  loading: boolean;
  error: string | null;
  executeQuery: (sql: string, params?: unknown[]) => QueryResult;
}

interface QueryResult {
  columns: string[];
  values: unknown[][];
  error?: string;
}

export function useSqlite(): UseSqliteReturn {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initDb() {
      try {
        setLoading(true);
        setError(null);

        // Initialize sql.js with WASM
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`,
        });

        // Fetch the database (use base URL for GitHub Pages compatibility)
        const baseUrl = import.meta.env.BASE_URL || "/";
        const response = await fetch(`${baseUrl}mozaic.db`);
        if (!response.ok) {
          throw new Error(`Failed to load database: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const database = new SQL.Database(new Uint8Array(buffer));

        setDb(database);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load database");
        setLoading(false);
      }
    }

    initDb();

    // Cleanup
    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  const executeQuery = useCallback(
    (sql: string, params: unknown[] = []): QueryResult => {
      if (!db) {
        return { columns: [], values: [], error: "Database not loaded" };
      }

      try {
        const stmt = db.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }

        const columns: string[] = stmt.getColumnNames();
        const values: unknown[][] = [];

        while (stmt.step()) {
          values.push(stmt.get());
        }

        stmt.free();
        return { columns, values };
      } catch (err) {
        return {
          columns: [],
          values: [],
          error: err instanceof Error ? err.message : "Query failed",
        };
      }
    },
    [db]
  );

  return { db, loading, error, executeQuery };
}
