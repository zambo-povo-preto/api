import type { User } from '@/entities/user';
import { hashPassword } from 'serverless-crypto-utils/password-hashing';
import { ulid } from 'serverless-crypto-utils/id-generation';
import { UsersDAF } from '@/services/database/users-daf';
import { ResourceAlreadyExistsError } from '@/errors/ResourceAlreadyExistsError';

interface RegisterUseCaseRequest {
  name: string;
  email: string;
  password: string;
}

interface RegisterUseCaseResponse {
  user: User;
}

export class RegisterUseCase {
  constructor(private usersDaf: UsersDAF) {}

  async execute({
    name,
    email,
    password,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const userWithSameEmail = await this.usersDaf.findByEmail(email);

    if (userWithSameEmail) {
      throw new ResourceAlreadyExistsError();
    }

    const passwordHash = await hashPassword(password);

    const user = await this.usersDaf.create({
      id: ulid(),
      name,
      email,
      passwordHash,
    });

    return { user };
  }
}