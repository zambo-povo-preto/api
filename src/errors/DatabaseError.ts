export class DatabaseError extends Error {
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "DatabaseError";
    this.details = details;
  }
}