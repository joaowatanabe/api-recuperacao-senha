import { Router } from 'express';
import { validar } from '../middlewares/validar.js';
import { loginSchema } from '../schemas/usuarioSchemas.js';

export function criarAuthRoutes(authController) {
  const rotas = Router();
  rotas.post('/login', validar(loginSchema), authController.login);
  return rotas;
}
