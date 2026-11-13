export function criarAuthController(authService) {
  return {
    async login(req, res) {
      res.json(await authService.login(req.body));
    },
  };
}
