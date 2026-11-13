import { z } from 'zod';
import { CODIGO_RECUPERACAO } from '../config/constants.js';
import { emailSchema, senhaSchema } from './usuarioSchemas.js';

export const solicitarRecuperacaoSchema = z.object({
  email: emailSchema,
});

export const redefinirSenhaSchema = z.object({
  email: emailSchema,
  codigo: z
    .string({ error: 'Informe o código de recuperação.' })
    .trim()
    .toUpperCase()
    .length(
      CODIGO_RECUPERACAO.TAMANHO,
      `O código deve ter ${CODIGO_RECUPERACAO.TAMANHO} caracteres.`,
    ),
  novaSenha: senhaSchema,
});
