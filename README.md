# Zambo API

API do projeto Zambo, responsavel pelo cadastro de usuarios, gerenciamento de categorias e publicacao de arquivos do portal de transparencia.

O projeto foi desenvolvido em TypeScript com [Hono](https://hono.dev/) e executa em [Cloudflare Workers](https://workers.cloudflare.com/). O armazenamento usa Cloudflare D1 para os dados relacionais e Cloudflare R2 para os arquivos enviados.

## Sumario

- [Tecnologias](#tecnologias)
- [Manual de instalacao](#manual-de-instalacao)
- [Scripts](#scripts)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Esquema do banco de dados](#esquema-do-banco-de-dados)
- [Rotas da API](#rotas-da-api)
- [Exemplos de codigo](#exemplos-de-codigo)
- [Licenca](#licenca)

## Tecnologias

- Node.js
- TypeScript
- Hono
- Cloudflare Workers
- Cloudflare D1
- Cloudflare R2
- Wrangler
- Zod
- Biome

## Manual de instalacao

### 1. Requisitos

Antes de iniciar, instale:

- Node.js 20 ou superior
- npm
- Conta na Cloudflare, caso deseje publicar a API

### 2. Acessar a pasta da API

```bash
cd api
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar variaveis locais

Crie ou atualize o arquivo `.dev.vars` dentro da pasta `api/`.

Exemplo:

```env
ENCRYPTION_SECRET=altere-este-valor-em-desenvolvimento
SIGNING_SECRET=altere-este-valor-em-desenvolvimento
DATABASE_URL=file:./local.db
ENABLE_PERFORMANCE_LOG=false
ENABLE_ERROR_LOG=true
BASE_API_URL=http://localhost:3333
ERROR_LOGGER_API_URL=http://localhost:3333
```

As demais variaveis publicas de desenvolvimento ficam em `wrangler.jsonc`, como `DOMAIN`, `PANEL_BASE_URL`, `SITE_BASE_URL` e `S3_API_URL`.

### 5. Aplicar as migrations no banco D1 local

Na pasta `api/`, execute:

```bash
npx wrangler d1 migrations apply zambo-db-dev --local
```

Esse comando cria as tabelas definidas em `migrations/0001_create_initial_schema.sql`.

### 6. Rodar a API localmente

```bash
npm run dev
```

Por padrao, a API fica disponivel em:

```text
http://localhost:3333
```

### 7. Testar a instalacao

```bash
curl http://localhost:3333/health
```

Resposta esperada:

```text
Hello World!
```

## Scripts

Os scripts estao definidos em `package.json`.

| Script | Comando | Descricao |
| --- | --- | --- |
| `dev` | `wrangler dev --local --port=3333` | Inicia a API localmente com Wrangler. |
| `deploy` | `wrangler deploy --minify` | Publica o Worker na Cloudflare. |
| `cf-typegen` | `wrangler types --env-interface CloudflareBindings` | Gera tipos das bindings da Cloudflare. |
| `lint` | `npx @biomejs/biome format --write` | Formata o codigo com Biome. |

## Estrutura do projeto

```text
api/
├── migrations/
│   ├── 0001_create_initial_schema.sql
│   └── 0001_create_users_table.sql
├── prisma/
│   └── schema.prisma
├── src/
│   ├── @types/
│   │   └── env.d.ts
│   ├── controllers/
│   │   ├── categories/
│   │   ├── transparency/
│   │   └── users/
│   ├── dictionaries/
│   ├── errors/
│   ├── helpers/
│   ├── middlewares/
│   ├── models/
│   ├── routers/
│   └── index.ts
├── client.http
├── package.json
├── tsconfig.json
└── wrangler.jsonc
```

Principais responsabilidades:

- `src/index.ts`: cria a aplicacao Hono e registra as rotas principais.
- `src/routers`: define os caminhos HTTP da API.
- `src/controllers`: recebe requisicoes, valida entradas e monta respostas.
- `src/models`: concentra consultas SQL e regras de persistencia.
- `src/middlewares`: contem middlewares, como autenticacao por token.
- `migrations`: guarda os scripts SQL de criacao do banco.
- `wrangler.jsonc`: configura Worker, D1, R2 e variaveis de ambiente.

## Esquema do banco de dados

O banco relacional usa Cloudflare D1. O script principal esta em `migrations/0001_create_initial_schema.sql`.

### Tabela `users`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | `TEXT` | Chave primaria |
| `name` | `TEXT` | Obrigatorio |
| `email` | `TEXT` | Obrigatorio e unico |
| `password_hash` | `TEXT` | Obrigatorio |
| `created_at` | `DATETIME` | Valor padrao `CURRENT_TIMESTAMP` |

Indices:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### Tabela `categories`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | `TEXT` | Chave primaria |
| `name` | `TEXT` | Obrigatorio |
| `description` | `TEXT` | Opcional |
| `created_at` | `DATETIME` | Valor padrao `CURRENT_TIMESTAMP` |

### Tabela `transparency_files`

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | `TEXT` | Chave primaria |
| `name` | `TEXT` | Obrigatorio |
| `description` | `TEXT` | Opcional |
| `object_key` | `TEXT` | Obrigatorio; chave do arquivo no R2 |
| `content_type` | `TEXT` | Obrigatorio |
| `size` | `INTEGER` | Obrigatorio |
| `category_id` | `TEXT` | Opcional; referencia `categories(id)` |
| `uploaded_by` | `TEXT` | Obrigatorio; usuario responsavel pelo envio |
| `published_at` | `DATETIME` | Opcional |
| `created_at` | `DATETIME` | Valor padrao `CURRENT_TIMESTAMP` |

Relacionamento:

```sql
FOREIGN KEY (category_id) REFERENCES categories(id)
```

Indice:

```sql
CREATE INDEX IF NOT EXISTS idx_transparency_files_category_id
ON transparency_files(category_id);
```

## Rotas da API

Base local:

```text
http://localhost:3333
```

### Saude da API

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `GET` | `/health` | Verifica se a API esta respondendo. |

### Usuarios

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `GET` | `/users` | Lista usuarios cadastrados. |
| `POST` | `/users` | Cadastra um novo usuario. |

Exemplo de cadastro:

```http
POST http://localhost:3333/users
Content-Type: application/json

{
  "name": "Maria Silva",
  "email": "maria@email.com",
  "password": "Senha@123"
}
```

### Categorias

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `GET` | `/categories` | Lista categorias. |
| `GET` | `/categories/:id` | Busca uma categoria pelo ID. |
| `POST` | `/categories` | Cria uma categoria. |
| `PUT` | `/categories/:id` | Atualiza uma categoria. |
| `DELETE` | `/categories/:id` | Remove uma categoria. |

Exemplo de criacao:

```http
POST http://localhost:3333/categories
Content-Type: application/json

{
  "name": "Contratos",
  "description": "Documentos de contratos e convenios"
}
```

### Transparencia

| Metodo | Rota | Descricao | Autenticacao |
| --- | --- | --- | --- |
| `GET` | `/transparency/files` | Lista arquivos publicados. | Nao |
| `POST` | `/transparency/files/upload` | Envia um arquivo para o R2 e salva os metadados no D1. | Sim |
| `GET` | `/transparency/files/:id/download` | Baixa um arquivo pelo ID. | Nao |

Exemplo de upload:

```http
POST http://localhost:3333/transparency/files/upload
Content-Type: application/json
Authorization: Bearer seu-token

{
  "fileName": "contrato.pdf",
  "description": "Contrato publicado no portal",
  "contentType": "application/pdf",
  "contentBase64": "JVBERi0xLjQK...",
  "categoryId": "id-da-categoria"
}
```

## Exemplos de codigo

### Registro das rotas principais

Arquivo: `src/index.ts`

```ts
import { Hono } from "hono";
import { userRouter } from "./routers/userRouter";
import { transparencyRouter } from "./routers/transparencyRouter";
import { categoryRouter } from "./routers/categoryRouter";

const app = new Hono();

app.get("/health", (c) => c.text("Hello World!"));

app.route("/users", userRouter);
app.route("/transparency", transparencyRouter);
app.route("/categories", categoryRouter);

export default app;
```

### Validacao de usuario com Zod

Arquivo: `src/models/userModel.ts`

```ts
export const userSchema = (t: TranslatorFn) => {
  const userSchema = z.object({
    name: z.string().min(5, t("error-min-length", { min: 5 })).max(255),
    email: z.email(t("invalid-email")).min(1, t("required-field")),
    password: z
      .string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/),
  });

  return userSchema;
};
```

### Middleware de autenticacao

Arquivo: `src/middlewares/authMiddleware.ts`

```ts
export const authMiddleware: MiddlewareFn = async (c, next) => {
  const authorization = c.req.header("Authorization");

  if (!authorization) {
    return c.json({ message: "Autenticacao necessaria" }, 401);
  }

  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : authorization;

  const result = await verifyAccessTokenSafe({
    encryptionSecret: c.env.ENCRYPTION_SECRET,
    signingSecret: c.env.SIGNING_SECRET,
    accessToken: token,
  });

  if (!result.success) {
    return c.json({ message: "Token invalido ou expirado" }, 401);
  }

  await next();
};
```

## Deploy

Para publicar a API na Cloudflare:

```bash
npm run deploy
```

Antes do deploy, confira se:

- A conta da Cloudflare esta autenticada no Wrangler.
- O banco D1 e o bucket R2 existem no ambiente desejado.
- As secrets `ENCRYPTION_SECRET` e `SIGNING_SECRET` foram cadastradas no ambiente de producao.
- O arquivo `wrangler.jsonc` aponta para os recursos corretos.

## Documentacao complementar

O arquivo `GUIDE.md` contem um guia mais detalhado sobre conceitos de API, HTTP, arquitetura e criacao de novas rotas.

## Licenca

Este projeto esta licenciado sob a GNU General Public License v3.0 ou posterior.

Consulte o arquivo `LICENSE` para mais detalhes.

```text
SPDX-License-Identifier: GPL-3.0-or-later
```
