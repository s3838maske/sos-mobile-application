import * as SQLite from "expo-sqlite";
import { EmergencyContact, SOSEvent, User } from "../redux/types";

const DATABASE_NAME = "womensafety.db";
let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbOpeningPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Sequential queue to prevent concurrent database access issues
let dbTaskQueue: Promise<any> = Promise.resolve();

/**
 * Ensures that database operations are executed sequentially.
 * This is crucial for preventing native-level NullPointerExceptions and locked database errors.
 */
const queueTask = <T>(task: () => Promise<T>): Promise<T | void> => {
  const nextTask = dbTaskQueue.then(async () => {
    try {
      return await task();
    } catch (error) {
      console.error("[SQLite Queue] Task failed:", error);
    }
  });
  dbTaskQueue = nextTask;
  return nextTask;
};

/**
 * Gets the database instance, opening it if necessary.
 * Uses a singleton pattern with a promise to handle concurrent requests during initialization.
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) return dbInstance;
  if (dbOpeningPromise) return dbOpeningPromise;

  dbOpeningPromise = (async () => {
    try {
      console.log("[SQLite] Opening database...");
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      dbInstance = db;
      console.log("[SQLite] Database opened successfully.");
      return db;
    } catch (error) {
      console.error("[SQLite] Failed to open database:", error);
      throw error;
    } finally {
      dbOpeningPromise = null;
    }
  })();

  return dbOpeningPromise;
};

/**
 * Initializes the database schema.
 */
export const initDatabase = async () => {
  return queueTask(async () => {
    const db = await getDatabase();
    console.log("[SQLite] Initializing schema...");

    await db.execAsync(
      "CREATE TABLE IF NOT EXISTS user_profile (id TEXT PRIMARY KEY, data TEXT NOT NULL);",
    );
    await db.execAsync(
      "CREATE TABLE IF NOT EXISTS emergency_contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL, relation TEXT NOT NULL);",
    );
    await db.execAsync(
      "CREATE TABLE IF NOT EXISTS sos_logs (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, data TEXT NOT NULL);",
    );

    console.log("[SQLite] Schema initialized.");
  });
};

/**
 * Saves the user profile for offline access.
 */
export const saveUserProfileOffline = async (user: User) => {
  if (!user || !user.uid) return;

  return queueTask(async () => {
    const db = await getDatabase();
    await db.runAsync(
      "INSERT OR REPLACE INTO user_profile (id, data) VALUES (?, ?)",
      [user.uid, JSON.stringify(user)],
    );
  });
};

/**
 * Retrieves the user profile from offline storage.
 */
export const getUserProfileOffline = async (
  uid: string,
): Promise<User | null> => {
  if (!uid) return null;

  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ data: string }>(
      "SELECT data FROM user_profile WHERE id = ?",
      [uid],
    );
    return result ? JSON.parse(result.data) : null;
  } catch (error) {
    console.error("[SQLite] Error reading user profile:", error);
    return null;
  }
};

/**
 * Saves emergency contacts for offline access.
 */
export const saveEmergencyContactsOffline = async (
  userId: string,
  contacts: EmergencyContact[],
) => {
  if (!userId) return;

  return queueTask(async () => {
    const db = await getDatabase();

    // Clear existing contacts and replace with new ones in a single task
    await db.runAsync("DELETE FROM emergency_contacts WHERE user_id = ?", [
      userId,
    ]);

    for (const contact of contacts) {
      if (!contact.name || !contact.phone) continue;
      await db.runAsync(
        "INSERT INTO emergency_contacts (user_id, name, phone, relation) VALUES (?, ?, ?, ?)",
        [userId, contact.name, contact.phone, contact.relation || ""],
      );
    }
  });
};

/**
 * Retrieves emergency contacts from offline storage.
 */
export const getEmergencyContactsOffline = async (
  userId: string,
): Promise<EmergencyContact[]> => {
  if (!userId) return [];

  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<EmergencyContact>(
      "SELECT name, phone, relation FROM emergency_contacts WHERE user_id = ?",
      [userId],
    );
    return rows;
  } catch (error) {
    console.error("[SQLite] Error reading emergency contacts:", error);
    return [];
  }
};

/**
 * Saves an SOS log for offline history.
 */
export const saveSOSLogOffline = async (event: SOSEvent) => {
  if (!event || !event.id || !event.userId) return;

  return queueTask(async () => {
    const db = await getDatabase();
    // Use explicit parameter passing to avoid NullPointerIssues on native side
    const id = event.id ?? "";
    const userId = event.userId ?? "";
    const data = JSON.stringify(event);

    await db.runAsync(
      "INSERT OR REPLACE INTO sos_logs (id, user_id, data) VALUES (?, ?, ?)",
      [id, userId, data],
    );
  });
};

/**
 * Retrieves SOS logs for a specific user.
 */
export const getSOSLogsOffline = async (
  userId: string,
): Promise<SOSEvent[]> => {
  if (!userId) return [];

  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ data: string }>(
      "SELECT data FROM sos_logs WHERE user_id = ? ORDER BY id DESC",
      [userId],
    );
    return rows.map((row) => JSON.parse(row.data));
  } catch (error) {
    console.error("[SQLite] Error reading SOS logs:", error);
    return [];
  }
};
