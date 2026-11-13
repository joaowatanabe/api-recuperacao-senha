import { config } from './config/env.js';
import { criarApp } from './app.js';

const app = criarApp();

app.listen(config.porta, () => {
  console.log(`API rodando em http://localhost:${config.porta}`);
});
