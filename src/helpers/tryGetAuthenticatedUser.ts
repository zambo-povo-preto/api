import { verifyAccessTokenSafe } from "serverless-crypto-utils";

export async function tryGetAuthenticatedUser(c: DomainContext) {
  const existingUser = c.get("user");
  if (existingUser) return existingUser;

  const authorization = c.req.header("Authorization");
  if (!authorization) return null;

  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : authorization;

  try {
    const result = await verifyAccessTokenSafe({
      encryptionSecret: c.env.ENCRYPTION_SECRET,
      signingSecret: c.env.SIGNING_SECRET,
      accessToken: token,
    });

    if (!result.success) return null;

    const payload =
      typeof result.data === "string" ? JSON.parse(result.data) : result.data;

    if (!payload?.user || typeof payload.user !== "object") return null;

    const user = {
      id: String(payload.user.id),
      email: String(payload.user.email),
    };
    c.set("user", user);
    return user;
  } catch {
    return null;
  }
}
