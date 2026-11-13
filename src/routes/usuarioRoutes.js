import { Router } from 'express';
import { validar } from '../middlewares/validar.js';
import { cadastroSchema } from '../schemas/usuarioSchemas.js';

export function criarUsuarioRoutes(usuarioController) {
  const rotas = Router();
  rotas.post('/usuarios', validar(cadastroSchema), usuarioController.cadastrar);
  return rotas;
}
