/**
 * Error de aplicación con código HTTP. Lo captura el error-handler middleware.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, message, details);
  }
  static unauthorized(message = 'No autenticado') {
    return new AppError(401, message);
  }
  static forbidden(message = 'No autorizado') {
    return new AppError(403, message);
  }
  static notFound(message = 'Recurso no encontrado') {
    return new AppError(404, message);
  }
  static conflict(message: string) {
    return new AppError(409, message);
  }
  static unprocessable(message: string, details?: unknown) {
    return new AppError(422, message, details);
  }
}
