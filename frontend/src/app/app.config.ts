import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-bottom-left',
      preventDuplicates: true,
      progressBar: true,
      progressAnimation: 'decreasing',
      closeButton: true,
      newestOnTop: true,
      maxOpened: 3,
      autoDismiss: true,
      enableHtml: false,
      toastClass: 'ngx-toastr',
      titleClass: 'toast-title',
      messageClass: 'toast-message',
      tapToDismiss: true,
      easeTime: 300,
      easing: 'ease-in'
    })
  ]
};
