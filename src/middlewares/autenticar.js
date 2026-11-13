import { AppError } from '../errors/AppError.js';
import { verificarToken } from '../utils/token.js';

export function autenticar(req, res, next) {
  const [tipo, token] = req.headers.authorization?.split(' ') ?? [];
  if (tipo !== 'Bearer' || !token) {
    throw new AppError('Token de acesso não informado.', 401);
  }

  try {
    req.usuarioId = Number(verificarToken(token).sub);
  } catch {
    throw new AppError('Token de acesso inválido ou expirado.', 401);
  }
  next();
}
