import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../../config/environment';
import { logger } from './logger';

export interface MailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/** El SMTP es opcional: sin host configurado la app funciona en modo desarrollo. */
export const isMailConfigured = (): boolean => Boolean(env.SMTP_HOST);

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

/**
 * Envía un mail. Nunca lanza: el caller (recuperación de contraseña) debe responder
 * lo mismo haya o no envío, para no filtrar qué direcciones existen.
 *
 * Sin SMTP configurado escribe el contenido en el log. Es el modo de desarrollo:
 * permite completar el flujo copiando el link de la consola, sin servidor de correo.
 */
export async function sendMail(input: MailInput): Promise<boolean> {
  if (!isMailConfigured()) {
    logger.warn('SMTP no configurado: el mail no se envía, se registra en el log', {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return false;
  }

  try {
    await getTransporter().sendMail({
      from: env.MAIL_FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return true;
  } catch (err) {
    logger.error('No se pudo enviar el mail', { err, to: input.to, subject: input.subject });
    return false;
  }
}

/** Aviso temprano al arrancar: en producción el modo log no sirve para el usuario final. */
export function warnIfMailNotConfigured(): void {
  if (!isMailConfigured() && env.NODE_ENV === 'production') {
    logger.error(
      'SMTP_HOST no está configurado: los mails de recuperación de contraseña NO se enviarán.',
    );
  }
}
