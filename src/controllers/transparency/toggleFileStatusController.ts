import { getAppContext } from "@/helpers/getAppContext";
import { toggleFilePublishedStatus } from "@/models/fileModel";

export const toggleFileStatusController: ControllerFn = async (c) => {
  await getAppContext(c);

  const id = c.req.param("id");
  if (!id) {
    return c.json({ message: "ID do arquivo não informado" }, 400);
  }

  const updatedFile = await toggleFilePublishedStatus(id, c.env);
  if (!updatedFile) {
    return c.json({ message: "Arquivo não encontrado" }, 404);
  }

  return c.json({ file: updatedFile }, 200);
};
