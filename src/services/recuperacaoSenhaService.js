import { CODIGO_RECUPERACAO } from '../config/constants.js';
import { AppError } from '../errors/AppError.js';
import { gerarCodigoRecuperacao } from '../utils/codigo.js';
import { compararHash, gerarHash } from '../utils/hash.js';

const MINUTO_EM_MS = 60_000;

// Mesma mensagem para e-mail inexistente, código errado, expirado ou já usado:
// assim a rota não revela qual dessas situações aconteceu.
const erroCodigoInvalido = () => new AppError('Código inválido ou expirado.', 400);

function codigoEstaAtivo({ hash, expiraEm }) {
  return Boolean(hash) && expiraEm > Date.now();
}

export function criarRecuperacaoSenhaService({ usuarioRepository, emailService }) {
  async function solicitar({ email }) {
    const usuario = usuarioRepository.buscarPorEmail(email);
    if (!usuario) return;

    const codigo = gerarCodigoRecuperacao();
    usuarioRepository.salvarCodigoRecuperacao(usuario.id, {
      codigoHash: await gerarHash(codigo),
      expiraEm: Date.now() + CODIGO_RECUPERACAO.VALIDADE_MINUTOS * MINUTO_EM_MS,
    });

    // Não espera o envio para que a resposta não demore mais quando o e-mail existe.
    emailService
      .enviarCodigoRecuperacao({ para: usuario.email, nome: usuario.nome, codigo })
      .catch((erro) => console.error('[e-mail] Falha ao enviar código de recuperação:', erro.message));
  }

  function registrarTentativaInvalida(usuario) {
    const tentativas = usuarioRepository.registrarTentativaInvalida(usuario.id);
    if (tentativas >= CODIGO_RECUPERACAO.MAX_TENTATIVAS) {
      usuarioRepository.apagarCodigoRecuperacao(usuario.id);
    }
  }

  async function redefinir({ email, codigo, novaSenha }) {
    const usuario = usuarioRepository.buscarPorEmail(email);
    const codigoConfere = await compararHash(codigo, usuario?.codigoRecuperacao.hash);

    if (!usuario || !codigoEstaAtivo(usuario.codigoRecuperacao)) {
      throw erroCodigoInvalido();
    }
    if (!codigoConfere) {
      registrarTentativaInvalida(usuario);
      throw erroCodigoInvalido();
    }

    usuarioRepository.atualizarSenhaEApagarCodigo(usuario.id, await gerarHash(novaSenha));
  }

  return { solicitar, redefinir };
}
