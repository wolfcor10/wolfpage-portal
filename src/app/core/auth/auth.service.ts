import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api/api.config';
import {
  ConfirmEmailRequest,
  CurrentUser,
  EmailConfirmationResponse,
  GoogleAuthRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResendEmailConfirmationRequest,
} from './auth.models';

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
      tap((response) => this.storeSession(response)),
    );
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${API_BASE_URL}/auth/register`, request).pipe(
      tap((response) => {
        if (response.session) {
          this.storeSession(response.session);
        }
      }),
    );
  }

  confirmEmail(request: ConfirmEmailRequest): Observable<EmailConfirmationResponse> {
    return this.http.post<EmailConfirmationResponse>(`${API_BASE_URL}/auth/confirm-email`, request);
  }

  resendEmailConfirmation(
    request: ResendEmailConfirmationRequest,
  ): Observable<EmailConfirmationResponse> {
    return this.http.post<EmailConfirmationResponse>(
      `${API_BASE_URL}/auth/resend-confirmation`,
      request,
    );
  }

  loginWithGoogle(request: GoogleAuthRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/google`, request).pipe(
      tap((response) => this.storeSession(response)),
    );
  }

  setActiveWorkspace(workspaceId: string): void {
    const user = this.currentUser;
    const workspace = user?.workspaces.find((item) => item.id === workspaceId);

    if (!user || !workspace) {
      return;
    }

    const nextUser: CurrentUser = {
      ...user,
      activeWorkspaceId: workspace.id,
      roles: workspace.roles,
    };

    localStorage.setItem(this.userKey, JSON.stringify(nextUser));
    this.currentUserSubject.next(nextUser);
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

  getActiveWorkspaceId(): string | null {
    return this.currentUser?.activeWorkspaceId ?? null;
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

  private storeSession(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.accessToken);
    localStorage.setItem(this.expiresAtKey, response.expiresAt);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }
}
