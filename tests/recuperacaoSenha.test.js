import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CODIGO_RECUPERACAO, LIMITE_REQUISICOES } from '../src/config/constants.js';
import { USUARIO, codigoDiferenteDe, criarAmbienteDeTeste } from './helpers.js';

const NOVA_SENHA = 'NovaSenha#2026';

describe('Solicitar recuperação de senha', () => {
  let ambiente;
  beforeEach(async () => {
    ambiente = criarAmbienteDeTeste();
    await ambiente.cadastrar();
  });

  it('envia um código de 4 caracteres para e-mail cadastrado', async () => {
    const resposta = await ambiente.solicitarRecuperacao(USUARIO.email);

    assert.equal(resposta.status, 200);
    assert.equal(ambiente.emailsEnviados.length, 1);
    assert.equal(ambiente.emailsEnviados[0].para, USUARIO.email);
    assert.match(ambiente.ultimoCodigoEnviado(), new RegExp(`^[${CODIGO_RECUPERACAO.ALFABETO}]{4}$`));
  });

  it('salva o código com hash e com validade, nunca em texto puro', async () => {
    await ambiente.solicitarRecuperacao(USUARIO.email);
    const linha = ambiente.db
      .prepare('SELECT codigo_recuperacao_hash, codigo_recuperacao_expira_em FROM usuarios')
      .get();

    assert.notEqual(linha.codigo_recuperacao_hash, ambiente.ultimoCodigoEnviado());
    assert.match(linha.codigo_recuperacao_hash, /^\$2[aby]\$/);
    assert.ok(linha.codigo_recuperacao_expira_em > Date.now());
  });

  it('responde igual para e-mail inexistente e não envia nada', async () => {
    const existente = await ambiente.solicitarRecuperacao(USUARIO.email);
    const inexistente = await ambiente.solicitarRecuperacao('ninguem@exemplo.com');

    assert.equal(inexistente.status, 200);
    assert.deepEqual(inexistente.body, existente.body);
    assert.equal(ambiente.emailsEnviados.length, 1);
  });

  it('recusa e-mail em formato inválido', async () => {
    const resposta = await ambiente.solicitarRecuperacao('nao-e-email');

    assert.equal(resposta.status, 400);
  });

  it('bloqueia excesso de requisições do mesmo IP', async () => {
    for (let i = 0; i < LIMITE_REQUISICOES.MAXIMO_POR_IP; i++) {
      await ambiente.solicitarRecuperacao('ninguem@exemplo.com');
    }
    const resposta = await ambiente.solicitarRecuperacao('ninguem@exemplo.com');

    assert.equal(resposta.status, 429);
  });
});

describe('Redefinir senha', () => {
  let ambiente;
  let codigo;
  beforeEach(async () => {
    ambiente = criarAmbienteDeTeste();
    await ambiente.cadastrar();
    await ambiente.solicitarRecuperacao(USUARIO.email);
    codigo = ambiente.ultimoCodigoEnviado();
  });

  it('altera a senha com código válido', async () => {
    const resposta = await ambiente.redefinirSenha({ email: USUARIO.email, codigo, novaSenha: NOVA_SENHA });

    assert.equal(resposta.status, 200);
    assert.equal((await ambiente.login(USUARIO.email, NOVA_SENHA)).status, 200);
    assert.equal((await ambiente.login(USUARIO.email, USUARIO.senha)).status, 401);
  });

  it('aceita o código digitado em minúsculas', async () => {
    const resposta = await ambiente.redefinirSenha({
      email: USUARIO.email,
      codigo: codigo.toLowerCase(),
      novaSenha: NOVA_SENHA,
    });

    assert.equal(resposta.status, 200);
  });

  it('recusa código inválido sem alterar a senha', async () => {
    const resposta = await ambiente.redefinirSenha({
      email: USUARIO.email,
      codigo: codigoDiferenteDe(codigo),
      novaSenha: NOVA_SENHA,
    });

    assert.equal(resposta.status, 400);
    assert.equal(resposta.body.erro, 'Código inválido ou expirado.');
    assert.equal((await ambiente.login(USUARIO.email, USUARIO.senha)).status, 200);
  });

  it('recusa código expirado', async () => {
    ambiente.db.prepare('UPDATE usuarios SET codigo_recuperacao_expira_em = ?').run(Date.now() - 1);

    const resposta = await ambiente.redefinirSenha({ email: USUARIO.email, codigo, novaSenha: NOVA_SENHA });

    assert.equal(resposta.status, 400);
    assert.equal(resposta.body.erro, 'Código inválido ou expirado.');
  });

  it('recusa nova senha fraca', async () => {
    const resposta = await ambiente.redefinirSenha({ email: USUARIO.email, codigo, novaSenha: '12345678' });

    assert.equal(resposta.status, 400);
    assert.ok(resposta.body.detalhes.some(({ campo }) => campo === 'novaSenha'));
  });

  it('recusa e-mail sem código pendente com a mesma mensagem', async () => {
    await ambiente.cadastrar({ ...USUARIO, email: 'outro@exemplo.com' });

    const resposta = await ambiente.redefinirSenha({ email: 'outro@exemplo.com', codigo, novaSenha: NOVA_SENHA });

    assert.equal(resposta.status, 400);
    assert.equal(resposta.body.erro, 'Código inválido ou expirado.');
  });

  it('não permite reutilizar o código', async () => {
    await ambiente.redefinirSenha({ email: USUARIO.email, codigo, novaSenha: NOVA_SENHA });

    const reuso = await ambiente.redefinirSenha({ email: USUARIO.email, codigo, novaSenha: 'Outra@Senha9' });

    assert.equal(reuso.status, 400);
    assert.equal((await ambiente.login(USUARIO.email, NOVA_SENHA)).status, 200);
  });

  it(`invalida o código após ${CODIGO_RECUPERACAO.MAX_TENTATIVAS} tentativas erradas`, async () => {
    const codigoErrado = codigoDiferenteDe(codigo);
    for (let i = 0; i < CODIGO_RECUPERACAO.MAX_TENTATIVAS; i++) {
      await ambiente.redefinirSenha({ email: USUARIO.email, codigo: codigoErrado, novaSenha: NOVA_SENHA });
    }

    const comCodigoCerto = await ambiente.redefinirSenha({ email: USUARIO.email, codigo, novaSenha: NOVA_SENHA });

    assert.equal(comCodigoCerto.status, 400);
  });

  it('um novo pedido substitui o código anterior', async () => {
    await ambiente.solicitarRecuperacao(USUARIO.email);
    const codigoNovo = ambiente.ultimoCodigoEnviado();

    const comCodigoAntigo = await ambiente.redefinirSenha({ email: USUARIO.email, codigo, novaSenha: NOVA_SENHA });
    const comCodigoNovo = await ambiente.redefinirSenha({
      email: USUARIO.email,
      codigo: codigoNovo,
      novaSenha: NOVA_SENHA,
    });

    assert.equal(comCodigoAntigo.status, 400);
    assert.equal(comCodigoNovo.status, 200);
  });
});
