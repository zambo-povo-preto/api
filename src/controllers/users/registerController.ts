import { getAppContext } from '@/helpers/getAppContext';
import { create, findByEmail, userSchema } from '@/models/userModel';
import { hashPassword, ulid } from 'serverless-crypto-utils';

export const registerController: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);

  const validationSchema = userSchema(t);

  const { name, email, password } = validationSchema.parse(inputs);

  const userWithSameEmail = await findByEmail(email, c.env);

  if (userWithSameEmail) {
    return c.json({ message: t('error-email-already-exists') }, 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await create({
    id: ulid(),
    name,
    email,
    passwordHash,
  }, c.env);

  return c.json({ user }, 201);
};