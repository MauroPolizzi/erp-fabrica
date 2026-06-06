import 'express';

/** Usuario autenticado adjuntado por el middleware de auth. */
export interface AuthUser {
  id: string;
  email: string;
  roleId: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
