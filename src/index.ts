import { Hono } from "hono";
import { userRouter } from "./routers/userRouter";
import { transparencyRouter } from "./routers/transparencyRouter";
import { categoryRouter } from "./routers/categoryRouter";

const app = new Hono();

app.get("/health", (c) => c.text("Hello World!"));

app.route("/users", userRouter);
app.route("/transparency", transparencyRouter);
app.route("/categories", categoryRouter);

export default app;
