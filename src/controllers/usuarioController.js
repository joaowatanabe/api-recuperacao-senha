export function criarUsuarioController(usuarioService) {
  return {
    async cadastrar(req, res) {
      const usuario = await usuarioService.cadastrar(req.body);
      res.status(201).json(usuario);
    },

    perfil(req, res) {
      res.json(usuarioService.buscarPerfil(req.usuarioId));
    },
  };
}
