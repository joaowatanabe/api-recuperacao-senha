import { rateLimit } from 'express-rate-limit';
import { LIMITE_REQUISICOES } from '../config/constants.js';

export function limitarRequisicoes({
  maximo = LIMITE_REQUISICOES.MAXIMO_POR_IP,
  janelaMinutos = LIMITE_REQUISICOES.JANELA_MINUTOS,
} = {}) {
  return rateLimit({
    windowMs: janelaMinutos * 60_000,
    limit: maximo,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { erro: 'Muitas requisições. Tente novamente mais tarde.' },
  });
}
