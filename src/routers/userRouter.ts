import { registerController } from "@/controllers/users/registerController";
import { Hono } from "hono";

const app = new Hono()

app.post("/", registerController)

export { app as userRouter }