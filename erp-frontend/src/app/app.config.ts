import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ConfirmationService, MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    MessageService,
    ConfirmationService,
    // Restaura la sesión al recargar: si hay token, carga el perfil antes del
    // primer render. Si falla (token vencido sin refresh válido), la app igual
    // arranca y la guard redirige a /login.
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      if (!auth.accessToken) {
        return;
      }
      return firstValueFrom(auth.loadProfile()).catch(() => undefined);
    }),
  ],
};
