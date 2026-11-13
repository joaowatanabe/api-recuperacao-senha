import express from 'express';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';
import { criarUsuarioRepository } from './repositories/usuarioRepository.js';
import { criarUsuarioService } from './services/usuarioService.js';
import { criarAuthService } from './services/authService.js';
import { criarUsuarioController } from './controllers/usuarioController.js';
import { criarAuthController } from './controllers/authController.js';
import { criarUsuarioRoutes } from './routes/usuarioRoutes.js';
import { criarAuthRoutes } from './routes/authRoutes.js';

export function criarApp({ db }) {
  const usuarioRepository = criarUsuarioRepository(db);
  const usuarioService = criarUsuarioService(usuarioRepository);
  const authService = criarAuthService(usuarioRepository);

  const app = express();

  app.use(express.json());
  app.get('/', (req, res) => res.json({ mensagem: 'API de recuperação de senha no ar.' }));
  app.use(criarUsuarioRoutes(criarUsuarioController(usuarioService)));
  app.use(criarAuthRoutes(criarAuthController(authService)));
  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
