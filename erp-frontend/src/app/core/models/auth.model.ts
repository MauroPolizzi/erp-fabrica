export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  roleId: string;
  permissions: string[];
}

/** Sobre de respuesta uniforme del backend (shared/utils/response.ts). */
export interface ApiResponse<T> {
  data: T;
}
