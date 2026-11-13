import request from 'supertest';
import { criarApp } from '../src/app.js';
import { conectarBanco } from '../src/database/conexao.js';

export const USUARIO = { nome: 'João Teste', email: 'joao@exemplo.com', senha: 'Senha@123' };

export function criarAmbienteDeTeste() {
  const db = conectarBanco(':memory:');
  const emailsEnviados = [];
  const emailService = {
    async enviarCodigoRecuperacao(mensagem) {
      emailsEnviados.push(mensagem);
    },
  };
  const api = request(criarApp({ db, emailService }));

  return {
    db,
    api,
    emailsEnviados,
    cadastrar: (dados = USUARIO) => api.post('/usuarios').send(dados),
    login: (email, senha) => api.post('/login').send({ email, senha }),
    solicitarRecuperacao: (email) => api.post('/recuperar-senha').send({ email }),
    redefinirSenha: (dados) => api.post('/redefinir-senha').send(dados),
    ultimoCodigoEnviado: () => emailsEnviados.at(-1)?.codigo,
  };
}

export function codigoDiferenteDe(codigo) {
  return codigo === 'AAAA' ? 'BBBB' : 'AAAA';
}
