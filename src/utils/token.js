import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function gerarToken(usuario) {
  return jwt.sign({ sub: String(usuario.id), email: usuario.email }, config.jwt.segredo, {
    expiresIn: config.jwt.expiraEm,
  });
}

export function verificarToken(token) {
  return jwt.verify(token, config.jwt.segredo);
}
