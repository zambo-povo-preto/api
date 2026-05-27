import type { TranslatorFn } from "@/dictionaries";
import { DatabaseError } from "@/errors/DatabaseError";
import { Client } from "pg";
import * as z from "zod";

export const userSchema = (t: TranslatorFn) => {
  const userSchema = z.object({
    name: z
      .string()
      .min(5, t("error-min-length", { min: 5 }))
      .max(255, t("error-max-length", { max: 255 })),
    email: z.email(t("invalid-email")).min(1, t("required-field")),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message: t("invalid-password"),
        },
      )
      .min(1, t("required-field")),
  });

  return userSchema;
};

export const findByEmail = async (email: string, env: Bindings) => {
  const client = new Client({
    connectionString: env.DATABASE_URL,
  });
  await client.connect();

  console.log("Finding user by email", email);

  const res = await client.query(
    `
      SELECT id, name, email, password_hash FROM users WHERE email = $1
    `,
    [email],
  );
  await client.end();

  const user = res.rows[0];

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.password_hash,
  };
};

export const create = async (
  {
    id,
    name,
    email,
    passwordHash,
  }: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
  },
  env: Bindings,
) => {
  const client = new Client({
    connectionString: env.DATABASE_URL,
  });
  await client.connect();

  const res = await client.query(
    `
      INSERT INTO users (id, name, email, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, password_hash
    `,
    [id, name, email, passwordHash],
  );
  await client.end();

  const user = res.rows[0];

  if (!user) {
    throw new DatabaseError("Failed to create user", {
      values: { email, passwordHash },
    });
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.password_hash,
  };
};
