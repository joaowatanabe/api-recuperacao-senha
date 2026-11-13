export class AppError extends Error {
  constructor(mensagem, status = 400, detalhes) {
    super(mensagem);
    this.name = 'AppError';
    this.status = status;
    this.detalhes = detalhes;
  }
}
