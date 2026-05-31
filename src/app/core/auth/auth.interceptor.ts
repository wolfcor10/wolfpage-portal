import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../api/api.config';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getAccessToken();
  const activeWorkspaceId = auth.getActiveWorkspaceId();
  const isPublicAuthRequest =
    request.url === `${API_BASE_URL}/auth/login` ||
    request.url === `${API_BASE_URL}/auth/register` ||
    request.url === `${API_BASE_URL}/auth/confirm-email` ||
    request.url === `${API_BASE_URL}/auth/resend-confirmation` ||
    request.url === `${API_BASE_URL}/auth/google`;

  const headers: Record<string, string> = {};

  if (token && !isPublicAuthRequest) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (activeWorkspaceId && !isPublicAuthRequest) {
    headers['X-Workspace-Id'] = activeWorkspaceId;
  }

  const authRequest = Object.keys(headers).length ? request.clone({ setHeaders: headers }) : request;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublicAuthRequest) {
        auth.logout();
        void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }

      return throwError(() => error);
    }),
  );
};
