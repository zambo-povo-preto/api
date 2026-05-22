import { Hono } from "hono";
import { userRouter } from "./routers/userRouter";

const app = new Hono();

app.get('/health', (c) => c.text('Hello World!'));

app.route('/users', userRouter)

export default app;
