import express from 'express';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';

export function criarApp() {
  const app = express();

  app.use(express.json());
  app.get('/', (req, res) => res.json({ mensagem: 'API de recuperação de senha no ar.' }));
  app.use(rotaNaoEncontrada);
  app.use(tratarErros);

  return app;
}
