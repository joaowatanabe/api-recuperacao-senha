import { Router } from 'express';
import { autenticar } from '../middlewares/autenticar.js';
import { validar } from '../middlewares/validar.js';
import { cadastroSchema } from '../schemas/usuarioSchemas.js';

export function criarUsuarioRoutes(usuarioController) {
  const rotas = Router();
  rotas.post('/usuarios', validar(cadastroSchema), usuarioController.cadastrar);
  rotas.get('/perfil', autenticar, usuarioController.perfil);
  return rotas;
}
