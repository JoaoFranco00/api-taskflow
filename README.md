# TaskFlow API — Gerenciamento de tarefas com autenticação e autorização

API REST para cadastro de usuários, login com JWT e gerenciamento de tarefas. O projeto segue o diagrama: autenticação por Bearer Token, validação do JWT, verificação de permissões, rotas, regras de negócio, serviços/controladores e persistência em PostgreSQL.

## Tecnologias
- Node.js + TypeScript + Express
- PostgreSQL + Prisma ORM 7
- JWT para autenticação e bcrypt para hash de senhas

## Requisitos
Node.js e npm, PostgreSQL e uma base criada para a aplicação.

## Instalação
```bash
npm install
```
Copie `.env.example` para `.env`, ajuste `DATABASE_URL` e configure uma chave JWT aleatória com pelo menos 32 bytes. Não compartilhe o `.env`.

```bash
# Exemplo para gerar uma chave em ambientes com OpenSSL
openssl rand -base64 32

npx prisma generate
npx prisma migrate dev --name taskflow_init
npm run dev
```
A API inicia por padrão em `http://localhost:5000`. Verifique `/health`.

## Criar o primeiro administrador
Preencha no `.env` as variáveis `INITIAL_ADMIN_NOME`, `INITIAL_ADMIN_EMAIL` e `INITIAL_ADMIN_PASSWORD` (mínimo 8 caracteres), depois execute:
```bash
npm run admin:create
```
Depois, remova essas variáveis do `.env`. O administrador consegue consultar todas as tarefas e listar usuários. O cadastro público sempre cria contas `USER`; não é possível se tornar administrador enviando um papel no corpo da requisição.

## Autenticação
Faça login em `POST /auth/login`. Envie o token retornado nas rotas protegidas usando o cabeçalho:
```text
Authorization: Bearer SEU_TOKEN
```
Os tokens expiram em uma hora. Senhas são armazenadas em hash, nunca em texto puro.

## Endpoints
| Método | Rota | Acesso | Função |
|---|---|---|---|
| GET | `/health` | Público | Verifica se a API está ativa |
| POST | `/auth/register` | Público | Cadastra usuário comum |
| POST | `/auth/login` | Público | Valida credenciais e retorna JWT |
| GET | `/tasks` | Autenticado | USER vê suas tarefas; ADMIN vê todas |
| POST | `/tasks` | Autenticado | Cria tarefa para o usuário do token |
| PATCH | `/tasks/:id` | Autenticado | Atualiza tarefa própria; ADMIN pode atualizar qualquer tarefa |
| DELETE | `/tasks/:id` | Autenticado | Exclui tarefa própria; ADMIN pode excluir qualquer tarefa |
| GET | `/users` | Somente ADMIN | Lista usuários sem expor hashes de senha |

## Exemplos
### Cadastro
`POST /auth/register`
```json
{ "nome": "Ana Silva", "email": "ana@example.com", "senha": "senha-segura-123" }
```

### Login
`POST /auth/login`
```json
{ "email": "ana@example.com", "senha": "senha-segura-123" }
```

### Criar tarefa (com Bearer Token)
`POST /tasks`
```json
{ "titulo": "Entregar trabalho", "descricao": "Finalizar o projeto da faculdade" }
```
O `usuarioId` é obtido do token, não do corpo da requisição.

### Atualizar status
`PATCH /tasks/1`
```json
{ "status": "IN_PROGRESS" }
```
Status aceitos: `PENDING`, `IN_PROGRESS` e `DONE`.

## Autorização e respostas
- `401`: token ausente, inválido ou expirado; ou credenciais incorretas.
- `403`: usuário sem permissão ou tentando alterar tarefa de outra pessoa.
- `400`: dados inválidos.
- `404`: rota ou tarefa não encontrada.
- `409`: e-mail já cadastrado.
- `500`: erro interno.

## Relação com o diagrama
- **AuthRoutes / AuthController:** registro e login.
- **AuthMiddleware:** verifica Bearer Token/JWT e identifica o usuário.
- **PermissionGuard:** regras `USER` e `ADMIN` e validação de dono da tarefa.
- **TaskRoutes / TaskController:** operações GET, POST, PATCH e DELETE em tarefas.
- **Persistência:** modelos `Usuario` e `Tarefa` no PostgreSQL.
