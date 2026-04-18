import type { TranslatorFn } from '@/dictionaries';
import { DatabaseError } from '@/errors/DatabaseError';
import * as z from 'zod';

export const userSchema = (t: TranslatorFn) => {
  const userSchema = z.object({
    name: z
      .string()
      .min(5, t('error-min-length', { min: 5 }))
      .max(255, t('error-max-length', { max: 255 })),
    email: z.email(t('invalid-email')).min(1, t('required-field')),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message: t('invalid-password'),
        },
      )
      .min(1, t('required-field'))
  });

  return userSchema;
};

export const findByEmail = async (email: string, env: Bindings) => {
    const user = await env.DB
      .prepare(
        'SELECT id, name, email, password_hash FROM users WHERE email = ?',
      )
      .bind(email)
      .first<{
        id: string;
        name: string;
        email: string;
        password_hash: string;
      }>();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.password_hash,
    };
  }

export const create = async ({
    id,
    name,
    email,
    passwordHash,
  }: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
  }, env: Bindings) =>{
    const user = await env.DB
      .prepare(`
        INSERT INTO users (id, name, email, password_hash) 
        VALUES (?, ?, ?, ?) 
        RETURNING id, name, email, password_hash`,
      )
      .bind(id, name, email, passwordHash)
      .first<{
        id: string;
        name: string;
        email: string;
        password_hash: string;
      }>();

    if (!user) {
      throw new DatabaseError('Failed to create user', {
        values: { email, passwordHash },
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.password_hash,
    };
  }