import type { User } from '@/entities/user';

export interface UsersDAF {
  findByEmail(email: string): Promise<User | null>;
  create(user: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<User>;
}