import { config } from './config/env.js';
import { conectarBanco } from './database/conexao.js';
import { criarEmailService } from './services/emailService.js';
import { criarApp } from './app.js';

const app = criarApp({
  db: conectarBanco(config.caminhoBanco),
  emailService: criarEmailService(config.email),
});

app.listen(config.porta, () => {
  console.log(`API rodando em http://localhost:${config.porta} (envio de e-mail: ${config.email.modo})`);
});
