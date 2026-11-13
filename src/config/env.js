import 'dotenv/config';

const ambiente = process.env.NODE_ENV ?? 'development';
const emProducao = ambiente === 'production';
const MODOS_EMAIL = ['ethereal', 'smtp', 'console'];

function lerSegredo(nome, valorDeDesenvolvimento) {
  const valor = process.env[nome];
  if (valor) return valor;
  if (emProducao) throw new Error(`Variável de ambiente obrigatória ausente: ${nome}`);
  return valorDeDesenvolvimento;
}

function lerModoEmail() {
  const modo = process.env.MAIL_MODE ?? 'ethereal';
  if (!MODOS_EMAIL.includes(modo)) {
    throw new Error(`MAIL_MODE inválido: "${modo}". Use: ${MODOS_EMAIL.join(', ')}.`);
  }
  if (modo === 'console' && ambiente !== 'development') {
    throw new Error('MAIL_MODE=console só é permitido com NODE_ENV=development.');
  }
  return modo;
}

export const config = {
  ambiente,
  porta: Number(process.env.PORT ?? 3000),
  caminhoBanco: process.env.DATABASE_PATH ?? './dados.db',
  jwt: {
    segredo: lerSegredo('JWT_SECRET', 'segredo-apenas-para-desenvolvimento'),
    expiraEm: process.env.JWT_EXPIRES_IN ?? '1h',
  },
  email: {
    modo: lerModoEmail(),
    remetente: process.env.MAIL_FROM ?? 'API Recuperação de Senha <nao-responda@exemplo.com>',
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    },
  },
};
