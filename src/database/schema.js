export function criarTabelas(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id                            INTEGER PRIMARY KEY AUTOINCREMENT,
      nome                          TEXT    NOT NULL,
      email                         TEXT    NOT NULL UNIQUE,
      senha_hash                    TEXT    NOT NULL,
      codigo_recuperacao_hash       TEXT,
      codigo_recuperacao_expira_em  INTEGER,
      codigo_recuperacao_tentativas INTEGER NOT NULL DEFAULT 0,
      criado_em                     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
