import { z } from 'zod';
import { emailSchema } from './usuarioSchemas.js';

export const solicitarRecuperacaoSchema = z.object({
  email: emailSchema,
});
