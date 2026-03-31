export class DatabaseError extends Error {
  constructor() {
    super('An error occurred while accessing the database.');
  }
}