import { loginController } from "@/controllers/auth/loginController";
import { refreshTokenController } from "@/controllers/auth/refreshTokenController";
import { Hono } from "hono";

const app = new Hono();

app.post("/login", loginController);
app.post("/refresh", refreshTokenController);

export { app as authRouter };
