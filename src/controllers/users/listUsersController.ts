import { getAppContext } from "@/helpers/getAppContext";
import { findAllUsers } from "@/models/userModel";

export const listUsersController: ControllerFn = async (c) => {
  await getAppContext(c);

  const users = await findAllUsers(c.env);

  return c.json({ users }, 200);
};
