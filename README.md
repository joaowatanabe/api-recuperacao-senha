# API de Recuperação de Senha

API REST em Node.js com cadastro de usuários, login com JWT e **recuperação de senha por código enviado por e-mail**, construída com foco em segurança e em código fácil de ler e manter.

> **Atividade avaliativa — SENAC**
> **Curso:** Análise e Desenvolvimento de Sistemas (ADS), 3º semestre
> **Unidade curricular:** Desenvolvimento de Serviços e APIs
> **Professor:** Edécio Fernando Iepsen
> **Tema:** Segurança no Desenvolvimento de APIs
> **Aluno:** João Vicente Watanabe

### Enunciado

> "Implementar rotina para recuperação de senha para usuários que esqueceram a senha. O recurso deve ser desenvolvido a partir de 2 rotas/rotinas. A primeira é para o usuário solicitar a recuperação de senha. Neste processo validar o e-mail e gerar um código com 4 caracteres (criar um campo na tabela usuários para salvar o código) e enviá-lo para o e-mail do usuário. A segunda, deve receber o e-mail, o código (anteriormente enviado) e a nova senha. Validar os dados (e regras de composição da senha) e realizar a alteração da senha."

Como o enunciado foi atendido:

| Requisito | Onde está |
| --- | --- |
| Rota para solicitar a recuperação | `POST /recuperar-senha` |
| Validar o e-mail | `solicitarRecuperacaoSchema` (Zod) em `src/schemas/recuperacaoSenhaSchemas.js` |
| Código com 4 caracteres | `gerarCodigoRecuperacao()` em `src/utils/codigo.js` |
| Campo na tabela usuários para o código | coluna `codigo_recuperacao_hash` (+ expiração e tentativas) em `src/database/schema.js` |
| Enviar o código por e-mail | `src/services/emailService.js` (Nodemailer) |
| Rota que recebe e-mail, código e nova senha | `POST /redefinir-senha` |
| Validar dados e regras de composição da senha | `redefinirSenhaSchema` e `senhaSchema` em `src/schemas/` |
| Alterar a senha | `redefinir()` em `src/services/recuperacaoSenhaService.js` |

## Funcionalidades

- Cadastro de usuário com senha guardada em hash (bcrypt com salt).
- Login que devolve um token JWT.
- Rota protegida (`GET /perfil`) usando um middleware de autenticação JWT.
- Solicitação de recuperação de senha: gera um código de 4 caracteres, salva o hash dele no banco com validade de 15 minutos e envia por e-mail.
- Redefinição de senha com e-mail + código + nova senha, com validação das regras de composição.
- Código de uso único, que expira e é invalidado após 5 tentativas erradas.
- Limite de requisições por IP no login e nas rotas de recuperação.
- Testes automatizados de todos os fluxos principais.

## Stack

| Uso | Tecnologia |
| --- | --- |
| Servidor HTTP | Node.js (>= 20) + Express 5 |
| Banco de dados | SQLite via `better-sqlite3` (arquivo local, sem instalar nada) |
| Hash de senha e do código | `bcrypt` |
| Sessão | `jsonwebtoken` (JWT) |
| Validação | `zod` |
| E-mail | `nodemailer` (Ethereal em desenvolvimento, SMTP real por `.env`) |
| Limite de requisições | `express-rate-limit` |
| Testes | test runner nativo do Node (`node --test`) + `supertest` |

## Estrutura de pastas

O código segue camadas com responsabilidades separadas: **routes → controllers → services → repositories → banco**.

```
src/
├── server.js                  # ponto de entrada: lê a config, conecta o banco e sobe o servidor
├── app.js                     # monta o Express e liga as camadas (injeção de dependências)
├── config/
│   ├── env.js                 # variáveis de ambiente lidas e validadas em um só lugar
│   └── constants.js           # regras de negócio: tamanho/validade do código, tentativas, rate limit
├── routes/                    # define as URLs e a ordem dos middlewares de cada rota
├── controllers/               # traduz HTTP <-> serviço (lê req.body, escolhe status e resposta)
├── services/                  # regras de negócio (cadastro, login, recuperação, envio de e-mail)
├── repositories/              # único lugar com SQL; converte linhas do banco em objetos
├── database/                  # conexão SQLite e criação da tabela usuarios
├── schemas/                   # schemas Zod (o schema de senha é reaproveitado)
├── middlewares/               # autenticar (JWT), validar (Zod), limitarRequisicoes, tratarErros
├── emails/                    # template do e-mail com o código
├── errors/                    # AppError: erro de negócio com status HTTP
└── utils/                     # hash (bcrypt), token (JWT), geração do código
tests/                         # testes de integração das rotas com banco em memória
requests.http                  # chamadas prontas para a demonstração
```

