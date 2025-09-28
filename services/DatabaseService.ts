import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

let _db: ReturnType<typeof drizzle>;

const DATABASE_NAME = "zentry.db";

export const DatabaseService = {
  initialize() {
    if (!_db) {
      const expoDb = openDatabaseSync(DATABASE_NAME, {
        useNewConnection: true
      });
      _db = drizzle(expoDb, { schema });
    }
    return _db;
  },

  get db() {
    if (!_db) throw new Error("Database not initialized");
    return _db;
  }
};
