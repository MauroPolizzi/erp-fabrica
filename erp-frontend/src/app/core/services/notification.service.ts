import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Notificaciones al usuario vía PrimeNG MessageService.
 * Requiere un <p-toast> en el layout y MessageService provisto en app.config.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messages = inject(MessageService);

  success(detail: string, summary = 'Éxito'): void {
    this.messages.add({ severity: 'success', summary, detail });
  }

  error(detail: string, summary = 'Error'): void {
    this.messages.add({ severity: 'error', summary, detail });
  }

  info(detail: string, summary = 'Información'): void {
    this.messages.add({ severity: 'info', summary, detail });
  }

  warn(detail: string, summary = 'Atención'): void {
    this.messages.add({ severity: 'warn', summary, detail });
  }
}
