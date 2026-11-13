import express from 'express';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';
import { criarUsuarioRepository } from './repositories/usuarioRepository.js';
import { criarUsuarioService } from './services/usuarioService.js';
import { criarUsuarioController } from './controllers/usuarioController.js';
import { criarUsuarioRoutes } from './routes/usuarioRoutes.js';

export function criarApp({ db }) {
  const usuarioRepository = criarUsuarioRepository(db);
  const usuarioService = criarUsuarioService(usuarioRepository);

  const app = express();

  app.use(express.json());
  app.get('/', (req, res) => res.json({ mensagem: 'API de recuperação de senha no ar.' }));
  app.use(criarUsuarioRoutes(criarUsuarioController(usuarioService)));
  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
