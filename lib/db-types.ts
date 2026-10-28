export interface IDatabase {
  prepare(query: string): ID1PreparedStatement;
}

export interface ID1PreparedStatement {
  bind(...values: unknown[]): ID1PreparedStatement;
  all<T = unknown>(): Promise<{ results: T[]; success: boolean; meta?: unknown }>;
  first<T = unknown>(colName?: string): Promise<T | null>;
}
