import { Router } from 'express';
import { limitarRequisicoes } from '../middlewares/limitarRequisicoes.js';
import { validar } from '../middlewares/validar.js';
import { loginSchema } from '../schemas/usuarioSchemas.js';

export function criarAuthRoutes(authController) {
  const rotas = Router();
  rotas.post('/login', limitarRequisicoes(), validar(loginSchema), authController.login);
  return rotas;
}
