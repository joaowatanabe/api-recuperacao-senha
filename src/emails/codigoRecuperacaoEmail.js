import { CODIGO_RECUPERACAO } from '../config/constants.js';

export function montarEmailCodigoRecuperacao({ nome, codigo }) {
  const validade = `${CODIGO_RECUPERACAO.VALIDADE_MINUTOS} minutos`;

  return {
    subject: 'Seu código de recuperação de senha',
    text: [
      `Olá, ${nome}!`,
      `Seu código para redefinir a senha é: ${codigo}`,
      `Ele vale por ${validade} e só pode ser usado uma vez.`,
      'Se você não pediu a recuperação, ignore este e-mail.',
    ].join('\n\n'),
    html: `
      <p>Olá, ${escaparHtml(nome)}!</p>
      <p>Seu código para redefinir a senha é:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px">${codigo}</p>
      <p>Ele vale por ${validade} e só pode ser usado uma vez.</p>
      <p>Se você não pediu a recuperação, ignore este e-mail.</p>
    `,
  };
}

function escaparHtml(texto) {
  const entidades = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return texto.replace(/[&<>"']/g, (caractere) => entidades[caractere]);
}
