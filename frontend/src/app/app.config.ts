import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';  // ← Added withFetch
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // FIXED: Added withFetch() to suppress NG02801 warning
    // Required when SSR is enabled — tells Angular to use fetch API
    // instead of XMLHttpRequest for better SSR compatibility
    provideHttpClient(withFetch()),

    provideAnimations()
  ]
};
