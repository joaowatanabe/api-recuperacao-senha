const MENSAGEM_SOLICITACAO =
  'Se o e-mail estiver cadastrado, você receberá um código de recuperação em instantes.';

export function criarRecuperacaoSenhaController(recuperacaoSenhaService) {
  return {
    async solicitar(req, res) {
      await recuperacaoSenhaService.solicitar(req.body);
      res.json({ mensagem: MENSAGEM_SOLICITACAO });
    },
  };
}
