import { IDatabase } from "./db-types";

export * from "./db-types";

let localNodeSqliteDb: unknown = null;

function getLocalNodeDatabase(): IDatabase {
  if (typeof process !== "undefined" && process.env.NEXT_RUNTIME === "edge") {
    // Trong môi trường Edge, trả về mock an toàn nếu không tìm thấy Cloudflare binding
    return {
      prepare() {
        return {
          bind() {
            return this;
          },
          async all<T>() {
            return { results: [] as T[], success: true };
          },
          async first<T>() {
            return null;
          },
        };
      },
    };
  }

  if (!localNodeSqliteDb) {
    try {
      // Dùng eval('require') để Webpack không trace và bundle node:sqlite vào Edge bundle
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const dynamicRequire = eval("require");
      const { DatabaseSync } = dynamicRequire("node:sqlite");
      const path = dynamicRequire("path");
      const fs = dynamicRequire("fs");

      const dbPath = path.join(process.cwd(), "data", "zipcodes_local.db");
      const dataDir = path.dirname(dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const db = new DatabaseSync(dbPath);

      // Tự động nạp schema và seed nếu chưa có bảng
      const checkTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='zipcodes'").all();
      if (checkTable.length === 0) {
        const schemaPath = path.join(process.cwd(), "migrations", "0001_initial_schema.sql");
        const seedPath = path.join(process.cwd(), "data", "seed", "seed_data.sql");
        if (fs.existsSync(schemaPath)) {
          db.exec(fs.readFileSync(schemaPath, "utf-8"));
        }
        if (fs.existsSync(seedPath)) {
          db.exec(fs.readFileSync(seedPath, "utf-8"));
        }
      }

      localNodeSqliteDb = db;
    } catch (e) {
      console.warn("Không thể tải fallback node:sqlite:", e);
    }
  }

  const rawDb = localNodeSqliteDb as {
    prepare: (sql: string) => { all: (...args: unknown[]) => unknown[] };
  };

  return {
    prepare(sql: string) {
      let boundValues: unknown[] = [];
      return {
        bind(...values: unknown[]) {
          boundValues = values;
          return this;
        },
        async all<T>() {
          if (!rawDb) return { results: [] as T[], success: true };
          try {
            const stmt = rawDb.prepare(sql);
            const results = stmt.all(...boundValues) as T[];
            return { results, success: true };
          } catch (err) {
            console.error("Lỗi truy vấn SQL local:", err);
            return { results: [] as T[], success: false };
          }
        },
        async first<T>(colName?: string) {
          if (!rawDb) return null;
          try {
            const stmt = rawDb.prepare(sql);
            const rows = stmt.all(...boundValues) as Record<string, unknown>[];
            if (!rows || rows.length === 0) return null;
            if (colName) return (rows[0][colName] as T) ?? null;
            return (rows[0] as unknown as T) ?? null;
          } catch {
            return null;
          }
        },
      };
    },
  };
}

/**
 * Lấy D1 Database instance:
 * 1. Nếu đang chạy trên Cloudflare Pages (Edge Runtime) -> Lấy env.DB từ context
 * 2. Nếu đang chạy test/local dev -> Lấy fallback SQLite database tương thích D1
 */
export async function getDatabase(): Promise<IDatabase> {
  try {
    const { getRequestContext } = await import("@cloudflare/next-on-pages");
    const ctx = getRequestContext();
    if (ctx && ctx.env && ctx.env.DB) {
      return ctx.env.DB as unknown as IDatabase;
    }
  } catch {
    // Không trong môi trường Cloudflare context
  }

  return getLocalNodeDatabase();
}
