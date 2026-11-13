import { Router } from 'express';
import { validar } from '../middlewares/validar.js';
import {
  redefinirSenhaSchema,
  solicitarRecuperacaoSchema,
} from '../schemas/recuperacaoSenhaSchemas.js';

export function criarRecuperacaoSenhaRoutes(recuperacaoSenhaController) {
  const rotas = Router();
  rotas.post('/recuperar-senha', validar(solicitarRecuperacaoSchema), recuperacaoSenhaController.solicitar);
  rotas.post('/redefinir-senha', validar(redefinirSenhaSchema), recuperacaoSenhaController.redefinir);
  return rotas;
}
