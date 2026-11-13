import { Router } from 'express';
import { validar } from '../middlewares/validar.js';
import { solicitarRecuperacaoSchema } from '../schemas/recuperacaoSenhaSchemas.js';

export function criarRecuperacaoSenhaRoutes(recuperacaoSenhaController) {
  const rotas = Router();
  rotas.post('/recuperar-senha', validar(solicitarRecuperacaoSchema), recuperacaoSenhaController.solicitar);
  return rotas;
}
