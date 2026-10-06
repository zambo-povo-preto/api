# Manual Técnico: LGPD e Arquitetura do Portal da Transparência (Zambô)

> **Regra de Ouro:** Esta API é pública e deve retornar somente os dados necessários para a finalidade de transparência. Não adicionar dados pessoais administrativos a este contrato sem avaliação específica de conformidade com a LGPD.

---

## 1. Princípio Fundamental de Minimização (LGPD)

O sistema do Ponto de Cultura Zambô opera sob uma estrita separação entre:
1. **Dados Administrativos (Uso Interno e Contábil):** Armazenados no banco de dados e acessíveis exclusivamente por administradores autenticados via token JWT.
2. **Dados Públicos (Portal da Transparência):** Acessíveis a qualquer cidadão, expostos por contratos/DTOs específicos e filtrados na camada de backend.

A proteção não é meramente visual: **dados protegidos sequer são enviados na resposta JSON da API pública**.

---

## 2. Matriz de Classificação de Dados

| Campo / Dado | API Administrativa | API Pública (Portal) | Justificativa / Fundamento Legal |
| :--- | :---: | :---: | :--- |
| **Nome do Favorecido** | ✅ Sim | ✅ Sim | Transparência ativa na destinação dos recursos |
| **CPF (Pessoa Física)** | ✅ Sim | ❌ **NUNCA** | Dado pessoal protegido. Minimização de dados |
| **CNPJ (Pessoa Jurídica)** | ✅ Sim | ✅ Sim (Formatado) | Identificação legítima da empresa prestadora |
| **Nº da Nota / Recibo** | ✅ Sim | ✅ Sim | Identificação da despesa contábil |
| **Valor e Data** | ✅ Sim | ✅ Sim | Evidência orçamentária essencial |
| **Categoria da Despesa** | ✅ Sim | ✅ Sim | Classificação contábil do plano de trabalho |
| **Dados Bancários / PIX** | ✅ Sim | ❌ **NUNCA** | Sigilo bancário e proteção contra fraudes |
| **Endereço Residencial** | ✅ Sim | ❌ **NUNCA** | Dado pessoal sensível sem relevância pública |
| **Telefone / E-mail Pessoal** | ✅ Sim | ❌ **NUNCA** | Proteção contra assédio e vazamentos |
| **Arquivo Original Bruto** | ✅ Sim | ❌ **NUNCA** (Sem sanitização) | Pode conter assinaturas, dados bancários e RG |
| **Arquivo Público Higienizado** | ✅ Sim | ✅ Sim | Versão revisada/tarjada apta para consulta |

---

## 3. Gestão de Arquivos: Original vs. Público

### 3.1 Arquivo Original (`object_key`)
- Enviado pelo administrador durante o cadastro interno.
- Armazenado no Cloudflare R2 em diretórios administrativos (`attachments/...`).
- Apenas usuários com `Authorization: Bearer <token>` conseguem realizar o download original.

### 3.2 Arquivo Público Sanitizado (`public_object_key`)
- Versão do documento revisada pelo administrador, onde dados pessoais desnecessários foram omitidos ou tarjados.
- Armazenado no R2 em diretórios públicos (`public/...`).
- Se um comprovante **não possuir** um `public_object_key`, o endpoint público de download retorna `404 Not Found` com a mensagem `"O arquivo público deste comprovante ainda não foi disponibilizado para consulta externa."`.
- O arquivo original **nunca é entregue a requisições públicas não autenticadas**.

---

## 4. Arquitetura Funcional das 3 Entidades

```
                       RELATÓRIO
               (Publicação agregadora)
                 │                   │
                 ▼                   ▼
           NOTAS FISCAIS        DOCUMENTOS
        (Recursos fiscais)   (Arquivos técnicos)
```

1. **Relatórios (`transparency_files`):**
   - Publicações agregadoras por exercício financeiro.
   - Contém título, ano, categoria, status de publicação e arquivo principal.
   - Página dedicada de gerenciamento em `/admin/documento/[id]`.
2. **Notas Fiscais (`document_attachments` com `attachment_type = 'invoice'`):**
   - Entidade autônoma gerenciada em `/admin/notas-fiscais`.
   - Pode existir avulsa (`document_id = NULL`) ou vinculada a um relatório.
   - Pode ser vinculada ou desvinculada a qualquer momento sem duplicar arquivos.
3. **Documentos Complementares (`document_attachments` com `attachment_type = 'document'`):**
   - Arquivos independentes (PDF, planilhas XLSX, termos de colaboração).
   - Gerenciados em `/admin/documentos`.

---

## 5. Boas Práticas ao Criar Novas Funcionalidades

1. **Nunca reutilizar modelos do banco diretamente em endpoints públicos:**
   Sempre serialize através de `toPublicAttachmentDTO` ou `toPublicFileDTO`.
2. **Nunca incluir busca por CPF em endpoints públicos:**
   Filtros como `?cpf=`, `?document=`, ou buscas por dígitos numéricos de CPF são proibidos na camada pública.
3. **Ao adicionar novos campos no banco:**
   Avalie se o campo contém dados pessoais. Se sim, adicione apenas aos DTOs administrativos protegidos por `authMiddleware`.
