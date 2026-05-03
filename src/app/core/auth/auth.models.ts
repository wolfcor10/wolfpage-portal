export interface LoginRequest {
  email: string;
  password: string;
  tenantId?: string;
}

export interface CurrentUser {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  user: CurrentUser;
}
