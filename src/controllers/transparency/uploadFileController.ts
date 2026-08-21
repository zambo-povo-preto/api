import { getAppContext } from "@/helpers/getAppContext";
import { findCategoryById } from "@/models/categoryModel";
import { createFileMetadata } from "@/models/fileModel";

export const uploadFileController: ControllerFn = async (c) => {
  const { inputs } = await getAppContext(c);

  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Usuário não autenticado" }, 401);
  }

  const {
    fileName,
    description,
    contentType,
    contentBase64,
    categoryId,
    status,
    published,
  } = inputs;

  if (!fileName || !contentBase64 || !contentType || !categoryId) {
    return c.json(
      {
        message:
          "Os campos fileName, contentType, contentBase64 e categoryId são obrigatórios",
      },
      400,
    );
  }

  const category = await findCategoryById(categoryId, c.env);
  if (!category) {
    return c.json({ message: "Categoria inválida" }, 400);
  }

  const safeFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const objectKey = `${user.id}/${Date.now()}-${safeFileName}`;
  const body = Uint8Array.from(atob(contentBase64), (char) =>
    char.charCodeAt(0),
  );
  const size = body.length;

  await c.env.R2_BUCKET.put(objectKey, body, {
    httpMetadata: {
      contentType,
    },
  });

  const isPublished =
    published !== undefined
      ? Boolean(published)
      : status === "published" || status === undefined;

  const savedFile = await createFileMetadata(
    {
      name: fileName,
      description: description ?? null,
      objectKey,
      contentType,
      size,
      categoryId,
      uploadedBy: user.id,
      published: isPublished,
    },
    c.env,
  );

  return c.json({ file: savedFile }, 201);
};
