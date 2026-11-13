import { CODIGO_RECUPERACAO } from '../config/constants.js';
import { gerarCodigoRecuperacao } from '../utils/codigo.js';
import { gerarHash } from '../utils/hash.js';

const MINUTO_EM_MS = 60_000;

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

  return { solicitar };
}
