import { DatabaseError } from '@/errors/DatabaseError';
import { UsersDAF } from '@/services/database/users-daf';

export class D1UserDAF implements UsersDAF {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  async findByEmail(email: string) {
    const user = await this.d1
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

  async create({
    id,
    name,
    email,
    passwordHash,
  }: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
  }) {
    const user = await this.d1
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
}