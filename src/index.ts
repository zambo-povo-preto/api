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
    origin: (origin, c) => {
      const allowedOrigins = [c.env.SITE_BASE_URL];
      const isAllowed = allowedOrigins.includes(origin ?? "");
      return isAllowed ? origin : null;
    },
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
