import { getAppContext } from '@/http/utils/get-app-context';
import { useUserSchema } from '@/schemas/use-user-schema';
import { ResourceAlreadyExistsError } from '@/errors/ResourceAlreadyExistsError';
import { makeRegisterUseCase } from '@/use-cases/factories/users/make-register-use-case';

export const register: ControllerFn = async (c) => {
  const { t, inputs } = getAppContext(c);

  const validationSchema = useUserSchema(t);

  const { name, email, password } = validationSchema.parse(inputs);

  try {
    const registerUseCase = makeRegisterUseCase(c);

    const { user } = await registerUseCase.execute({
      name,
      email,
      password,
    });

    return c.json({ user }, 201);
  } catch (err) {
    if (err instanceof ResourceAlreadyExistsError) {
      return c.json({ message: t('error-email-already-exists') }, 409);
    }

    throw err;
  }
};