import { AppError } from '../errors/AppError.js';
import { compararHash } from '../utils/hash.js';
import { gerarToken } from '../utils/token.js';

export function criarAuthService(usuarioRepository) {
  async function login({ email, senha }) {
    const usuario = usuarioRepository.buscarPorEmail(email);
    const senhaConfere = await compararHash(senha, usuario?.senhaHash);
    if (!senhaConfere) {
      throw new AppError('E-mail ou senha inválidos.', 401);
    }
    return { token: gerarToken(usuario) };
  }

  return { login };
}
