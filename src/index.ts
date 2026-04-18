import { Hono } from "hono";
import { userRouter } from "./routers/userRouter";

const app = new Hono();

app.route('/users', userRouter)

export default app;
