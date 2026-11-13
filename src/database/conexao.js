import Database from 'better-sqlite3';
import { criarTabelas } from './schema.js';

export function conectarBanco(caminho) {
  const db = new Database(caminho);
  db.pragma('journal_mode = WAL');
  criarTabelas(db);
  return db;
}
