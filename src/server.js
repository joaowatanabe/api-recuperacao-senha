import { config } from './config/env.js';
import { conectarBanco } from './database/conexao.js';
import { criarApp } from './app.js';

const app = criarApp({ db: conectarBanco(config.caminhoBanco) });

app.listen(config.porta, () => {
  console.log(`API rodando em http://localhost:${config.porta}`);
});
