import { Router } from 'express';
import { limitarRequisicoes } from '../middlewares/limitarRequisicoes.js';
import { validar } from '../middlewares/validar.js';
import {
  redefinirSenhaSchema,
  solicitarRecuperacaoSchema,
} from '../schemas/recuperacaoSenhaSchemas.js';

export function criarRecuperacaoSenhaRoutes(recuperacaoSenhaController) {
  const rotas = Router();

  rotas.post(
    '/recuperar-senha',
    limitarRequisicoes(),
    validar(solicitarRecuperacaoSchema),
    recuperacaoSenhaController.solicitar,
  );
  rotas.post(
    '/redefinir-senha',
    limitarRequisicoes(),
    validar(redefinirSenhaSchema),
    recuperacaoSenhaController.redefinir,
  );

  return rotas;
}
