import { registerController } from "@/controllers/users/registerController";
import { listUsersController } from "@/controllers/users/listUsersController";
import { Hono } from "hono";

const app = new Hono();

app.get("/", listUsersController);
app.post("/", registerController);

export { app as userRouter };
