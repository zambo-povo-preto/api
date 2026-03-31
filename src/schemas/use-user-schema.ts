import type { TranslatorFn } from '@/dictionaries';
import * as z from 'zod';

export const useUserSchema = (t: TranslatorFn) => {
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