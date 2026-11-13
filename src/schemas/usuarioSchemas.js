import { z } from 'zod';

export const emailSchema = z
  .string({ error: 'Informe o e-mail.' })
  .trim()
  .toLowerCase()
  .pipe(z.email('E-mail inválido.'));

// Regras de composição usadas tanto no cadastro quanto na redefinição de senha.
// O máximo de 72 caracteres existe porque o bcrypt ignora o que passa disso.
export const senhaSchema = z
  .string({ error: 'Informe a senha.' })
  .min(8, 'A senha deve ter no mínimo 8 caracteres.')
  .max(72, 'A senha deve ter no máximo 72 caracteres.')
  .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula.')
  .regex(/[a-z]/, 'A senha deve conter ao menos uma letra minúscula.')
  .regex(/[0-9]/, 'A senha deve conter ao menos um número.')
  .regex(/[^A-Za-z0-9]/, 'A senha deve conter ao menos um símbolo.');

export const cadastroSchema = z.object({
  nome: z
    .string({ error: 'Informe o nome.' })
    .trim()
    .min(2, 'O nome deve ter no mínimo 2 caracteres.')
    .max(100, 'O nome deve ter no máximo 100 caracteres.'),
  email: emailSchema,
  senha: senhaSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string({ error: 'Informe a senha.' }).min(1, 'Informe a senha.'),
});
