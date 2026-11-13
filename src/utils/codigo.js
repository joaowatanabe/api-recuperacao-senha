import { randomInt } from 'node:crypto';
import { CODIGO_RECUPERACAO } from '../config/constants.js';

// randomInt usa um gerador criptograficamente seguro, ao contrário de Math.random.
export function gerarCodigoRecuperacao() {
  const { TAMANHO, ALFABETO } = CODIGO_RECUPERACAO;
  return Array.from({ length: TAMANHO }, () => ALFABETO[randomInt(ALFABETO.length)]).join('');
}
