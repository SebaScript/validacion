import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    // Log error for debugging in development only
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.error(err);
    }
  });
