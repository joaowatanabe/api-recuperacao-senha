export const BCRYPT_SALT_ROUNDS = 10;

export const CODIGO_RECUPERACAO = {
  TAMANHO: 4,
  // Sem caracteres ambíguos (0/O, 1/I) para facilitar a digitação do código recebido.
  ALFABETO: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  VALIDADE_MINUTOS: 15,
  MAX_TENTATIVAS: 5,
};

export const LIMITE_REQUISICOES = {
  JANELA_MINUTOS: 15,
  MAXIMO_POR_IP: 10,
};
