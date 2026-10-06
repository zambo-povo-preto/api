import { getAppContext } from "@/helpers/getAppContext";
import { toPublicAttachmentDTO } from "@/helpers/transparencySerializers";
import { tryGetAuthenticatedUser } from "@/helpers/tryGetAuthenticatedUser";
import {
  findAllAttachments,
  findAttachmentsByDocumentId,
} from "@/models/attachmentModel";

/**
 * Controller de listagem de anexos / notas fiscais / comprovantes.
 *
 * REQUISITO LGPD & ARQUITETURA:
 * - Acesso Administrativo (com token válido):
 *   Retorna dados completos para controle financeiro (incluindo CPF/CNPJ de gestão e arquivos originais).
 * - Acesso Público (Cidadão):
 *   Retorna estritamente o PublicAttachmentDTO sanitizado:
 *   NUNCA expõe CPF completo ou sem máscara, dados bancários, nem URLs de arquivos não higienizados.
 *   Busca pública NÃO permite e NÃO consulta por CPF.
 */
export const listAttachmentsController: ControllerFn = async (c) => {
  await getAppContext(c);
  const user = await tryGetAuthenticatedUser(c);

  const documentId = c.req.param("id") || c.req.query("documentId");
  const searchQuery = c.req.query("q") || c.req.query("search");
  const attachmentType = c.req.query("type") as "invoice" | "document" | undefined;
  const unlinkedOnly = c.req.query("unlinked") === "true";

  // Se o parâmetro "id" foi passado na rota /files/:id/attachments, busca especificamente desse documento
  const routeParamDocId = c.req.param("id");

  if (user) {
    // ── FLUXO ADMINISTRATIVO ──────────────────────────────────────────────
    if (routeParamDocId) {
      const attachments = await findAttachmentsByDocumentId(routeParamDocId, c.env, {
        attachmentType,
      });
      return c.json({ attachments }, 200);
    }

    const attachments = await findAllAttachments(c.env, {
      documentId: documentId || undefined,
      searchQuery,
      allowDocSearch: true, // Permitido exclusivamente na gestão administrativa
      attachmentType,
      unlinkedOnly,
      onlyPublished: false,
    });
    return c.json({ attachments }, 200);
  }

  // ── FLUXO PÚBLICO (CIDADÃO / LGPD COMPLIANT) ───────────────────────────
  // Remove qualquer tentativa de buscar diretamente por números que simulem CPF
  let safeSearchQuery = searchQuery;
  if (safeSearchQuery) {
    const rawDigits = safeSearchQuery.replace(/\D/g, "");
    // Se a busca tiver 11 dígitos exatos de CPF ou o formato de CPF, não busca por documento
    if (rawDigits.length === 11) {
      safeSearchQuery = "";
    }
  }

  const attachments = await findAllAttachments(c.env, {
    documentId: routeParamDocId || documentId || undefined,
    searchQuery: safeSearchQuery,
    allowDocSearch: false, // MANDATÓRIO: A busca pública NUNCA consulta o CPF
    attachmentType,
    onlyPublished: true, // Apenas de publicações ativas no portal
  });

  const baseUrl = new URL(c.req.url).origin;
  const publicAttachments = attachments.map((att) =>
    toPublicAttachmentDTO(att, baseUrl),
  );

  return c.json({ attachments: publicAttachments }, 200);
};
