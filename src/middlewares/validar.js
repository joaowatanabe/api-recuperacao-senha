import { AppError } from '../errors/AppError.js';

function formatarProblemas(erroZod) {
  return erroZod.issues.map(({ path, message }) => ({ campo: path.join('.'), mensagem: message }));
}

export function validar(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body ?? {});
    if (!resultado.success) {
      throw new AppError('Dados inválidos.', 400, formatarProblemas(resultado.error));
    }
    req.body = resultado.data;
    next();
  };
}
