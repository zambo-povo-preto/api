import { verifyAccessTokenSafe } from "serverless-crypto-utils";

export const authMiddleware: MiddlewareFn = async (c, next) => {
  const authorization = c.req.header("Authorization");

  if (!authorization) {
    return c.json({ message: "Autenticação necessária" }, 401);
  }

  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : authorization;

  const result = await verifyAccessTokenSafe({
    encryptionSecret: c.env.ENCRYPTION_SECRET,
    signingSecret: c.env.SIGNING_SECRET,
    accessToken: token,
  });

  if (!result.success) {
    return c.json({ message: "Token inválido ou expirado" }, 401);
  }

  const payload =
    typeof result.data === "string" ? JSON.parse(result.data) : result.data;

  if (!payload?.user || typeof payload.user !== "object") {
    return c.json({ message: "Token inválido ou expirado" }, 401);
  }

  const user = {
    id: String(payload.user.id),
    email: String(payload.user.email),
  };

  c.set("user", user);

  await next();
};
