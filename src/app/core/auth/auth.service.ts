import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api/api.config';
import { CurrentUser, LoginRequest, LoginResponse } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'wolfpage.access_token';
  private readonly userKey = 'wolfpage.current_user';
  private readonly expiresAtKey = 'wolfpage.expires_at';
  private readonly currentUserSubject = new BehaviorSubject<CurrentUser | null>(this.readUser());

  readonly currentUser$ = this.currentUserSubject.asObservable();

  get currentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, request).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.accessToken);
        localStorage.setItem(this.expiresAtKey, response.expiresAt);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      }),
    );
  }

  loadProfile(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${API_BASE_URL}/auth/me`).pipe(
      tap((user) => {
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.expiresAtKey);
    this.currentUserSubject.next(null);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const expiresAt = localStorage.getItem(this.expiresAtKey);

    if (!token || !expiresAt) {
      return false;
    }

    if (Date.parse(expiresAt) <= Date.now()) {
      this.logout();
      return false;
    }

    return true;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.roles.includes(role) ?? false;
  }

  private readUser(): CurrentUser | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as CurrentUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
