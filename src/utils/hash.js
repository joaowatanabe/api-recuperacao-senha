import bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../config/constants.js';

const HASH_FICTICIO = bcrypt.hashSync('valor-ficticio', BCRYPT_SALT_ROUNDS);

export function gerarHash(valor) {
  return bcrypt.hash(valor, BCRYPT_SALT_ROUNDS);
}

// Sempre executa o bcrypt, mesmo sem hash para comparar, para que o tempo de
// resposta não revele se o usuário existe.
export async function compararHash(valor, hash) {
  const confere = await bcrypt.compare(valor, hash ?? HASH_FICTICIO);
  return Boolean(hash) && confere;
}
