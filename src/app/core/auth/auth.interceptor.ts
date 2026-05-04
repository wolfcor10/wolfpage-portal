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
  const isLoginRequest = request.url === `${API_BASE_URL}/auth/login`;

  const headers: Record<string, string> = {};

  if (token && !isLoginRequest) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (activeWorkspaceId && !isLoginRequest) {
    headers['X-Workspace-Id'] = activeWorkspaceId;
  }

  const authRequest = Object.keys(headers).length ? request.clone({ setHeaders: headers }) : request;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLoginRequest) {
        auth.logout();
        void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }

      return throwError(() => error);
    }),
  );
};
