import { getAppContext } from "@/helpers/getAppContext";
import { findAllFiles } from "@/models/fileModel";

export const listFilesController: ControllerFn = async (c) => {
  await getAppContext(c);
  const files = await findAllFiles(c.env);
  return c.json({ files }, 200);
};