Convenção de nomes: nomes de domínio em português (`usuario`, `codigoRecuperacao`, `redefinir`) e os nomes das camadas no padrão de mercado (`routes`, `controllers`, `services`, `repositories`). Cada camada é criada por uma função `criarX(dependências)`, o que permite que os testes troquem o banco por um em memória e o e-mail por um falso, sem mocks globais.

## Decisões de segurança

| Decisão | Por quê |
| --- | --- |
| **Código gerado com `crypto.randomInt`** | `Math.random` não é criptograficamente seguro e pode ser previsto. `randomInt` usa o gerador seguro do sistema operacional. |
| **Alfabeto sem caracteres ambíguos** (`A–Z` e `2–9`, sem `0/O/1/I`) | Evita erro de digitação. São 32 símbolos, ou seja, 32⁴ ≈ 1 milhão de combinações. O código digitado em minúsculas também é aceito. |
| **Código guardado com hash (bcrypt)**, nunca em texto puro | Se o banco vazar, quem tiver acesso não consegue usar os códigos pendentes diretamente. O campo pedido no enunciado é `codigo_recuperacao_hash`. |
| **Validade curta (15 min)** | Diminui a janela para alguém usar um código interceptado ou adivinhado. |
| **Uso único** | O código é apagado na mesma transação que troca a senha. Um novo pedido também substitui o código anterior. |
| **Máximo de 5 tentativas erradas** | Com 4 caracteres o espaço é pequeno; sem limite, um ataque de força bruta testaria todas as combinações. Na 5ª tentativa errada o código é apagado e é preciso pedir outro. |
| **Rate limit por IP** (10 requisições a cada 15 min em `/login`, `/recuperar-senha` e `/redefinir-senha`) | Segunda barreira contra força bruta e contra uso da API para disparar e-mails em massa. |
| **Resposta genérica na solicitação** | `POST /recuperar-senha` responde sempre a mesma mensagem, exista o e-mail ou não. Assim a rota não serve para descobrir quais e-mails estão cadastrados (enumeração de usuários). Para o tempo de resposta também não denunciar, o hash do código é calculado nos dois casos e o envio do e-mail não é aguardado. |
| **Erro único na redefinição** | E-mail inexistente, código errado, expirado ou já usado devolvem a mesma mensagem: `Código inválido ou expirado.` |
| **Comparação com tempo parecido** | `compararHash` executa o bcrypt mesmo quando o usuário não existe, para o login e a redefinição não ficarem mais rápidos com e-mails inexistentes. |
| **Regras de composição da senha** (Zod) | Mínimo de 8 caracteres, ao menos uma maiúscula, uma minúscula, um número e um símbolo. O **mesmo** `senhaSchema` é usado no cadastro e na redefinição. Máximo de 72 caracteres porque o bcrypt ignora o que passa disso. |
| **Senha sempre com bcrypt** (custo 10, salt automático) | Hash lento e com salt, resistente a tabelas pré-calculadas. A resposta da API nunca devolve o hash. |
| **Nada sensível nos logs** | Senhas nunca são registradas. O código só aparece no console no modo `MAIL_MODE=console`, que a aplicação só aceita com `NODE_ENV=development`. No modo Ethereal o console mostra apenas o link de pré-visualização do e-mail de teste. |
| **Segredos fora do código** | `JWT_SECRET` e dados de SMTP vêm do `.env`, que está no `.gitignore`. Em produção (`NODE_ENV=production`) a API não sobe sem `JWT_SECRET`. |

## Como instalar e rodar

Pré-requisito: Node.js 20 ou superior.

```bash
# 1. Clonar e entrar na pasta
git clone https://github.com/joaowatanabe/api-recuperacao-senha.git
cd api-recuperacao-senha

# 2. Instalar as dependências
npm install

# 3. Criar o arquivo de ambiente (os valores padrão já funcionam para a demonstração)
cp .env.example .env

# 4. Subir a API em http://localhost:3000
npm start

# 5. Rodar os testes
npm test
```

O banco SQLite é criado automaticamente no arquivo `dados.db` na primeira execução. Para começar do zero, pare o servidor e apague `dados.db`.

### Modos de envio de e-mail (`MAIL_MODE`)

