function paraUsuario(linha) {
  if (!linha) return null;
  return {
    id: linha.id,
    nome: linha.nome,
    email: linha.email,
    senhaHash: linha.senha_hash,
    criadoEm: linha.criado_em,
  };
}

export function criarUsuarioRepository(db) {
  const consultas = {
    inserir: db.prepare('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)'),
    buscarPorEmail: db.prepare('SELECT * FROM usuarios WHERE email = ?'),
    buscarPorId: db.prepare('SELECT * FROM usuarios WHERE id = ?'),
  };

  return {
    criar({ nome, email, senhaHash }) {
      const { lastInsertRowid } = consultas.inserir.run(nome, email, senhaHash);
      return Number(lastInsertRowid);
    },
    buscarPorEmail: (email) => paraUsuario(consultas.buscarPorEmail.get(email)),
    buscarPorId: (id) => paraUsuario(consultas.buscarPorId.get(id)),
  };
}
