function paraUsuario(linha) {
  if (!linha) return null;
  return {
    id: linha.id,
    nome: linha.nome,
    email: linha.email,
    senhaHash: linha.senha_hash,
    criadoEm: linha.criado_em,
    codigoRecuperacao: {
      hash: linha.codigo_recuperacao_hash,
      expiraEm: linha.codigo_recuperacao_expira_em,
      tentativas: linha.codigo_recuperacao_tentativas,
    },
  };
}

export function criarUsuarioRepository(db) {
  const consultas = {
    inserir: db.prepare('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)'),
    buscarPorEmail: db.prepare('SELECT * FROM usuarios WHERE email = ?'),
    buscarPorId: db.prepare('SELECT * FROM usuarios WHERE id = ?'),
    salvarCodigoRecuperacao: db.prepare(`
      UPDATE usuarios
         SET codigo_recuperacao_hash = ?,
             codigo_recuperacao_expira_em = ?,
             codigo_recuperacao_tentativas = 0
       WHERE id = ?
    `),
    registrarTentativaInvalida: db.prepare(`
      UPDATE usuarios
         SET codigo_recuperacao_tentativas = codigo_recuperacao_tentativas + 1
       WHERE id = ?
   RETURNING codigo_recuperacao_tentativas AS tentativas
    `),
    apagarCodigoRecuperacao: db.prepare(`
      UPDATE usuarios
         SET codigo_recuperacao_hash = NULL,
             codigo_recuperacao_expira_em = NULL,
             codigo_recuperacao_tentativas = 0
       WHERE id = ?
    `),
    atualizarSenha: db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?'),
  };

  const atualizarSenhaEApagarCodigo = db.transaction((id, senhaHash) => {
    consultas.atualizarSenha.run(senhaHash, id);
    consultas.apagarCodigoRecuperacao.run(id);
  });

  return {
    criar({ nome, email, senhaHash }) {
      const { lastInsertRowid } = consultas.inserir.run(nome, email, senhaHash);
      return Number(lastInsertRowid);
    },
    buscarPorEmail: (email) => paraUsuario(consultas.buscarPorEmail.get(email)),
    buscarPorId: (id) => paraUsuario(consultas.buscarPorId.get(id)),
    salvarCodigoRecuperacao(id, { codigoHash, expiraEm }) {
      consultas.salvarCodigoRecuperacao.run(codigoHash, expiraEm, id);
    },
    registrarTentativaInvalida: (id) => consultas.registrarTentativaInvalida.get(id).tentativas,
    apagarCodigoRecuperacao(id) {
      consultas.apagarCodigoRecuperacao.run(id);
    },
    atualizarSenhaEApagarCodigo,
  };
}