| Modo | Comportamento |
| --- | --- |
| `ethereal` (padrão) | Cria uma caixa de teste no [Ethereal](https://ethereal.email) e imprime no console o **link de pré-visualização** de cada e-mail. Nenhum e-mail real é entregue. Precisa de internet. |
| `smtp` | Envia de verdade usando `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER` e `SMTP_PASS`. |
| `console` | Sem rede: imprime o código no console. Só é aceito com `NODE_ENV=development`. Útil se o Ethereal estiver fora do ar. |

## Endpoints

Todas as respostas são JSON. Erros seguem o formato `{ "erro": "mensagem", "detalhes": [...] }`, em que `detalhes` só aparece em erros de validação e lista `{ "campo", "mensagem" }`.

### `POST /usuarios` — cadastrar

```json
{ "nome": "João Vicente", "email": "joao@exemplo.com", "senha": "Senha@123" }
```

| Status | Quando |
| --- | --- |
| `201` | Criado. Corpo: `{ "id", "nome", "email", "criadoEm" }` |
| `400` | Dados inválidos ou senha fora das regras de composição |
| `409` | E-mail já cadastrado |

### `POST /login` — autenticar

```json
{ "email": "joao@exemplo.com", "senha": "Senha@123" }
```

| Status | Quando |
| --- | --- |
| `200` | `{ "token": "<JWT>" }` (válido por 1h, ajustável em `JWT_EXPIRES_IN`) |
| `400` | Dados inválidos |
| `401` | `E-mail ou senha inválidos.` (mesma mensagem para os dois casos) |
| `429` | Limite de requisições atingido |

### `GET /perfil` — rota protegida

Cabeçalho: `Authorization: Bearer <token>`

| Status | Quando |
| --- | --- |
| `200` | `{ "id", "nome", "email", "criadoEm" }` |
| `401` | Token ausente, inválido ou expirado |

### `POST /recuperar-senha` — solicitar recuperação (rota 1 do enunciado)

```json
{ "email": "joao@exemplo.com" }
```

| Status | Quando |
| --- | --- |
| `200` | Sempre a mesma resposta: `{ "mensagem": "Se o e-mail estiver cadastrado, você receberá um código de recuperação em instantes." }` |
| `400` | E-mail ausente ou em formato inválido |
| `429` | Limite de requisições atingido |

Se o e-mail existir, gera o código, salva o hash e a validade na tabela `usuarios` e envia o e-mail.

### `POST /redefinir-senha` — redefinir senha (rota 2 do enunciado)

```json
{ "email": "joao@exemplo.com", "codigo": "K7QM", "novaSenha": "NovaSenha#2026" }
```

| Status | Quando |
| --- | --- |
| `200` | `{ "mensagem": "Senha redefinida com sucesso." }` |
| `400` | Dados inválidos (e-mail, código sem 4 caracteres, nova senha fora das regras) com `detalhes` |
| `400` | `Código inválido ou expirado.` (código errado, expirado, já usado, invalidado por tentativas ou e-mail sem pedido) |
| `429` | Limite de requisições atingido |

## Roteiro de demonstração

Com o servidor rodando (`npm start`) e o arquivo `requests.http` aberto no VS Code (extensão REST Client) ou com os comandos `curl` abaixo:

1. **Cadastrar** o usuário (requisição 1). Resposta `201`.
2. **Logar** com a senha atual (requisição 2) e acessar o **perfil** com o token (requisição 3).
3. **Solicitar a recuperação** (requisição 4). Mostrar que um e-mail inexistente recebe a mesma resposta (requisição 5).
4. **Abrir o e-mail**: no terminal do servidor aparece `[e-mail] Pré-visualização: https://ethereal.email/message/...`. Abrir o link no navegador e copiar o código de 4 caracteres.
5. **Tentar uma senha fraca** (requisição 6, com o código) e mostrar a lista de regras não atendidas.
6. **Redefinir a senha** com o código e uma senha forte (requisição 7). Resposta `200`.
7. **Logar com a senha nova** (requisição 8). A senha antiga passa a dar `401`.
8. **Reutilizar o mesmo código** (requisição 9). Resposta `400 Código inválido ou expirado.`: o código é de uso único.

Os mesmos passos com `curl`:

```bash
curl -X POST localhost:3000/usuarios -H 'Content-Type: application/json' \
  -d '{"nome":"João Vicente","email":"joao@exemplo.com","senha":"Senha@123"}'

curl -X POST localhost:3000/recuperar-senha -H 'Content-Type: application/json' \
  -d '{"email":"joao@exemplo.com"}'

# copie o código do e-mail (link no console do servidor)
curl -X POST localhost:3000/redefinir-senha -H 'Content-Type: application/json' \
  -d '{"email":"joao@exemplo.com","codigo":"XXXX","novaSenha":"NovaSenha#2026"}'

curl -X POST localhost:3000/login -H 'Content-Type: application/json' \
  -d '{"email":"joao@exemplo.com","senha":"NovaSenha#2026"}'
```

> Dica: o rate limit permite 10 chamadas por rota a cada 15 minutos. Se precisar repetir a demonstração várias vezes, reinicie o servidor para zerar o contador.

## Testes

```bash
npm test
```

Os testes sobem a aplicação com SQLite em memória e um serviço de e-mail falso que guarda o código enviado. Cobrem: cadastro (sucesso, e-mail duplicado, senha fraca, senha guardada em hash), login e rota protegida, solicitação com e-mail existente e inexistente, código salvo em hash, redefinição com código válido, inválido e expirado, senha fraca, uso único do código, limite de tentativas, substituição do código por um novo pedido e rate limit.

## Autor

**João Vicente Watanabe** — ADS, SENAC.
