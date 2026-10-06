import type { AttachmentMetadata } from "@/models/attachmentModel";
import type { FileMetadata } from "@/models/fileModel";

/**
 * ============================================================================
 * CONTRATO PÚBLICO DO PORTAL DA TRANSPARÊNCIA (LGPD)
 * ============================================================================
 * Esta API é pública e deve retornar somente os dados necessários para a
 * finalidade de transparência. Não adicionar dados pessoais administrativos
 * a este contrato sem avaliação específica de conformidade com a LGPD.
 *
 * DADOS PESSOAIS NUNCA RETORNADOS NA API PÚBLICA:
 * - CPF completo ou sem máscara
 * - Endereço residencial
 * - Telefone ou e-mail pessoal
 * - Dados bancários (banco, agência, conta, chave PIX)
 * - Documentos de identidade, assinaturas ou certidões de terceiros
 * - Arquivos originais não sanitizados
 * ============================================================================
 */

export interface PublicAttachmentDTO {
  id: string;
  documentId: string | null;
  name: string;
  description: string | null;
  contentType: string;
  size: number;
  attachmentType: "invoice" | "document";
  createdAt: string;
  issuerName: string | null;
  invoiceNumber: string | null;
  amount: number | null;
  issueDate: string | null;
  expenseType: string | null;
  cnpj?: string | null;
  hasPublicFile: boolean;
  downloadUrl?: string | null;
}

export interface PublicFileDTO {
  id: string;
  name: string;
  description: string | null;
  contentType: string;
  size: number;
  categoryId: string | null;
  publishedAt: string | null;
  createdAt: string;
  hasPublicFile: boolean;
  downloadUrl?: string | null;
}

/**
 * Sanitiza o documento do favorecido para exibição pública:
 * - Se for CNPJ válido (14 dígitos), formata e permite a publicação para identificação da PJ.
 * - Se for CPF (11 dígitos ou menos) ou documento de pessoa física, NUNCA expõe.
 */
export function sanitizeIssuerDocForPublic(issuerDoc?: string | null): {
  isCnpj: boolean;
  cnpj: string | null;
} {
  if (!issuerDoc) return { isCnpj: false, cnpj: null };
  const cleanDoc = issuerDoc.replace(/\D/g, "");

  // Se possui exatamente 14 dígitos numéricos, é CNPJ de Pessoa Jurídica
  if (cleanDoc.length === 14) {
    const formattedCnpj = cleanDoc.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5",
    );
    return { isCnpj: true, cnpj: formattedCnpj };
  }

  // Para qualquer outro documento (como CPF de 11 dígitos), omitir categoricamente
  return { isCnpj: false, cnpj: null };
}

/**
 * Transforma o registro de anexo no DTO público, expurgando CPF e chaves de arquivos internos.
 */
export function toPublicAttachmentDTO(
  att: AttachmentMetadata,
  baseUrl: string = "",
): PublicAttachmentDTO {
  const { isCnpj, cnpj } = sanitizeIssuerDocForPublic(att.issuerDoc);
  const hasPublic = Boolean(att.publicObjectKey);

  return {
    id: att.id,
    documentId: att.documentId,
    name: att.name,
    description: att.description,
    contentType: att.contentType,
    size: att.size,
    attachmentType: att.attachmentType || (att.invoiceNumber || att.amount ? "invoice" : "document"),
    createdAt: att.createdAt,
    issuerName: att.issuerName,
    invoiceNumber: att.invoiceNumber,
    amount: att.amount,
    issueDate: att.issueDate,
    expenseType: att.expenseType,
    cnpj: isCnpj ? cnpj : undefined,
    hasPublicFile: hasPublic,
    // Só disponibiliza URL de download pública se o arquivo público tiver sido definido
    downloadUrl: hasPublic
      ? `${baseUrl}/transparency/files/attachments/${att.id}/download`
      : null,
  };
}

/**
 * Transforma o registro de relatório no DTO público.
 */
export function toPublicFileDTO(
  file: FileMetadata,
  baseUrl: string = "",
): PublicFileDTO {
  return {
    id: file.id,
    name: file.name,
    description: file.description,
    contentType: file.contentType,
    size: file.size,
    categoryId: file.categoryId,
    publishedAt: file.publishedAt,
    createdAt: file.createdAt,
    hasPublicFile: Boolean(file.publicObjectKey || file.objectKey),
    downloadUrl: `${baseUrl}/transparency/files/${file.id}/download`,
  };
}
