import { getAppContext } from "@/helpers/getAppContext";
import { findByEmail } from "@/models/userModel";
import { createAccessToken, verifyPassword } from "serverless-crypto-utils";
import * as z from "zod";

export const loginController: ControllerFn = async (c) => {
  const { t, inputs } = await getAppContext(c);

  const loginSchema = z.object({
    email: z.email(t("invalid-email")).min(1, t("required-field")),
    password: z.string().min(1, t("required-field")),
  });

  const { email, password } = loginSchema.parse(inputs);

  const user = await findByEmail(email, c.env);

  if (!user) {
    return c.json({ message: t("error-invalid-credentials") }, 401);
  }

  const isPasswordValid = await verifyPassword(
    password,
    String(user.passwordHash),
  );

  if (!isPasswordValid) {
    return c.json({ message: t("error-invalid-credentials") }, 401);
  }

  const accessToken = await createAccessToken({
    encryptionSecret: c.env.ENCRYPTION_SECRET,
    signingSecret: c.env.SIGNING_SECRET,
    payload: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
    expiresInSeconds: 60 * 60,
  });

  const refreshToken = await createAccessToken({
    encryptionSecret: c.env.ENCRYPTION_SECRET,
    signingSecret: c.env.SIGNING_SECRET,
    payload: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
    expiresInSeconds: 60 * 60 * 24 * 7,
  });

  return c.json(
    {
      message: t("login-success"),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    },
    200,
  );
};
