import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface GoogleCredentialResponse {
  credential: string;
}

interface GooglePromptNotification {
  isNotDisplayed(): boolean;
  isSkippedMoment(): boolean;
}

interface GoogleAccountsId {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
  }): void;
  prompt(callback?: (notification: GooglePromptNotification) => void): void;
  cancel(): void;
}

interface GoogleApi {
  accounts: {
    id: GoogleAccountsId;
  };
}

declare global {
  interface Window {
    google?: GoogleApi;
  }
}

@Injectable({ providedIn: 'root' })
export class GoogleIdentityService {
  private scriptLoad?: Promise<void>;

  get isConfigured(): boolean {
    return environment.googleClientId.trim().length > 0;
  }

  signIn(): Observable<string> {
    return new Observable<string>((observer) => {
      if (!this.isConfigured) {
        observer.error(new Error('Google authentication is not configured.'));
        return undefined;
      }

      this.loadScript()
        .then(() => {
          window.google?.accounts.id.initialize({
            client_id: environment.googleClientId,
            auto_select: false,
            callback: (response) => {
              observer.next(response.credential);
              observer.complete();
            },
          });

          window.google?.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              observer.error(new Error('Google sign-in was not displayed.'));
            }
          });
        })
        .catch((error: unknown) => observer.error(error));

      return () => window.google?.accounts.id.cancel();
    });
  }

  private loadScript(): Promise<void> {
    if (window.google?.accounts.id) {
      return Promise.resolve();
    }

    if (this.scriptLoad) {
      return this.scriptLoad;
    }

    this.scriptLoad = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google Identity Services could not be loaded.'));
      document.head.appendChild(script);
    });

    return this.scriptLoad;
  }
}
