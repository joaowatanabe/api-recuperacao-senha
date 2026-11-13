import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { USUARIO, criarAmbienteDeTeste } from './helpers.js';

describe('Cadastro de usuário', () => {
  let ambiente;
  beforeEach(() => {
    ambiente = criarAmbienteDeTeste();
  });

  it('cadastra usuário e não devolve o hash da senha', async () => {
    const resposta = await ambiente.cadastrar();

    assert.equal(resposta.status, 201);
    assert.equal(resposta.body.email, USUARIO.email);
    assert.equal(resposta.body.senhaHash, undefined);
  });

  it('guarda a senha com bcrypt, nunca em texto puro', async () => {
    await ambiente.cadastrar();
    const { senha_hash } = ambiente.db.prepare('SELECT senha_hash FROM usuarios').get();

    assert.notEqual(senha_hash, USUARIO.senha);
    assert.match(senha_hash, /^\$2[aby]\$/);
  });

  it('recusa e-mail já cadastrado', async () => {
    await ambiente.cadastrar();
    const resposta = await ambiente.cadastrar();

    assert.equal(resposta.status, 409);
  });

  it('recusa senha que não segue as regras de composição', async () => {
    const resposta = await ambiente.cadastrar({ ...USUARIO, senha: 'semnumero' });

    assert.equal(resposta.status, 400);
    assert.ok(resposta.body.detalhes.some(({ campo }) => campo === 'senha'));
  });
});

describe('Login e rota protegida', () => {
  let ambiente;
  beforeEach(async () => {
    ambiente = criarAmbienteDeTeste();
    await ambiente.cadastrar();
  });

  it('retorna um JWT que dá acesso ao perfil', async () => {
    const { body } = await ambiente.login(USUARIO.email, USUARIO.senha);
    const perfil = await ambiente.api.get('/perfil').set('Authorization', `Bearer ${body.token}`);

    assert.equal(perfil.status, 200);
    assert.equal(perfil.body.email, USUARIO.email);
  });

  it('recusa senha errada e e-mail inexistente com a mesma mensagem', async () => {
    const senhaErrada = await ambiente.login(USUARIO.email, 'Errada@123');
    const emailInexistente = await ambiente.login('ninguem@exemplo.com', USUARIO.senha);

    assert.equal(senhaErrada.status, 401);
    assert.deepEqual(senhaErrada.body, emailInexistente.body);
  });

  it('bloqueia o perfil sem token ou com token inválido', async () => {
    const semToken = await ambiente.api.get('/perfil');
    const tokenInvalido = await ambiente.api.get('/perfil').set('Authorization', 'Bearer abc.def.ghi');

    assert.equal(semToken.status, 401);
    assert.equal(tokenInvalido.status, 401);
  });
});
