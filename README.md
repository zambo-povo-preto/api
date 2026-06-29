# Guia da API - Portal de Transparência

Bem-vindo! Este documento vai te ajudar a entender como a API funciona e como criar novas rotas. Vamos começar do zero! 🚀

## Índice

1. [O que é uma API?](#o-que-é-uma-api)
2. [Como funcionam as Requisições HTTP](#como-funcionam-as-requisições-http)
3. [Métodos HTTP Principais](#métodos-http-principais)
4. [Arquitetura do Projeto (Padrão MVC)](#arquitetura-do-projeto-padrão-mvc)
5. [Estrutura de Pastas](#estrutura-de-pastas)
6. [Autenticação com Tokens JWT](#autenticação-com-tokens-jwt)
7. [Como Criar uma Nova Rota](#como-criar-uma-nova-rota)
8. [Validação de Dados](#validação-de-dados)
9. [Exemplo Prático 1: Login com Tokens](#exemplo-prático-1-criando-uma-rota-de-login-com-tokens)
10. [Exemplo Prático 2: Refresh Token](#exemplo-prático-2-criando-uma-rota-de-refresh-token)
11. [Middlewares - Protegendo Rotas](#middlewares---protegendo-rotas)
12. [Como Testar suas Rotas](#como-testar-suas-rotas)
13. [Próximos Passos](#próximos-passos)
14. [Dúvidas Frequentes](#dúvidas-frequentes)

---

## O que é uma API?

**API** significa "Application Programming Interface" (Interface de Programação de Aplicações). Pense nela como um **garçom de um restaurante**:

- O cliente (frontend/aplicação) faz um pedido
- O garçom (API) recebe o pedido e o passa para a cozinha
- A cozinha (banco de dados) prepara o pedido
- O garçom traz a resposta de volta ao cliente

A diferença é que ao invés de palavras, usamos **requisições HTTP** para comunicação.

### Por que usar uma API?

A API é a **porta de entrada** da aplicação. Ela:
- Recebe dados do cliente (usuário, formulário, etc)
- Valida esses dados
- Processa a lógica de negócio
- Retorna uma resposta ao cliente

---

## Como Funcionam as Requisições HTTP

Toda vez que você acessa um site ou clica em um botão em um app, uma **requisição HTTP** é enviada para o servidor.

Uma requisição HTTP é composta por:

```
┌─────────────────────────────────────────┐
│         REQUISIÇÃO HTTP                 │
├─────────────────────────────────────────┤
│ Método: GET                             │
│ URL: https://api.com/users              │
│ Headers: { Authorization: "token..." }  │
│ Body: { nome: "João", email: "..." }   │
└─────────────────────────────────────────┘
                   ↓
         ┌──────────────────┐
         │   SERVIDOR       │
         │   (Nossa API)    │
         └──────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│          RESPOSTA HTTP                  │
├─────────────────────────────────────────┤
│ Status: 200 (OK) ou 201 (Criado)       │
│ Headers: { Content-Type: "json" }       │
│ Body: { id: 1, nome: "João", ... }     │
└─────────────────────────────────────────┘
```

---

## Métodos HTTP Principais

Existem vários métodos HTTP, mas os principais são:

### 1. **GET** - Obter/Buscar dados
- **Quando usar**: Quando você quer **ler/buscar informações** do servidor
- **Exemplo**: Listar todos os usuários, buscar um arquivo específico
- **Resposta esperada**: Lista ou dados solicitados

```
GET /users → Retorna lista de usuários
GET /files?id=123 → Retorna detalhes do arquivo com ID 123
```

### 2. **POST** - Criar novo recurso
- **Quando usar**: Quando você quer **criar algo novo** (novo usuário, novo arquivo, etc)
- **Exemplo**: Registrar um novo usuário, fazer upload de arquivo
- **Resposta esperada**: Status 201 (Criado) + dados do novo recurso

```
POST /users → Cria um novo usuário
POST /auth/login → Cria uma nova sessão de login
POST /files/upload → Faz upload de um novo arquivo
```

### 3. **PUT** - Atualizar um recurso completo
- **Quando usar**: Quando você quer **substituir completamente** um recurso existente
- **Exemplo**: Atualizar todas as informações de um usuário
- **Resposta esperada**: Status 200 (OK) + dados atualizados

```
PUT /users/123 → Substitui TODOS os dados do usuário com ID 123
```

### 4. **PATCH** - Atualizar parcialmente
- **Quando usar**: Quando você quer **atualizar apenas alguns campos** de um recurso
- **Exemplo**: Mudar apenas o nome do usuário, mantendo email igual
- **Resposta esperada**: Status 200 (OK) + dados atualizados

```
PATCH /users/123 → Atualiza APENAS os campos enviados do usuário 123
```

### 5. **DELETE** - Deletar recurso
- **Quando usar**: Quando você quer **remover** um recurso
- **Exemplo**: Deletar um usuário, remover um arquivo
- **Resposta esperada**: Status 204 (Sem conteúdo) ou 200 (OK)

```
DELETE /users/123 → Deleta o usuário com ID 123
DELETE /files/456 → Deleta o arquivo com ID 456
```

### Tabela de Referência Rápida

| Método | Ação | Status de Sucesso |
|--------|------|-------------------|
| GET | Ler dados | 200 OK |
| POST | Criar novo | 201 Created |
| PUT | Atualizar tudo | 200 OK |
| PATCH | Atualizar parte | 200 OK |
| DELETE | Remover | 204 No Content |

---

## Arquitetura do Projeto (Padrão MVC)

Este projeto usa o **padrão MVC**, que você já conhece! Ele organiza o código em 3 camadas:

```
┌──────────────────────────────────────────────┐
│                 CLIENTE                      │
│           (Aplicação Frontend)               │
└──────────────────────────────────────────────┘
                      ↓
         ┌────────────────────────────┐
         │   REQUISIÇÃO HTTP          │
         │ (GET, POST, PUT, DELETE)   │
         └────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│                  ROUTER                      │
│         (Define as rotas da API)             │
│  Exemplo: POST /users → registerController  │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│              CONTROLLER                      │
│       (Recebe e processa a requisição)       │
│  - Valida os dados                           │
│  - Chama a lógica de negócio                 │
│  - Retorna a resposta                        │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│                  MODEL                       │
│        (Interage com banco de dados)         │
│  - Valida schema                             │
│  - Busca dados do banco                      │
│  - Salva dados no banco                      │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│             BANCO DE DADOS                   │
│         (PostgreSQL neste projeto)           │
└──────────────────────────────────────────────┘
```

### Explicação de cada camada:

**ROUTER** → Define onde a rota começa  
**CONTROLLER** → Orquestra o fluxo (recebe dados, valida, processa)  
**MODEL** → Realiza operações com banco de dados  

---

## Estrutura de Pastas

```
api/
├── src/
│   ├── index.ts                    ← Arquivo principal (setup das rotas)
│   ├── @types/
│   │   └── env.d.ts               ← Tipos TypeScript globais
│   ├── controllers/
│   │   └── users/
│   │       └── registerController.ts  ← Lógica de cada rota
│   ├── models/
│   │   └── userModel.ts            ← Validação + acesso ao banco
│   ├── routers/
│   │   └── userRouter.ts           ← Define as rotas
│   ├── entities/
│   │   └── user.ts                 ← Tipos/Interfaces do usuário
│   ├── dictionaries/
│   │   ├── index.ts                ← Gerencia traduções
│   │   └── pt-BR.json              ← Mensagens em português
│   ├── errors/
│   │   └── DatabaseError.ts        ← Classes de erro customizadas
│   └── helpers/
│       └── getAppContext.ts        ← Funções auxiliares
│
├── prisma/
│   └── schema.prisma               ← Definição do banco de dados
│
├── migrations/
│   └── 0001_create_users_table.sql ← Histórico de mudanças do banco
│
├── cert/                           ← Certificados SSL (desenvolvimento local)
├── package.json                    ← Dependências do projeto
└── wrangler.jsonc                  ← Configuração do Cloudflare Workers
```

---

## Como Criar uma Nova Rota

Vamos criar uma rota **passo a passo**. Usaremos como exemplo uma rota que **lista todos os usuários**.

### Passo 1: Entender o fluxo

```
GET /users
    ↓
[userRouter] recebe a requisição
    ↓
[Controller] valida e processa
    ↓
[Model] busca do banco de dados
    ↓
Retorna lista de usuários
```

### Passo 2: Criar o Controller

Crie o arquivo: `src/controllers/users/listUsersController.ts`

```typescript
export const listUsersController: ControllerFn = async (c) => {
  const { t } = await getAppContext(c);
  
  // Chamar o model para buscar usuários
  const users = await findAll(c.env);
  
  // Retornar resposta
  return c.json({ users }, 200);
};
```

**O que acontece aqui:**
- `c` é o contexto da requisição (contém dados da requisição)
- `getAppContext(c)` extrai dados úteis (traduções, inputs, usuário autenticado, etc)
- `findAll()` é uma função do model que busca todos os usuários
- `c.json()` retorna uma resposta em JSON com status HTTP

### Passo 3: Criar ou atualizar o Model

Adicionar a função `findAll` em `src/models/userModel.ts`:

```typescript
export const findAll = async (env: Bindings) => {
  const client = new Client({
    connectionString: env.DATABASE_URL,
  })
  await client.connect()
  
  const res = await client.query('SELECT id, name, email FROM users')
  await client.end()
  
  return res.rows.map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
  }));
};
```

**O que acontece aqui:**
- Conecta ao banco de dados
- Executa uma query SQL
- Transforma os resultados em objetos JavaScript
- Retorna a lista

### Passo 4: Registrar a rota

Atualize `src/routers/userRouter.ts`:

```typescript
import { registerController } from "@/controllers/users/registerController";
import { listUsersController } from "@/controllers/users/listUsersController";
import { Hono } from "hono";

const app = new Hono()

app.get("/", listUsersController)        // ← Nova rota GET
app.post("/", registerController)        // ← Rota POST existente

export { app as userRouter }
```

### Passo 5: Pronto! 🎉

Agora sua API tem uma nova rota:

```
GET /users → Lista todos os usuários
```

---

## Autenticação com Tokens JWT

Antes de falar sobre validação, é importante entender como funcionam os tokens de autenticação.

### O que é Autenticação?

Autenticação é quando o usuário "prova" quem é. Funciona assim:

1. **Login**: Usuário envia email + senha
2. **Servidor valida**: Email existe? Senha correta?
3. **Servidor gera token**: "Você é João, aqui está seu comprovante"
4. **Cliente armazena token**: Guarda em memória/storage
5. **Cliente envia token**: Em requisições futuras, envia o token
6. **Servidor valida token**: Verifica se o token é válido e quem é

### O que é JWT (JSON Web Token)?

JWT é um padrão de token que contém 3 partes:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikpvw6NvIiwiaWF0IjoxNTE2MjM5MDIyfQ....

┌─────────────────────────────────────────┐
│            HEADER (Cabeçalho)            │
│  { alg: "HS256", typ: "JWT" }           │
└─────────────────────────────────────────┘
                    .
┌─────────────────────────────────────────┐
│             PAYLOAD (Dados)              │
│  { id: "123", email: "joao@..." }       │
└─────────────────────────────────────────┘
                    .
┌─────────────────────────────────────────┐
│            SIGNATURE (Assinatura)        │
│  Prova que o token veio do servidor     │
└─────────────────────────────────────────┘
```

### Token de Acesso vs Token de Refresh

Usamos **dois tipos de tokens**:

#### 1. Access Token
- **Tempo de vida curto**: 15 minutos
- **Uso**: Autenticar cada requisição
- **Risco**: Se vazado, attacker tem acesso por pouco tempo

#### 2. Refresh Token
- **Tempo de vida longo**: 7 dias
- **Uso**: Gerar novos Access Tokens
- **Risco**: Se vazado, attacker tem acesso por muito tempo
- **Segurança**: Geralmente guardado em HTTP-only cookie

### Fluxo de Autenticação Completo

```
┌──────────────────────────────────────────┐
│   Cliente faz login                      │
│   POST /auth/login { email, password }   │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│  Servidor valida email e senha           │
│  Cria 2 tokens:                          │
│  - accessToken (válido 15 min)          │
│  - refreshToken (válido 7 dias)         │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│  Retorna tokens ao cliente               │
│  {                                       │
│    user: {...},                          │
│    accessToken: "eyJh...",              │
│    refreshToken: "eyJa..."              │
│  }                                       │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│  Cliente faz requisição normal            │
│  GET /users                              │
│  Header: { Authorization: "accessToken" }│
└──────────────────────────────────────────┘
                    ↓
         ┌─────────────────────┐
         │ Token ainda válido? │
         └─────────────────────┘
            ↓              ↓
          SIM            NÃO
            ↓              ↓
        ┌─────┐      ┌──────────────┐
        │OK!  │      │ Token expirou!│
        └─────┘      │ Cliente envia │
                     │ refreshToken  │
                     │ POST /refresh │
                     └──────────────┘
                            ↓
                    ┌─────────────────┐
                    │ Servidor valida │
                    │ refreshToken    │
                    │ Cria novo       │
                    │ accessToken     │
                    └─────────────────┘
                            ↓
                    ┌─────────────────┐
                    │ Retorna novo    │
                    │ accessToken     │
                    └─────────────────┘
```

### Usando a Biblioteca serverless-crypto-utils

A biblioteca `serverless-crypto-utils` oferece funções para trabalhar com tokens:

```typescript
import { createAccessToken } from 'serverless-crypto-utils';
```

**Funções principais:**

```typescript
// Gerar um novo token
const token = await createAccessToken({
  encryptionSecret: c.env.ENCRYPTION_SECRET, // variável de ambiente
  signingSecret: c.env.SIGNING_SECRET, // variável de ambiente
  payload: { // Payload (dados do token)
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  },
  expiresInSeconds: 3600, // expira em 1 hora (3600 segundos)
});

// Gerar um refresh token
const refreshToken = await createAccessToken({
  encryptionSecret: c.env.ENCRYPTION_SECRET, // variável de ambiente
  signingSecret: c.env.SIGNING_SECRET, // variável de ambiente
  payload: { // Payload (dados do token)
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  },
  expiresInSeconds: 60 * 60 * 24 * 7, // expira em 7 dias
});
```

---

## Validação de Dados

Toda entrada de dados **DEVE** ser validada. Usamos **Zod** para isso.

### Por que validar?

Imagine alguém enviando um email inválido como `"email-sem-arroba.com"`. Sem validação, isso seria salvo no banco! A validação garante que:
- Os dados têm o formato correto
- Campos obrigatórios foram preenchidos
- Valores estão dentro dos limites

### Exemplo de validação (já no projeto)

```typescript
export const userSchema = (t: TranslatorFn) => {
  const userSchema = z.object({
    name: z
      .string()
      .min(5, "Nome deve ter pelo menos 5 caracteres")
      .max(255, "Nome não pode ultrapassar 255 caracteres"),
    email: z
      .email("Email inválido")
      .min(1, "Email é obrigatório"),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Senha deve ter 8+ caracteres, maiúscula, minúscula, número e caractere especial"
      )
  });

  return userSchema;
};
```

### Como usar a validação no Controller

```typescript
export const registerController: ControllerFn = async (c) => {
  const { t, inputs } = await getAppContext(c);
  
  // Validar usando o schema
  const validationSchema = userSchema(t);
  const { name, email, password } = validationSchema.parse(inputs);
  
  // Se chegou aqui, os dados estão válidos!
  // Prosseguir com a lógica...
};
```

### O que Zod faz se a validação falhar?

Se os dados forem inválidos, Zod vai lançar um erro. O frontend vai receber uma resposta de erro com detalhes:

```json
{
  "error": "Email inválido"
}
```

---

## Exemplo Prático 1: Criando uma Rota de Login com Tokens

Vamos colocar tudo junto criando uma rota POST `/auth/login`.

### O que essa rota precisa fazer:

1. Receber `email` e `senha`
2. Validar entrada
3. Buscar usuário no banco
4. Verificar se senha está correta
5. Gerar tokens (accessToken + refreshToken)
6. Retornar tokens ao cliente (ou erro)

### Código do Controller

```typescript
// src/controllers/auth/loginController.ts
import { getAppContext } from '@/helpers/getAppContext';
import { findByEmail } from '@/models/userModel';
import { verifyPassword, createAccessToken } from 'serverless-crypto-utils';
import * as z from 'zod';

export const loginController: ControllerFn = async (c) => {
  const { t, inputs } = await getAppContext(c);
  
  // 1. Validar entrada
  const loginSchema = z.object({
    email: z.email(t('invalid-email')),
    password: z.string().min(1, t('required-field')),
  });
  
  const { email, password } = loginSchema.parse(inputs);
  
  // 2. Buscar usuário
  const user = await findByEmail(email, c.env);
  
  if (!user) {
    return c.json({ 
      message: t('error-user-not-found') 
    }, 401);
  }
  
  // 3. Validar senha
  const passwordIsValid = await verifyPassword(password, user.passwordHash);
  
  if (!passwordIsValid) {
    return c.json({ 
      message: t('error-invalid-password') 
    }, 401);
  }
  
  // 4. Gerar tokens
  const token = await createAccessToken({
    encryptionSecret: c.env.ENCRYPTION_SECRET, // variável de ambiente
    signingSecret: c.env.SIGNING_SECRET, // variável de ambiente
    payload: { // Payload (dados do token)
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    expiresInSeconds: 3600, // expira em 1 hora (3600 segundos)
  });

  const refreshToken = await createAccessToken({
    encryptionSecret: c.env.ENCRYPTION_SECRET, // variável de ambiente
    signingSecret: c.env.SIGNING_SECRET, // variável de ambiente
    payload: { // Payload (dados do token)
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    expiresInSeconds: 60 * 60 * 24 * 7, // expira em 7 dias
  });
  
  // 5. Retornar sucesso com tokens
  return c.json({ 
    message: t('login-success'),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    accessToken,    // Token para usar nas próximas requisições
    refreshToken    // Token para renovar o accessToken quando expirar
  }, 200);
};
```

### Exemplo Prático 2: Criando uma Rota de Refresh Token

Quando o `accessToken` expirar, o cliente envia o `refreshToken` para gerar um novo `accessToken`.

```typescript
// src/controllers/auth/refreshTokenController.ts
import { getAppContext } from '@/helpers/getAppContext';
import { findByEmail } from '@/models/userModel';
import { verifyAccessTokenSafe, createAccessToken } from 'serverless-crypto-utils';
import * as z from 'zod';

export const refreshTokenController: ControllerFn = async (c) => {
  const { t, inputs } = await getAppContext(c);
  
  // 1. Validar entrada (receber o refreshToken)
  const refreshSchema = z.object({
    refreshToken: z.string().min(1, t('required-field')),
  });
  
  const { refreshToken } = refreshSchema.parse(inputs);
  
  // 2. Verificar se o refreshToken é válido
  const result = await verifyAccessTokenSafe({
    encryptionSecret: process.env.TOKEN_ENCRYPTION_SECRET,
    signingSecret: process.env.TOKEN_SIGNING_SECRET,
    accessToken: refreshToken, // O refreshToken é um accessToken com vida longa
  });

  if (!refreshResult.success) {
    return c.json(
      {
        error: t('invalid-refresh-token-or-expired'),
      },
      401,
    );
  }

  // 3. Gerar novo accessToken
  const data = JSON.parse(refreshResult.data) as { user: User };
  const user = data.user;

  const newAccessToken = await createAccessToken({
    encryptionSecret: c.env.ENCRYPTION_SECRET,
    signingSecret: c.env.SIGNING_SECRET,
    payload: {
      user,
    },
    expiresInSeconds: 3600, // 1 hour
  });
  
  // 4. Retornar novo token
  return c.json({ 
    message: 'Token renovado',
    accessToken: newAccessToken
  }, 200);
};
```

### Registrar as rotas

```typescript
// src/routers/authRouter.ts
import { loginController } from "@/controllers/auth/loginController";
import { refreshTokenController } from "@/controllers/auth/refreshTokenController";
import { Hono } from "hono";

const app = new Hono()

app.post("/login", loginController)          // Login do usuário
app.post("/refresh", refreshTokenController) // Renovar token

export { app as authRouter }
```

### Conectar ao index principal

```typescript
// src/index.ts
import { Hono } from "hono";
import { userRouter } from "./routers/userRouter";
import { authRouter } from "./routers/authRouter";

const app = new Hono();

app.get('/health', (c) => c.text('Hello World!'));
app.route('/users', userRouter)
app.route('/auth', authRouter)

export default app;
```

Pronto! Agora você tem:
```
POST /auth/login   → Login de usuário (retorna accessToken + refreshToken)
POST /auth/refresh → Renovar accessToken quando expirar
```

### Fluxo de Uso no Frontend

```javascript
// 1. Usuário faz login
const loginResponse = await fetch('http://localhost:3333/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'joao@example.com', password: 'Senha@123' })
});

const { accessToken, refreshToken } = await loginResponse.json();

// 2. Guardar tokens (localStorage ou sessionStorage)
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 3. Fazer requisição com token
const usersResponse = await fetch('http://localhost:3333/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// 4. Se accessToken expirar (erro 401), renovar com refreshToken
if (usersResponse.status === 401) {
  const refreshResponse = await fetch('http://localhost:3333/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  });
  
  const { accessToken: newAccessToken } = await refreshResponse.json();
  localStorage.setItem('accessToken', newAccessToken);
  
  // Repetir a requisição com novo token
  const retryResponse = await fetch('http://localhost:3333/users', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${newAccessToken}` }
  });
}
```

---

## Middlewares - Protegendo Rotas

Nem todas as rotas são públicas. Algumas exigem autenticação (usuário logado). Usamos **middlewares** para isso.

Um middleware é uma função que **intercepta a requisição** e pode:
- Validar se o usuário está autenticado
- Validar permissões
- Adicionar dados à requisição
- Rejeitar a requisição

### Exemplo: Middleware de Autenticação

```typescript
// src/middlewares/authMiddleware.ts
import { verifyAccessTokenSafe } from 'serverless-crypto-utils';

export const authMiddleware: MiddlewareFn = async (c, next) => {
  // 1. Obter o token do header Authorization
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return c.json({ message: 'Token não fornecido' }, 401);
  }
  
  // 2. Extrair o token (formato: "Bearer <token>")
  const token = authHeader.replace('Bearer ', '');
  
  // 3. Validar o token
  const result = await verifyAccessTokenSafe({
    encryptionSecret: process.env.TOKEN_ENCRYPTION_SECRET,
    signingSecret: process.env.TOKEN_SIGNING_SECRET,
    accessToken: refreshToken, // O refreshToken é um accessToken com vida longa
  });
  
  if (!result.success) {
    return c.json({ message: 'Token inválido ou expirado' }, 401);
  }
  
  // 4. Adicionar usuário ao contexto (para usar no controller)
  const data = JSON.parse(refreshResult.data) as { user: User };
  c.set('user', data.user);
  
  // 5. Chamar o próximo middleware/controller
  await next();
};
```

### Como Usar o Middleware

```typescript
// src/routers/transparencyRouter.ts
import { uploadFileController } from "@/controllers/transparency/uploadFileController";
import { authMiddleware } from "@/middlewares/authMiddleware";
import { Hono } from "hono";

const app = new Hono()

// Rota pública (sem middleware)
app.get("/files", listFilesController)

// Rota protegida (com middleware)
app.post(
  "/files/upload",
  authMiddleware,  // Executa primeiro para validar token
  uploadFileController  // Executa depois se middleware passou
)

export { app as transparencyRouter }
```

### No Controller, Acessar o Usuário Autenticado

```typescript
// src/controllers/transparency/uploadFileController.ts
export const uploadFileController: ControllerFn = async (c) => {
  const { t, inputs } = await getAppContext(c);
  
  // O middleware já validou e setou o usuário!
  const user = c.get('user');  // { id: "user-123", email: "joao@..." }
  
  // Agora você sabe quem está fazendo upload
  console.log(`Usuário ${user.id} está fazendo upload`);
  
  // Continuar com a lógica...
  return c.json({ message: 'Upload realizado' }, 200);
};
```

---

## Futuras Funcionalidades

O projeto vai expandir com estas rotas:

### 1. **Autenticação**
```
POST /auth/login ✅
- Entrada: email, password
- Saída: user, accessToken, refreshToken
- Descrição: Login de usuário

POST /auth/refresh ✅
- Entrada: refreshToken
- Saída: accessToken
- Descrição: Renovar token de acesso
```

### 2. **Portal de Transparência - Arquivo de Upload**
```
POST /transparency/files/upload
- Autenticação: SIM (usuário logado) ✅
- Entrada: arquivo + metadados
- Saída: confirmação de upload
```

### 3. **Portal de Transparência - Listar Arquivos**
```
GET /transparency/files
- Autenticação: NÃO (público) ✅
- Parâmetros: filters, pagination
- Saída: lista de arquivos
```

### 4. **Portal de Transparência - Download de Arquivo**
```
GET /transparency/files/:id/download
- Autenticação: NÃO (público) ✅
- Saída: arquivo para download
```

### 5. **Usuário - Atualizar Perfil**
```
PATCH /users/:id
- Autenticação: SIM
- Entrada: dados atualizados
- Saída: usuário atualizado
```

### 6. **Usuário - Deletar Conta**
```
DELETE /users/:id
- Autenticação: SIM
- Saída: confirmação de deleção
```

---

## Como Testar suas Rotas

Use **Postman** ou **Insomnia** (ferramentas para testar APIs):

### Testando a Rota de Registro

1. Abra Postman/Insomnia
2. Crie uma nova requisição POST
3. URL: `http://localhost:3333/users`
4. Body (JSON):
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "Senha@123"
}
```
5. Clique em "Send"

### Testando a Rota de Login

1. Crie uma nova requisição POST
2. URL: `http://localhost:3333/auth/login`
3. Body (JSON):
```json
{
  "email": "joao@example.com",
  "password": "Senha@123"
}
```
4. Clique em "Send"
5. Copie o `accessToken` da resposta

### Testando uma Rota Protegida

1. Crie uma nova requisição GET
2. URL: `http://localhost:3333/users` (ou qualquer rota protegida)
3. Headers:
   - Key: `Authorization`
   - Value: `Bearer <coloque-o-accessToken-aqui>`
4. Clique em "Send"

### Testando o Refresh de Token

1. Crie uma nova requisição POST
2. URL: `http://localhost:3333/auth/refresh`
3. Body (JSON):
```json
{
  "refreshToken": "<coloque-o-refreshToken-da-resposta-de-login>"
}
```
4. Clique em "Send"
5. Você vai receber um novo `accessToken`

---

## Código HTTP Mais Comuns

| Status | Significado |
|--------|------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Rota/recurso não existe |
| 409 | Conflict - Email já existe |
| 500 | Server Error - Erro no servidor |

---

## Dúvidas Frequentes

**P: Qual a diferença entre POST e PUT?**
R: POST é para **criar algo novo**. PUT é para **substituir completamente** algo existente.

**P: Preciso usar PATCH ou PUT?**
R: Use PATCH se o cliente só enviar campos que mudam. Use PUT se enviar todos os campos.

**P: O que é um token de autenticação?**
R: É uma "chave" que o servidor dá ao cliente após login. O cliente envia essa chave em futuros requests para provar que está autenticado.

**P: Por que validar se o banco de dados também valida?**
R: A validação na API é mais rápida (não precisa ir ao banco) e oferece melhor experiência ao usuário (feedback imediato).

**P: Qual a diferença entre accessToken e refreshToken?**
R: 
- **accessToken**: Curta vida (15 min). Usado em todas as requisições autenticadas.
- **refreshToken**: Longa vida (7 dias). Usado apenas para gerar novo accessToken quando expirar.

**P: Por que não usar um único token com vida longa?**
R: Se um token vazar, o attacker terá acesso por muito tempo. Com 2 tokens, se o accessToken vazar, o attacker tem 15 minutos. O refreshToken fica guardado de forma mais segura.

**P: Como armazeno os tokens no frontend?**
R: 
- **accessToken**: sessionStorage ou memória (vaza rápido em 15 min)
- **refreshToken**: localStorage ou HTTP-only cookie (mais seguro)

---

## Atualizações Recentes

- ✅ Rota POST /auth/login implementada com validação de credenciais, geração de accessToken e refreshToken.
- ✅ Rota POST /auth/refresh implementada para renovação do accessToken com base no refreshToken.
- ✅ Router de autenticação conectado no ponto de entrada da API.
- ✅ Rotas do portal de transparência implementadas.

## Próximos Passos

1. ✅ Entender o padrão MVC
2. ✅ Entender métodos HTTP
3. ✅ Entender autenticação com tokens
4. ✅ Criar primeira rota (GET)
5. ✅ Criar rota de login com tokens
6. ✅ Criar rota de refresh token
7. 📝 Testar com Postman/Insomnia
8. ✅ Criar middleware de autenticação
9. ✅ Criar rotas do portal de transparência
10. ✅ Implementar uploads de arquivo

---

## Recursos Úteis

- [Documentação Hono (framework)](https://hono.dev)
- [Documentação Zod (validação)](https://zod.dev)
- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [HTTP Methods - MDN](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Methods)

---

## Requisitos do Projeto

- [ ] Rota POST `/users` - Criar novo usuário ✅ (Já existe)
- [ ] Rota GET `/users` - Listar usuários ✅ (Já existe)
- [x] Rota POST `/auth/login` - Login de usuário com tokens
- [x] Rota POST `/auth/refresh` - Renovar accessToken
- [x] Rota POST `/transparency/files/upload` - Upload de arquivo (autenticado)
- [x] Rota GET `/transparency/files` - Listar arquivos (público)
- [x] Rota GET `/transparency/files/:id/download` - Download de arquivo
- [ ] Rota PATCH `/users/:id` - Atualizar perfil do usuário
- [ ] Rota DELETE `/users/:id` - Deletar usuário
- [x] Middleware de autenticação - Validar accessToken nas rotas protegidas

---

**Bora começar!** 🚀 Qualquer dúvida, pergunte!