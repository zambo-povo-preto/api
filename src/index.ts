import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRouter } from "./routers/authRouter";
import { categoryRouter } from "./routers/categoryRouter";
import { transparencyRouter } from "./routers/transparencyRouter";
import { userRouter } from "./routers/userRouter";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "Content-Disposition"],
    credentials: true,
  }),
);

app.get("/health", (c) => c.text("Hello World!"));

app.route("/auth", authRouter);
app.route("/users", userRouter);
app.route("/transparency", transparencyRouter);
app.route("/categories", categoryRouter);

export default app;
