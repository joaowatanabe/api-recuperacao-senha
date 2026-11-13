import { AppError } from '../errors/AppError.js';
import { gerarHash } from '../utils/hash.js';

function dadosPublicos({ id, nome, email, criadoEm }) {
  return { id, nome, email, criadoEm };
}

export function criarUsuarioService(usuarioRepository) {
  async function cadastrar({ nome, email, senha }) {
    if (usuarioRepository.buscarPorEmail(email)) {
      throw new AppError('E-mail já cadastrado.', 409);
    }
    const id = usuarioRepository.criar({ nome, email, senhaHash: await gerarHash(senha) });
    return dadosPublicos(usuarioRepository.buscarPorId(id));
  }

  function buscarPerfil(id) {
    const usuario = usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new AppError('Usuário não encontrado.', 404);
    }
    return dadosPublicos(usuario);
  }

  return { cadastrar, buscarPerfil };
}
