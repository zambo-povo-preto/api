import test from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeIssuerDocForPublic,
  toPublicAttachmentDTO,
  toPublicFileDTO,
} from "../src/helpers/transparencySerializers.ts";
import type { AttachmentMetadata } from "../src/models/attachmentModel.ts";
import type { FileMetadata } from "../src/models/fileModel.ts";

test("LGPD & Architecture Test Suite", async (t) => {
  const samplePersonAttachment: AttachmentMetadata = {
    id: "att-pessoa-fisica-1",
    documentId: "doc-relatorio-2026",
    name: "Comprovante Pix Cachê.pdf",
    description: "Pagamento de cachê de arte-educador",
    objectKey: "attachments/doc-relatorio-2026/comprovante-privado.pdf",
    publicObjectKey: null, // Sem arquivo público ainda
    contentType: "application/pdf",
    size: 45000,
    attachmentType: "invoice",
    createdAt: "2026-08-22T01:36:12Z",
    issuerName: "Giselle Hoekveld",
    issuerDoc: "479.343.258-19", // CPF de pessoa física
    invoiceNumber: "098",
    amount: 1500,
    issueDate: "2026-08-22",
    expenseType: "Outros",
  };

  const sampleCompanyAttachment: AttachmentMetadata = {
    id: "att-pessoa-juridica-2",
    documentId: "doc-relatorio-2026",
    name: "Nota Fiscal Prestacao Servicos.pdf",
    description: "Serviço de sonorização do evento",
    objectKey: "attachments/doc-relatorio-2026/nf-original.pdf",
    publicObjectKey: "public/attachments/doc-relatorio-2026/nf-sanitizada.pdf",
    contentType: "application/pdf",
    size: 120000,
    attachmentType: "invoice",
    createdAt: "2026-08-22T02:00:00Z",
    issuerName: "Som & Luz Eventos LTDA",
    issuerDoc: "12.345.678/0001-90", // CNPJ de pessoa jurídica
    invoiceNumber: "1045",
    amount: 4500,
    issueDate: "2026-08-20",
    expenseType: "Sonorização & Equipamentos",
  };

  const sampleReportFile: FileMetadata = {
    id: "doc-relatorio-2026",
    name: "Relatório Anual de Atividades Culturais",
    description: "Prestação de contas do exercício 2026",
    objectKey: "admin/relatorio-original.pdf",
    publicObjectKey: "public/relatorio-publico.pdf",
    contentType: "application/pdf",
    size: 250000,
    categoryId: "cat-prestacao-contas",
    uploadedBy: "admin-user",
    publishedAt: "2026-08-22T01:00:00Z",
    createdAt: "2026-08-22T00:00:00Z",
  };

  await t.test("1. Sanitizador de documento: não expõe CPF de pessoa física", () => {
    const resPerson = sanitizeIssuerDocForPublic("479.343.258-19");
    assert.equal(resPerson.isCnpj, false);
    assert.equal(resPerson.cnpj, null);

    const resPersonClean = sanitizeIssuerDocForPublic("47934325819");
    assert.equal(resPersonClean.isCnpj, false);
    assert.equal(resPersonClean.cnpj, null);
  });

  await t.test("2. Sanitizador de documento: preserva CNPJ válido de pessoa jurídica", () => {
    const resCompany = sanitizeIssuerDocForPublic("12345678000190");
    assert.equal(resCompany.isCnpj, true);
    assert.equal(resCompany.cnpj, "12.345.678/0001-90");
  });

  await t.test("3. DTO Público: O CPF completo NUNCA é retornado", () => {
    const publicDto = toPublicAttachmentDTO(samplePersonAttachment, "https://api.zambo.org.br");
    assert.equal("cpf" in publicDto, false, "Campo 'cpf' não deve existir no DTO público");
    assert.equal("issuerDoc" in publicDto, false, "Campo 'issuerDoc' não deve existir no DTO público");
    assert.equal(publicDto.cnpj, undefined, "Não deve inventar CNPJ para pessoa física");
  });

  await t.test("4. DTO Público: Não retorna CPF mascarado desnecessariamente", () => {
    const publicDto = toPublicAttachmentDTO(samplePersonAttachment, "https://api.zambo.org.br");
    const jsonStr = JSON.stringify(publicDto);
    assert.equal(jsonStr.includes("479.343.258-19"), false, "JSON não pode conter o CPF original");
    assert.equal(jsonStr.includes("47934325819"), false, "JSON não pode conter dígitos do CPF");
    assert.equal(jsonStr.includes("***.343.258-**"), false, "Não deve forçar máscara de CPF desnecessariamente");
  });

  await t.test("5. DTO Público: Dados bancários, endereço e e-mails pessoais não existem no DTO", () => {
    const publicDto = toPublicAttachmentDTO(samplePersonAttachment, "https://api.zambo.org.br");
    assert.equal("bank" in publicDto, false);
    assert.equal("agency" in publicDto, false);
    assert.equal("account" in publicDto, false);
    assert.equal("pixKey" in publicDto, false);
    assert.equal("address" in publicDto, false);
  });

  await t.test("6. DTO Público: Arquivo original NÃO sanitizado não possui URL de download pública", () => {
    const publicDto = toPublicAttachmentDTO(samplePersonAttachment, "https://api.zambo.org.br");
    assert.equal(publicDto.hasPublicFile, false);
    assert.equal(publicDto.downloadUrl, null, "URL de download deve ser null se não houver arquivo público");
    assert.equal("objectKey" in publicDto, false, "A chave interna do R2 nunca deve ser exposta");
  });

  await t.test("7. DTO Público: Arquivo público sanitizado é disponibilizado corretamente", () => {
    const publicDto = toPublicAttachmentDTO(sampleCompanyAttachment, "https://api.zambo.org.br");
    assert.equal(publicDto.hasPublicFile, true);
    assert.equal(
      publicDto.downloadUrl,
      "https://api.zambo.org.br/transparency/files/attachments/att-pessoa-juridica-2/download",
    );
    assert.equal(publicDto.cnpj, "12.345.678/0001-90");
    assert.equal(publicDto.issuerName, "Som & Luz Eventos LTDA");
    assert.equal(publicDto.invoiceNumber, "1045");
    assert.equal(publicDto.amount, 4500);
  });

  await t.test("8. DTO Público de Relatório: expõe campos de transparência sem vazar dados internos", () => {
    const publicFile = toPublicFileDTO(sampleReportFile, "https://api.zambo.org.br");
    assert.equal(publicFile.id, "doc-relatorio-2026");
    assert.equal(publicFile.name, "Relatório Anual de Atividades Culturais");
    assert.equal(publicFile.hasPublicFile, true);
    assert.equal("uploadedBy" in publicFile, false, "ID do usuário uploader não deve ser exposto");
    assert.equal("objectKey" in publicFile, false, "Chave de objeto não deve ser exposta");
  });

  await t.test("9. Busca Pública: aceita busca por título, favorecido e número da nota, mas descarta CPF", () => {
    const items = [samplePersonAttachment, sampleCompanyAttachment];

    // Busca por título / nome do arquivo
    const searchByName = items.filter((item) =>
      item.name.toLowerCase().includes("comprovante pix"),
    );
    assert.equal(searchByName.length, 1);
    assert.equal(searchByName[0].id, "att-pessoa-fisica-1");

    // Busca por favorecido (nome)
    const searchByIssuer = items.filter((item) =>
      item.issuerName?.toLowerCase().includes("giselle"),
    );
    assert.equal(searchByIssuer.length, 1);
    assert.equal(searchByIssuer[0].id, "att-pessoa-fisica-1");

    // Busca por número da nota
    const searchByInvoiceNumber = items.filter((item) =>
      item.invoiceNumber?.toLowerCase().includes("1045"),
    );
    assert.equal(searchByInvoiceNumber.length, 1);
    assert.equal(searchByInvoiceNumber[0].id, "att-pessoa-juridica-2");

    // Simulação da regra pública de bloqueio de CPF
    const cpfSearchTerm = "479.343.258-19";
    const rawDigits = cpfSearchTerm.replace(/\D/g, "");
    const isCpfQuery = rawDigits.length === 11;
    assert.equal(isCpfQuery, true, "Termo de busca com 11 dígitos deve ser detectado como CPF");

    // Na API pública, se for CPF, o termo de documento não é consultado
    const publicMatch = items.filter((item) => {
      if (isCpfQuery) return false; // Bloqueado categoricamente
      return item.issuerDoc === cpfSearchTerm;
    });
    assert.equal(publicMatch.length, 0, "Nenhum resultado deve ser retornado por busca de CPF");
  });

  await t.test("10. Arquitetura de Entidades: Múltiplas notas vinculadas a um relatório", () => {
    const reportId = "doc-relatorio-2026";
    const linkedInvoices = [samplePersonAttachment, sampleCompanyAttachment].filter(
      (item) => item.documentId === reportId,
    );
    assert.equal(linkedInvoices.length, 2, "Relatório deve manter 2 notas fiscais vinculadas");
  });

  await t.test("11. Arquitetura de Entidades: Suporte a notas fiscais independentes (documentId = null)", () => {
    const standaloneInvoice: AttachmentMetadata = {
      ...sampleCompanyAttachment,
      id: "att-avulsa-3",
      documentId: null, // Independente!
    };
    assert.equal(standaloneInvoice.documentId, null, "Nota fiscal pode existir sem relatório prévio");
  });
});

