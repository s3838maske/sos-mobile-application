import * as SQLite from "expo-sqlite";
import { EmergencyContact, SOSEvent, User } from "../redux/types";

const DATABASE_NAME = "womensafety.db";

export const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS user_profile (id TEXT PRIMARY KEY, data TEXT NOT NULL);",
  );
  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS emergency_contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL, relation TEXT NOT NULL);",
  );
  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS sos_logs (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, data TEXT NOT NULL);",
  );

  return db;
};

// User Profile
export const saveUserProfileOffline = async (user: User) => {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.runAsync(
    "INSERT OR REPLACE INTO user_profile (id, data) VALUES (?, ?)",
    [user.uid, JSON.stringify(user)],
  );
};

export const getUserProfileOffline = async (
  uid: string,
): Promise<User | null> => {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  const result = await db.getFirstAsync<{ data: string }>(
    "SELECT data FROM user_profile WHERE id = ?",
    [uid],
  );
  return result ? JSON.parse(result.data) : null;
};

// Emergency Contacts
export const saveEmergencyContactsOffline = async (
  userId: string,
  contacts: EmergencyContact[],
) => {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.runAsync("DELETE FROM emergency_contacts WHERE user_id = ?", [
    userId,
  ]);

  for (const contact of contacts) {
    await db.runAsync(
      "INSERT INTO emergency_contacts (user_id, name, phone, relation) VALUES (?, ?, ?, ?)",
      [userId, contact.name, contact.phone, contact.relation],
    );
  }
};

export const getEmergencyContactsOffline = async (
  userId: string,
): Promise<EmergencyContact[]> => {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  const rows = await db.getAllAsync<EmergencyContact>(
    "SELECT name, phone, relation FROM emergency_contacts WHERE user_id = ?",
    [userId],
  );
  return rows;
};

// SOS Logs
export const saveSOSLogOffline = async (event: SOSEvent) => {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.runAsync(
    "INSERT OR REPLACE INTO sos_logs (id, user_id, data) VALUES (?, ?, ?)",
    [event.id, event.userId, JSON.stringify(event)],
  );
};

export const getSOSLogsOffline = async (
  userId: string,
): Promise<SOSEvent[]> => {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  const rows = await db.getAllAsync<{ data: string }>(
    "SELECT data FROM sos_logs WHERE user_id = ? ORDER BY id DESC",
    [userId],
  );
  return rows.map((row) => JSON.parse(row.data));
};
