import { getAppContext } from "@/helpers/getAppContext";
import { createAccessToken, verifyAccessTokenSafe } from "serverless-crypto-utils";
import * as z from "zod";

export const refreshTokenController: ControllerFn = async (c) => {
  const { t, inputs } = await getAppContext(c);

  const refreshSchema = z.object({
    refreshToken: z.string().min(1, t("required-field")),
  });

  const { refreshToken } = refreshSchema.parse(inputs);

  const result = await verifyAccessTokenSafe({
    encryptionSecret: c.env.ENCRYPTION_SECRET,
    signingSecret: c.env.SIGNING_SECRET,
    accessToken: refreshToken,
  });

  if (!result.success) {
    return c.json({ message: t("error-invalid-refresh-token") }, 401);
  }

  const payload = typeof result.data === "string"
    ? JSON.parse(result.data)
    : result.data;

  const accessToken = await createAccessToken({
    encryptionSecret: c.env.ENCRYPTION_SECRET,
    signingSecret: c.env.SIGNING_SECRET,
    payload: {
      user: payload.user,
    },
    expiresInSeconds: 60 * 60,
  });

  return c.json(
    {
      message: t("refresh-success"),
      accessToken,
    },
    200,
  );
};
