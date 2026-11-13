import nodemailer from 'nodemailer';
import { montarEmailCodigoRecuperacao } from '../emails/codigoRecuperacaoEmail.js';

async function criarTransporteEthereal() {
  const conta = await nodemailer.createTestAccount();
  console.log(`[e-mail] Conta Ethereal de teste: ${conta.user} / ${conta.pass} (https://ethereal.email/login)`);
  return nodemailer.createTransport({
    host: conta.smtp.host,
    port: conta.smtp.port,
    secure: conta.smtp.secure,
    auth: { user: conta.user, pass: conta.pass },
  });
}

async function criarTransporte({ modo, smtp }) {
  return modo === 'smtp' ? nodemailer.createTransport(smtp) : criarTransporteEthereal();
}

export function criarEmailService(configEmail) {
  let transporte;

  // Cria o transporte só no primeiro envio e reaproveita depois; se falhar, tenta de novo no próximo.
  function obterTransporte() {
    transporte ??= criarTransporte(configEmail).catch((erro) => {
      transporte = undefined;
      throw erro;
    });
    return transporte;
  }

  async function enviarCodigoRecuperacao({ para, nome, codigo }) {
    if (configEmail.modo === 'console') {
      console.log(`[e-mail:console] Código de recuperação para ${para}: ${codigo}`);
      return;
    }

    const mensagem = montarEmailCodigoRecuperacao({ nome, codigo });
    const info = await (await obterTransporte()).sendMail({ from: configEmail.remetente, to: para, ...mensagem });

    const linkPreview = nodemailer.getTestMessageUrl(info);
    if (linkPreview) console.log(`[e-mail] Pré-visualização: ${linkPreview}`);
  }

  return { enviarCodigoRecuperacao };
}
