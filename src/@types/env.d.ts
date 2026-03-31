import type { Context, TypedResponse, Next } from 'hono';
import type { TranslatorFn } from '@/dictionaries';
import type { IDAF } from '@/services/database';

declare global {
  type Env = { Bindings: Bindings; Variables: Variables };
  type DomainContext = Context<Env>;
  type ControllerFn = (c: DomainContext) => Promise<TypedResponse>;
  type MiddlewareFn = (
    c: DomainContext,
    next: Next,
    // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  ) => Promise<Response | void>;

  type Variables = {
    dictionary: TranslatorFn;
    daf: IDAF;
    user: {
      id: string;
      email: string;
    };
    timezone: string;
    timezoneOffset: string;
    locale: string;
    inputs: any;
  };

  type Bindings = {
    ENVIRONMENT: 'development' | 'production';
    ENCRYPTION_SECRET: string;
    SIGNING_SECRET: string;

    // Logging
    ENABLE_PERFORMANCE_LOG: boolean;
    ENABLE_ERROR_LOG: boolean;

    // API URLs
    BASE_API_URL: string;
    ERROR_LOGGER_API_URL: string;
    S3_API_URL: string;

    // Databases and Storages
    DB: D1Database;
    R2_BUCKET: R2Bucket;
  };
}